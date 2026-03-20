import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import type { Principal } from "@icp-sdk/core/principal";
import {
  Mic,
  MicOff,
  PhoneOff,
  RotateCcw,
  Video,
  VideoOff,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useCallback, useEffect, useRef, useState } from "react";
import type { Profile, backendInterface } from "../backend";

interface Props {
  mode: "voice" | "video";
  role?: "caller" | "callee";
  callId?: string;
  otherProfile: Profile;
  otherPrincipal?: Principal;
  actor?: backendInterface | null;
  onEnd: () => void;
}

const STUN_SERVERS = {
  iceServers: [
    { urls: "stun:stun.l.google.com:19302" },
    { urls: "stun:stun1.l.google.com:19302" },
    { urls: "stun:stun2.l.google.com:19302" },
    { urls: "stun:stun3.l.google.com:19302" },
  ],
};

function sdpToBase64(sdp: RTCSessionDescriptionInit): string {
  return btoa(unescape(encodeURIComponent(JSON.stringify(sdp))));
}
function base64ToSdp(b64: string): RTCSessionDescriptionInit {
  return JSON.parse(decodeURIComponent(escape(atob(b64))));
}
function iceToBase64(c: RTCIceCandidate): string {
  return btoa(unescape(encodeURIComponent(JSON.stringify(c.toJSON()))));
}
function base64ToIce(b64: string): RTCIceCandidateInit {
  return JSON.parse(decodeURIComponent(escape(atob(b64))));
}

