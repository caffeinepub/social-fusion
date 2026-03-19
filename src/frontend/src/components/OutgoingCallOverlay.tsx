import { PhoneOff } from "lucide-react";
import { motion } from "motion/react";
import { useEffect, useState } from "react";
import type { Profile } from "../backend";

interface Props {
  profile: Profile;
  mode: "voice" | "video";
  onCancel: () => void;
}

export default function OutgoingCallOverlay({
  profile,
  mode,
  onCancel,
}: Props) {
  const [elapsed, setElapsed] = useState(0);

  useEffect(() => {
    const t = setInterval(() => setElapsed((e) => e + 1), 1000);
    return () => clearInterval(t);
  }, []);

  // Auto-cancel after 30s
  useEffect(() => {
    if (elapsed >= 30) onCancel();
  }, [elapsed, onCancel]);

  const statusText =
    elapsed < 5 ? "Calling..." : elapsed < 20 ? "Ringing..." : "No answer...";

  return (
    <motion.div
      data-ocid="call.modal"
      initial={{ opacity: 0, y: 80 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 80 }}
      transition={{ duration: 0.35, ease: "easeOut" }}
      className="fixed inset-0 z-[100] flex flex-col items-center justify-between bg-gradient-to-b from-slate-900/95 via-slate-900/98 to-black/98 backdrop-blur-sm px-8 py-16"
    >
      <div className="flex flex-col items-center gap-1">
        <p className="text-white/50 text-sm tracking-widest uppercase">
          {mode === "video" ? "Video Call" : "Voice Call"}
        </p>
      </div>

      <div className="flex flex-col items-center gap-6">
        <div className="relative">
          <motion.div
            className="absolute inset-0 rounded-full border-2 border-purple-400/40"
            animate={{ scale: [1, 1.4, 1], opacity: [0.8, 0, 0.8] }}
            transition={{ duration: 1.8, repeat: Number.POSITIVE_INFINITY }}
          />
          <motion.div
            className="absolute inset-0 rounded-full border-2 border-purple-400/20"
            animate={{ scale: [1, 1.8, 1], opacity: [0.5, 0, 0.5] }}
            transition={{
              duration: 1.8,
              repeat: Number.POSITIVE_INFINITY,
              delay: 0.5,
            }}
          />
          <div className="w-32 h-32 rounded-full overflow-hidden ring-4 ring-white/10">
            {profile.avatar ? (
              <img
                src={profile.avatar.getDirectURL()}
                alt={profile.displayName}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-pink-500 to-purple-600 flex items-center justify-center text-5xl font-bold text-white">
                {profile.displayName[0]?.toUpperCase()}
              </div>
            )}
          </div>
        </div>
        <div className="text-center">
          <h2 className="text-white text-3xl font-bold">
            {profile.displayName}
          </h2>
          <motion.p
            key={statusText}
            className="text-white/50 text-base mt-2"
            animate={{ opacity: [1, 0.4, 1] }}
            transition={{ duration: 1.5, repeat: Number.POSITIVE_INFINITY }}
          >
            {statusText}
          </motion.p>
          <p className="text-white/20 text-xs mt-1">{elapsed}s</p>
        </div>
      </div>

      <div className="flex flex-col items-center gap-2">
        <button
          type="button"
          data-ocid="call.cancel_button"
          onClick={onCancel}
          className="w-[4.5rem] h-[4.5rem] rounded-full bg-red-500 flex items-center justify-center shadow-lg shadow-red-500/40 active:scale-95 transition-transform"
        >
          <PhoneOff className="w-7 h-7 text-white" />
        </button>
        <span className="text-white/50 text-sm">Cancel</span>
      </div>
    </motion.div>
  );
}
