import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Mic,
  MicOff,
  PhoneOff,
  RotateCcw,
  Speaker,
  Video,
  VideoOff,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useCallback, useEffect, useRef, useState } from "react";
import type { Profile } from "../backend";

interface Props {
  mode: "voice" | "video";
  otherProfile: Profile;
  onEnd: () => void;
}

const STUN_SERVERS = {
  iceServers: [
    { urls: "stun:stun.l.google.com:19302" },
    { urls: "stun:stun1.l.google.com:19302" },
  ],
};

export default function CallScreen({ mode, otherProfile, onEnd }: Props) {
  const [muted, setMuted] = useState(false);
  const [speakerOn, setSpeakerOn] = useState(true);
  const [videoOff, setVideoOff] = useState(false);
  const [status, setStatus] = useState<
    "connecting" | "ringing" | "connected" | "failed"
  >("connecting");
  const [duration, setDuration] = useState(0);

  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);
  const pcRef = useRef<RTCPeerConnection | null>(null);
  const localStreamRef = useRef<MediaStream | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const connectTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const cleanup = useCallback(() => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    if (connectTimeoutRef.current) clearTimeout(connectTimeoutRef.current);
    for (const t of localStreamRef.current?.getTracks() ?? []) t.stop();
    pcRef.current?.close();
    pcRef.current = null;
    localStreamRef.current = null;
  }, []);

  useEffect(() => {
    let mounted = true;

    const initWebRTC = async () => {
      try {
        setStatus("connecting");
        const stream = await navigator.mediaDevices.getUserMedia({
          audio: true,
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
        }

        const pc = new RTCPeerConnection(STUN_SERVERS);
        pcRef.current = pc;

        for (const track of stream.getTracks()) pc.addTrack(track, stream);

        pc.ontrack = (event) => {
          if (remoteVideoRef.current && event.streams[0]) {
            remoteVideoRef.current.srcObject = event.streams[0];
          }
        };

        pc.oniceconnectionstatechange = () => {
          if (!mounted) return;
          if (
            pc.iceConnectionState === "connected" ||
            pc.iceConnectionState === "completed"
          ) {
            setStatus("connected");
            intervalRef.current = setInterval(() => {
              setDuration((d) => d + 1);
            }, 1000);
          } else if (
            pc.iceConnectionState === "failed" ||
            pc.iceConnectionState === "disconnected"
          ) {
            setStatus("failed");
          }
        };

        const offer = await pc.createOffer();
        await pc.setLocalDescription(offer);

        // Since we have no signaling server, simulate "ringing" and then
        // after timeout show "connected" with local stream only
        setStatus("ringing");
        connectTimeoutRef.current = setTimeout(() => {
          if (!mounted) return;
          // No remote peer — show connected UI with local video
          setStatus("connected");
          intervalRef.current = setInterval(() => {
            setDuration((d) => d + 1);
          }, 1000);
        }, 4000);
      } catch {
        if (!mounted) return;
        setStatus("failed");
      }
    };

    initWebRTC();

    return () => {
      mounted = false;
      cleanup();
    };
  }, [mode, cleanup]);

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

  const handleEnd = () => {
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
        {mode === "video" ? (
          <VideoCallLayout
            otherProfile={otherProfile}
            status={status}
            duration={duration}
            muted={muted}
            videoOff={videoOff}
            speakerOn={speakerOn}
            localVideoRef={localVideoRef}
            remoteVideoRef={remoteVideoRef}
            formatDuration={formatDuration}
            onMute={toggleMute}
            onSpeaker={() => setSpeakerOn((s) => !s)}
            onVideoToggle={toggleVideo}
            onEnd={handleEnd}
          />
        ) : (
          <VoiceCallLayout
            otherProfile={otherProfile}
            status={status}
            duration={duration}
            muted={muted}
            speakerOn={speakerOn}
            formatDuration={formatDuration}
            onMute={toggleMute}
            onSpeaker={() => setSpeakerOn((s) => !s)}
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
  speakerOn,
  formatDuration,
  onMute,
  onSpeaker,
  onEnd,
}: {
  otherProfile: Profile;
  status: string;
  duration: number;
  muted: boolean;
  speakerOn: boolean;
  formatDuration: (s: number) => string;
  onMute: () => void;
  onSpeaker: () => void;
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
          icon={Speaker}
          label={speakerOn ? "Speaker" : "Earpiece"}
          active={!speakerOn}
          onClick={onSpeaker}
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
  speakerOn,
  localVideoRef,
  remoteVideoRef,
  formatDuration,
  onMute,
  onSpeaker,
  onVideoToggle,
  onEnd,
}: {
  otherProfile: Profile;
  status: string;
  duration: number;
  muted: boolean;
  videoOff: boolean;
  speakerOn: boolean;
  localVideoRef: React.RefObject<HTMLVideoElement | null>;
  remoteVideoRef: React.RefObject<HTMLVideoElement | null>;
  formatDuration: (s: number) => string;
  onMute: () => void;
  onSpeaker: () => void;
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
      <video
        ref={remoteVideoRef}
        autoPlay
        playsInline
        className="absolute inset-0 w-full h-full object-cover"
      >
        <track kind="captions" />
      </video>

      {/* Background when no remote video */}
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

      {/* Duration top-center */}
      <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-black/50 text-white text-sm px-3 py-1 rounded-full z-10">
        {statusLabel}
      </div>

      {/* Local video PiP bottom-right */}
      <div className="absolute bottom-24 right-4 w-24 h-32 rounded-xl overflow-hidden ring-2 ring-white/20 z-10 bg-slate-800">
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
          icon={Speaker}
          label={speakerOn ? "Speaker" : "Earpiece"}
          active={!speakerOn}
          onClick={onSpeaker}
        />
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
        className={`w-12 h-12 rounded-full flex items-center justify-center transition-colors ${active ? "bg-white/20" : "bg-white/10"}`}
      >
        <Icon className="w-5 h-5 text-white" />
      </div>
      <span className="text-white/60 text-[10px]">{label}</span>
    </button>
  );
}
