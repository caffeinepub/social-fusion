import { Phone, PhoneOff, Video } from "lucide-react";
import { motion } from "motion/react";
import type { Profile } from "../backend";

interface Props {
  profile?: Profile;
  mode: "voice" | "video";
  onAccept: () => void;
  onReject: () => void;
}

export default function IncomingCallOverlay({
  profile,
  mode,
  onAccept,
  onReject,
}: Props) {
  return (
    <motion.div
      data-ocid="call.modal"
      initial={{ opacity: 0, y: 80 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 80 }}
      transition={{ duration: 0.35, ease: "easeOut" }}
      className="fixed inset-0 z-[100] flex flex-col items-center justify-between bg-gradient-to-b from-slate-900/95 via-slate-900/98 to-black/98 backdrop-blur-sm px-8 py-16"
    >
      {/* Top: incoming call label */}
      <div className="flex flex-col items-center gap-1">
        <p className="text-white/50 text-sm tracking-widest uppercase">
          {mode === "video" ? "Incoming Video Call" : "Incoming Voice Call"}
        </p>
      </div>

      {/* Center: avatar + name */}
      <div className="flex flex-col items-center gap-6">
        <div className="relative">
          {/* Pulsing rings */}
          <motion.div
            className="absolute inset-0 rounded-full border-2 border-green-400/40"
            animate={{ scale: [1, 1.4, 1], opacity: [0.8, 0, 0.8] }}
            transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY }}
          />
          <motion.div
            className="absolute inset-0 rounded-full border-2 border-green-400/20"
            animate={{ scale: [1, 1.7, 1], opacity: [0.5, 0, 0.5] }}
            transition={{
              duration: 2,
              repeat: Number.POSITIVE_INFINITY,
              delay: 0.4,
            }}
          />
          <div className="w-32 h-32 rounded-full overflow-hidden ring-4 ring-white/10">
            {profile?.avatar ? (
              <img
                src={profile?.avatar?.getDirectURL()}
                alt={profile?.displayName ?? "Caller"}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-pink-500 to-purple-600 flex items-center justify-center text-5xl font-bold text-white">
                {profile?.displayName[0]?.toUpperCase() ?? "?"}
              </div>
            )}
          </div>
        </div>
        <div className="text-center">
          <h2 className="text-white text-3xl font-bold">
            {profile?.displayName ?? "Unknown Caller"}
          </h2>
          {profile?.location && (
            <p className="text-white/40 text-sm mt-1">📍 {profile?.location}</p>
          )}
        </div>
      </div>

      {/* Bottom: Reject & Accept buttons */}
      <div className="flex items-center justify-around w-full max-w-xs">
        {/* Reject */}
        <div className="flex flex-col items-center gap-2">
          <button
            type="button"
            data-ocid="call.cancel_button"
            onClick={onReject}
            className="w-18 h-18 w-[4.5rem] h-[4.5rem] rounded-full bg-red-500 flex items-center justify-center shadow-lg shadow-red-500/40 active:scale-95 transition-transform"
          >
            <PhoneOff className="w-7 h-7 text-white" />
          </button>
          <span className="text-white/50 text-sm">Decline</span>
        </div>

        {/* Accept */}
        <div className="flex flex-col items-center gap-2">
          <button
            type="button"
            data-ocid="call.confirm_button"
            onClick={onAccept}
            className="w-[4.5rem] h-[4.5rem] rounded-full bg-green-500 flex items-center justify-center shadow-lg shadow-green-500/40 active:scale-95 transition-transform"
          >
            {mode === "video" ? (
              <Video className="w-7 h-7 text-white" />
            ) : (
              <Phone className="w-7 h-7 text-white" />
            )}
          </button>
          <span className="text-white/50 text-sm">Accept</span>
        </div>
      </div>
    </motion.div>
  );
}