export default function CallScreen({
  mode,
  role = "caller",
  callId = `call-${Date.now()}`,
  otherProfile,
  otherPrincipal,
  actor,
  onEnd,
}: Props) {
  const [muted, setMuted] = useState(false);
  const [videoOff, setVideoOff] = useState(false);
  const [status, setStatus] = useState<
    "connecting" | "ringing" | "connected" | "failed"
  >("connecting");
  const [duration, setDuration] = useState(0);

  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);
  const remoteAudioRef = useRef<HTMLAudioElement>(null);
  const pcRef = useRef<RTCPeerConnection | null>(null);
  const localStreamRef = useRef<MediaStream | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const processedMsgs = useRef<Set<string>>(new Set());
  const pendingCandidates = useRef<RTCIceCandidateInit[]>([]);
  const remoteDescSet = useRef(false);
  const actorRef = useRef(actor);
  actorRef.current = actor;
  const otherPrincipalRef = useRef(otherPrincipal);
  otherPrincipalRef.current = otherPrincipal;

  const cleanup = useCallback(() => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    for (const t of localStreamRef.current?.getTracks() ?? []) t.stop();
    pcRef.current?.close();
    pcRef.current = null;
    localStreamRef.current = null;
  }, []);

  const addPendingCandidates = useCallback(async (pc: RTCPeerConnection) => {
    for (const c of pendingCandidates.current) {
      try {
        await pc.addIceCandidate(new RTCIceCandidate(c));
      } catch {}
    }
    pendingCandidates.current = [];
  }, []);

  // Init WebRTC
  useEffect(() => {
    let mounted = true;

    const init = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          audio: {
            echoCancellation: true,
            noiseSuppression: true,
            sampleRate: 44100,
          },
          video:
            mode === "video"
              ? { facingMode: "user", width: 640, height: 480 }
              : false,
        });

        if (!mounted) {
          for (const t of stream.getTracks()) t.stop();
          return;
        }

        localStreamRef.current = stream;

        if (mode === "video" && localVideoRef.current) {
          localVideoRef.current.srcObject = stream;
          localVideoRef.current.muted = true;
        }

        const pc = new RTCPeerConnection(STUN_SERVERS);
        pcRef.current = pc;

        for (const track of stream.getTracks()) pc.addTrack(track, stream);

        pc.ontrack = (event) => {
          if (!mounted) return;
          const remoteStream = event.streams[0];
          if (mode === "video" && remoteVideoRef.current) {
            remoteVideoRef.current.srcObject = remoteStream;
            remoteVideoRef.current.play().catch(() => {});
          }
          // Always connect audio
          if (remoteAudioRef.current) {
            remoteAudioRef.current.srcObject = remoteStream;
            remoteAudioRef.current.play().catch(() => {});
          }
        };

        pc.onicecandidate = async (event) => {
          if (!event.candidate || !mounted) return;
          const other = otherPrincipalRef.current;
          if (!other) return;
          const ice64 = iceToBase64(event.candidate);
          try {
            await actorRef.current?.sendMessage(
              other,
              `__SF_ICE__|${callId}|${ice64}`,
            );
          } catch {}
        };

        pc.oniceconnectionstatechange = () => {
          if (!mounted) return;
          const state = pc.iceConnectionState;
          if (state === "connected" || state === "completed") {
            setStatus("connected");
            intervalRef.current = setInterval(
              () => setDuration((d) => d + 1),
              1000,
            );
          } else if (state === "failed" || state === "closed") {
            setStatus("failed");
          }
        };

        if (role === "caller") {
          const offer = await pc.createOffer();
          await pc.setLocalDescription(offer);
          const other = otherPrincipalRef.current;
          if (other) {
            const offerB64 = sdpToBase64(offer);
            await actorRef.current?.sendMessage(
              other,
              `__SF_SDP_OFFER__|${callId}|${offerB64}`,
            );
          }
          setStatus("ringing");
        } else {
          // callee: wait for offer via polling
          setStatus("connecting");
        }
      } catch {
        if (!mounted) return;
        setStatus("failed");
      }
    };

    init();
    return () => {
      mounted = false;
      cleanup();
    };
  }, [mode, role, callId, cleanup]);

  // Signaling poll
  useEffect(() => {
    const other = otherPrincipal;
    if (!other) return;
    let mounted = true;

    const poll = async () => {
      try {
        const msgs = await actorRef.current?.getMessages(other);
        if (!msgs || !mounted) return;

        const sorted = [...msgs]
          .sort((a, b) => Number(b.timestamp - a.timestamp))
          .slice(0, 30);

        for (const msg of sorted) {
          if (msg.from.toString() !== other.toString()) continue;
          const key = `${msg.timestamp}-${msg.content.slice(0, 40)}`;
          if (processedMsgs.current.has(key)) continue;

          const pc = pcRef.current;

          // Caller receives answer
          if (
            role === "caller" &&
            msg.content.startsWith(`__SF_SDP_ANSWER__|${callId}|`)
          ) {
            processedMsgs.current.add(key);
            if (pc && !remoteDescSet.current) {
              try {
                const b64 = msg.content.split("|")[2];
                const answer = base64ToSdp(b64);
                await pc.setRemoteDescription(
                  new RTCSessionDescription(answer),
                );
                remoteDescSet.current = true;
                await addPendingCandidates(pc);
              } catch {}
            }
          }

          // Callee receives offer
          if (
            role === "callee" &&
            msg.content.startsWith(`__SF_SDP_OFFER__|${callId}|`)
          ) {
            processedMsgs.current.add(key);
            if (pc && !remoteDescSet.current) {
              try {
                const b64 = msg.content.split("|")[2];
                const offer = base64ToSdp(b64);
                await pc.setRemoteDescription(new RTCSessionDescription(offer));
                remoteDescSet.current = true;
                await addPendingCandidates(pc);
                const answer = await pc.createAnswer();
                await pc.setLocalDescription(answer);
                const answerB64 = sdpToBase64(answer);
                await actorRef.current?.sendMessage(
                  other,
                  `__SF_SDP_ANSWER__|${callId}|${answerB64}`,
                );
                setStatus("ringing");
              } catch {}
            }
          }

          // ICE candidates
          if (msg.content.startsWith(`__SF_ICE__|${callId}|`)) {
            processedMsgs.current.add(key);
            if (pc) {
              try {
                const b64 = msg.content.split("|")[2];
                const candidate = base64ToIce(b64);
                if (remoteDescSet.current) {
                  await pc.addIceCandidate(new RTCIceCandidate(candidate));
                } else {
                  pendingCandidates.current.push(candidate);
                }
              } catch {}
            }
          }

          // Call ended by other side
          if (msg.content.startsWith(`__SF_CALL_END__|${callId}`)) {
            processedMsgs.current.add(key);
            cleanup();
            if (mounted) onEnd();
          }
        }
      } catch {}
    };

    const timer = setInterval(poll, 2000);
    poll();
    return () => {
      mounted = false;
      clearInterval(timer);
    };
  }, [otherPrincipal, role, callId, cleanup, onEnd, addPendingCandidates]);

  const toggleMute = () => {
    const stream = localStreamRef.current;
    if (!stream) return;
    for (const t of stream.getAudioTracks()) t.enabled = muted;
    setMuted((m) => !m);
  };

  const toggleVideo = () => {
    const stream = localStreamRef.current;
    if (!stream) return;
    for (const t of stream.getVideoTracks()) t.enabled = videoOff;
    setVideoOff((v) => !v);
  };

  const handleEnd = async () => {
    const other = otherPrincipalRef.current;
    if (other) {
      try {
        await actorRef.current?.sendMessage(other, `__SF_CALL_END__|${callId}`);
      } catch {}
    }
    cleanup();
    onEnd();
  };

  const formatDuration = (secs: number) => {
    const m = Math.floor(secs / 60)
      .toString()
      .padStart(2, "0");
    const s = (secs % 60).toString().padStart(2, "0");
    return `${m}:${s}`;
  };

  return (
    <AnimatePresence>
      <motion.div
        key="call-screen"
        data-ocid="call.modal"
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 40 }}
        transition={{ duration: 0.3 }}
        className="fixed inset-0 z-50 flex flex-col"
      >
        {/* Hidden audio for remote stream on voice calls */}
        {/* biome-ignore lint/a11y/useMediaCaption: remote audio */}
        <audio ref={remoteAudioRef} autoPlay playsInline />

        {mode === "video" ? (
          <VideoCallLayout
            otherProfile={otherProfile}
            status={status}
            duration={duration}
            muted={muted}
            videoOff={videoOff}
            localVideoRef={localVideoRef}
            remoteVideoRef={remoteVideoRef}
            formatDuration={formatDuration}
            onMute={toggleMute}
            onVideoToggle={toggleVideo}
            onEnd={handleEnd}
          />
        ) : (
          <VoiceCallLayout
            otherProfile={otherProfile}
            status={status}
            duration={duration}
            muted={muted}
            formatDuration={formatDuration}
            onMute={toggleMute}
            onEnd={handleEnd}
          />
        )}
      </motion.div>
    </AnimatePresence>
  );
}

