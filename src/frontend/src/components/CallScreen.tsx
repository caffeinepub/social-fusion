import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Camera,
  Mic,
  MicOff,
  Phone,
  PhoneOff,
  RotateCcw,
  Speaker,
  Video,
  VideoOff,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useEffect, useRef, useState } from "react";
import type { Profile } from "../backend";

interface Props {
  mode: "voice" | "video";
  otherProfile: Profile;
  onEnd: () => void;
}

export default function CallScreen({ mode, otherProfile, onEnd }: Props) {
  const [muted, setMuted] = useState(false);
  const [speakerOn, setSpeakerOn] = useState(true);
  const [videoOff, setVideoOff] = useState(false);
  const [status, setStatus] = useState<"calling" | "connected">("calling");
  const [duration, setDuration] = useState(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    const connectTimeout = setTimeout(() => {
      setStatus("connected");
      intervalRef.current = setInterval(() => {
        setDuration((d) => d + 1);
      }, 1000);
    }, 2000);
    return () => {
      clearTimeout(connectTimeout);
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

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
            formatDuration={formatDuration}
            onMute={() => setMuted((m) => !m)}
            onSpeaker={() => setSpeakerOn((s) => !s)}
            onVideoToggle={() => setVideoOff((v) => !v)}
            onEnd={onEnd}
          />
        ) : (
          <VoiceCallLayout
            otherProfile={otherProfile}
            status={status}
            duration={duration}
            muted={muted}
            speakerOn={speakerOn}
            formatDuration={formatDuration}
            onMute={() => setMuted((m) => !m)}
            onSpeaker={() => setSpeakerOn((s) => !s)}
            onEnd={onEnd}
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
  return (
    <div className="flex-1 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex flex-col items-center justify-between px-8 py-16">
      <div className="flex flex-col items-center gap-6">
        <motion.div
          animate={{ scale: status === "calling" ? [1, 1.05, 1] : 1 }}
          transition={{
            repeat: status === "calling" ? Number.POSITIVE_INFINITY : 0,
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
          <p className="text-white/60 text-sm mt-1">
            {status === "calling" ? "Calling..." : formatDuration(duration)}
          </p>
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
          icon={speakerOn ? Speaker : Speaker}
          label="Speaker"
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
  formatDuration: (s: number) => string;
  onMute: () => void;
  onSpeaker: () => void;
  onVideoToggle: () => void;
  onEnd: () => void;
}) {
  return (
    <div className="flex-1 bg-black relative flex flex-col">
      {/* Fake camera feed */}
      <div className="flex-1 bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 flex items-center justify-center">
        {status === "calling" ? (
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
            <p className="text-white/80 text-sm">Calling...</p>
          </div>
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 opacity-60" />
        )}
      </div>

      {/* Duration */}
      {status === "connected" && (
        <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-black/50 text-white text-sm px-3 py-1 rounded-full">
          {formatDuration(duration)}
        </div>
      )}

      {/* Other person avatar top-right */}
      <div className="absolute top-4 right-4">
        <Avatar className="w-14 h-14 ring-2 ring-white/20">
          {otherProfile.avatar && (
            <AvatarImage src={otherProfile.avatar.getDirectURL()} />
          )}
          <AvatarFallback className="bg-slate-700 text-white text-sm">
            {otherProfile.displayName[0]?.toUpperCase()}
          </AvatarFallback>
        </Avatar>
      </div>

      {/* My small preview bottom-right */}
      <div className="absolute bottom-24 right-4 w-20 h-28 rounded-xl bg-gradient-to-br from-slate-700 to-slate-600 ring-2 ring-white/10 overflow-hidden flex items-center justify-center">
        {videoOff ? (
          <VideoOff className="w-6 h-6 text-white/40" />
        ) : (
          <div className="text-2xl">🤳</div>
        )}
      </div>

      {/* Controls */}
      <div className="absolute bottom-8 left-0 right-0 flex items-center justify-center gap-5">
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
          icon={speakerOn ? Speaker : Speaker}
          label="Speaker"
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