function VoiceCallLayout({
  otherProfile,
  status,
  duration,
  muted,
  formatDuration,
  onMute,
  onEnd,
}: {
  otherProfile: Profile;
  status: string;
  duration: number;
  muted: boolean;
  formatDuration: (s: number) => string;
  onMute: () => void;
  onEnd: () => void;
}) {
  const statusLabel =
    status === "connecting"
      ? "Connecting..."
      : status === "ringing"
        ? "Ringing..."
        : status === "failed"
          ? "Call failed"
          : formatDuration(duration);

  return (
    <div className="flex-1 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex flex-col items-center justify-between px-8 py-16">
      <div className="flex flex-col items-center gap-6">
        <motion.div
          animate={{ scale: status === "connected" ? 1 : [1, 1.05, 1] }}
          transition={{
            repeat: status === "connected" ? 0 : Number.POSITIVE_INFINITY,
            duration: 1.5,
          }}
        >
          <div className="relative">
            <div className="absolute inset-0 rounded-full bg-primary/20 animate-ping" />
            <Avatar className="w-28 h-28 ring-4 ring-white/10">
              {otherProfile.avatar && (
                <AvatarImage src={otherProfile.avatar.getDirectURL()} />
              )}
              <AvatarFallback className="bg-slate-700 text-white text-4xl">
                {otherProfile.displayName[0]?.toUpperCase()}
              </AvatarFallback>
            </Avatar>
          </div>
        </motion.div>
        <div className="text-center">
          <p className="text-white text-2xl font-bold">
            {otherProfile.displayName}
          </p>
          <p className="text-white/60 text-sm mt-1">{statusLabel}</p>
        </div>
      </div>

      <div className="flex items-center gap-6">
        <CallButton
          icon={muted ? MicOff : Mic}
          label={muted ? "Unmute" : "Mute"}
          active={muted}
          onClick={onMute}
        />
        <button
          type="button"
          data-ocid="call.delete_button"
          onClick={onEnd}
          className="w-16 h-16 rounded-full bg-red-500 flex items-center justify-center shadow-lg shadow-red-500/40 hover:bg-red-600 transition-colors"
        >
          <PhoneOff className="w-7 h-7 text-white" />
        </button>
        <CallButton
          icon={Mic}
          label="Speaker"
          active={false}
          onClick={() => {}}
        />
      </div>
    </div>
  );
}

function VideoCallLayout({
  otherProfile,
  status,
  duration,
  muted,
  videoOff,
  localVideoRef,
  remoteVideoRef,
  formatDuration,
  onMute,
  onVideoToggle,
  onEnd,
}: {
  otherProfile: Profile;
  status: string;
  duration: number;
  muted: boolean;
  videoOff: boolean;
  localVideoRef: React.RefObject<HTMLVideoElement | null>;
  remoteVideoRef: React.RefObject<HTMLVideoElement | null>;
  formatDuration: (s: number) => string;
  onMute: () => void;
  onVideoToggle: () => void;
  onEnd: () => void;
}) {
  const isConnecting = status === "connecting" || status === "ringing";
  const statusLabel =
    status === "connecting"
      ? "Connecting..."
      : status === "ringing"
        ? "Ringing..."
        : status === "failed"
          ? "Call failed"
          : formatDuration(duration);

  return (
    <div className="flex-1 bg-black relative flex flex-col">
      {/* Remote video - full screen */}
      {/* biome-ignore lint/a11y/useMediaCaption: video call */}
      <video
        ref={remoteVideoRef}
        autoPlay
        playsInline
        className="absolute inset-0 w-full h-full object-cover"
      />

      {/* Background when not connected */}
      {isConnecting && (
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 flex items-center justify-center">
          <div className="flex flex-col items-center gap-4">
            <motion.div
              animate={{ scale: [1, 1.1, 1] }}
              transition={{ repeat: Number.POSITIVE_INFINITY, duration: 1.5 }}
            >
              <Avatar className="w-24 h-24 ring-4 ring-white/20">
                {otherProfile.avatar && (
                  <AvatarImage src={otherProfile.avatar.getDirectURL()} />
                )}
                <AvatarFallback className="bg-slate-700 text-white text-3xl">
                  {otherProfile.displayName[0]?.toUpperCase()}
                </AvatarFallback>
              </Avatar>
            </motion.div>
            <p className="text-white/80 text-sm">{statusLabel}</p>
          </div>
        </div>
      )}

      {/* Status top */}
      <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-black/50 text-white text-sm px-3 py-1 rounded-full z-10">
        {statusLabel}
      </div>

      {/* Local PiP */}
      <div className="absolute bottom-24 right-4 w-24 h-32 rounded-xl overflow-hidden ring-2 ring-white/20 z-10 bg-slate-800">
        {/* biome-ignore lint/a11y/useMediaCaption: pip preview */}
        <video
          ref={localVideoRef}
          autoPlay
          playsInline
          muted
          className={`w-full h-full object-cover ${videoOff ? "opacity-0" : ""}`}
        />
        {videoOff && (
          <div className="absolute inset-0 flex items-center justify-center bg-slate-800">
            <VideoOff className="w-6 h-6 text-white/40" />
          </div>
        )}
      </div>

      {/* Controls */}
      <div className="absolute bottom-8 left-0 right-0 flex items-center justify-center gap-5 z-10">
        <CallButton
          icon={muted ? MicOff : Mic}
          label={muted ? "Unmute" : "Mute"}
          active={muted}
          onClick={onMute}
        />
        <CallButton
          icon={videoOff ? VideoOff : Video}
          label={videoOff ? "Start Cam" : "Stop Cam"}
          active={videoOff}
          onClick={onVideoToggle}
        />
        <button
          type="button"
          data-ocid="call.delete_button"
          onClick={onEnd}
          className="w-14 h-14 rounded-full bg-red-500 flex items-center justify-center shadow-lg shadow-red-500/40 hover:bg-red-600 transition-colors"
        >
          <PhoneOff className="w-6 h-6 text-white" />
        </button>
        <CallButton
          icon={RotateCcw}
          label="Flip"
          active={false}
          onClick={() => {}}
        />
      </div>
    </div>
  );
}

function CallButton({
  icon: Icon,
  label,
  active,
  onClick,
}: {
  icon: React.FC<{ className?: string }>;
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex flex-col items-center gap-1"
    >
      <div
        className={`w-12 h-12 rounded-full flex items-center justify-center transition-colors ${
          active ? "bg-white/20" : "bg-white/10"
        }`}
      >
        <Icon className="w-5 h-5 text-white" />
      </div>
      <span className="text-white/60 text-[10px]">{label}</span>
    </button>
  );
}
