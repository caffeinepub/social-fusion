import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Flag, MapPin, Star, Zap } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
import type { Profile } from "../../backend";

// ── Feature 7: Profile Ring (enhanced) ───────────────────────────────────────
export function ProfileRingEnhanced({
  isOnline = false,
  isPremium = false,
  hasStory = false,
  size: _size = 56,
}: {
  isOnline?: boolean;
  isPremium?: boolean;
  hasStory?: boolean;
  size?: number;
}) {
  if (!isOnline && !isPremium && !hasStory) return null;
  const color = hasStory
    ? "linear-gradient(135deg, #ec4899, #a855f7, #ec4899)"
    : isPremium
      ? "linear-gradient(135deg, #f59e0b, #d97706, #f59e0b)"
      : "linear-gradient(135deg, #10b981, #06b6d4, #10b981)";
  return (
    <motion.div
      className="absolute inset-0 rounded-full pointer-events-none"
      animate={
        hasStory ? { opacity: [1, 0.6, 1] } : isPremium ? { rotate: 360 } : {}
      }
      transition={
        hasStory
          ? { duration: 1.5, repeat: Number.POSITIVE_INFINITY }
          : isPremium
            ? { duration: 4, repeat: Number.POSITIVE_INFINITY, ease: "linear" }
            : {}
      }
      style={{
        background: color,
        padding: 2,
        borderRadius: "50%",
        boxShadow: hasStory
          ? "0 0 12px rgba(236,72,153,0.6)"
          : isPremium
            ? "0 0 12px rgba(245,158,11,0.6)"
            : "0 0 8px rgba(16,185,129,0.5)",
      }}
    >
      <div className="w-full h-full rounded-full bg-[#0a0a0f]" />
    </motion.div>
  );
}

// ── Feature 8: Nearby Users section ───────────────────────────────────────────
export function NearbyUsersSection({
  profiles,
  myLocation,
  onUserClick,
}: {
  profiles: [any, Profile][];
  myLocation?: string;
  onUserClick: (p: any) => void;
}) {
  const nearby = profiles
    .filter(
      ([, p]) =>
        p.location &&
        myLocation &&
        p.location
          .toLowerCase()
          .includes(myLocation.toLowerCase().split(",")[0] ?? ""),
    )
    .slice(0, 6);
  if (nearby.length === 0) return null;
  return (
    <div className="px-4 mb-4">
      <div className="flex items-center gap-2 mb-3">
        <MapPin className="w-4 h-4 text-green-400" />
        <h3 className="text-white font-bold text-sm">People Near You</h3>
        <span className="text-xs text-white/40">{nearby.length} found</span>
      </div>
      <div className="flex gap-3 overflow-x-auto pb-1 no-scrollbar">
        {nearby.map(([principal, prof]) => (
          <motion.button
            key={principal.toString()}
            type="button"
            data-ocid="nearby.primary_button"
            whileTap={{ scale: 0.95 }}
            onClick={() => onUserClick(principal)}
            className="flex flex-col items-center gap-1.5 shrink-0"
          >
            <div className="relative">
              <div className="w-14 h-14 rounded-full bg-gradient-to-br from-green-500/20 to-teal-500/20 border-2 border-green-500/30 flex items-center justify-center overflow-hidden">
                {prof.avatar ? (
                  <img
                    src={prof.avatar.getDirectURL()}
                    alt={prof.displayName}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span className="text-xl">
                    {prof.displayName?.[0] ?? "?"}
                  </span>
                )}
              </div>
              <div className="absolute -bottom-0.5 -right-0.5 flex items-center gap-0.5 bg-green-500 text-white text-[8px] px-1 py-0.5 rounded-full">
                <MapPin className="w-2 h-2" /> Near
              </div>
            </div>
            <span className="text-white/60 text-[10px] truncate max-w-[60px]">
              {prof.displayName}
            </span>
          </motion.button>
        ))}
      </div>
    </div>
  );
}

// ── Feature 9: Mutual Interests Badge ────────────────────────────────────────
export function MutualInterestsBadge({
  myInterests,
  theirInterests,
}: {
  myInterests?: string;
  theirInterests?: string;
}) {
  if (!myInterests || !theirInterests) return null;
  const mine = myInterests.split(",").map((s) => s.trim().toLowerCase());
  const theirs = theirInterests.split(",").map((s) => s.trim().toLowerCase());
  const common = mine.filter((i) => theirs.includes(i)).length;
  if (common === 0) return null;
  return (
    <Badge className="bg-cyan-500/20 text-cyan-300 border-cyan-500/30 text-[10px] px-1.5 py-0.5">
      🎯 {common} common
    </Badge>
  );
}

// ── Feature 11: Shake to Match ────────────────────────────────────────────────
export function ShakeToMatchButton({
  onMatch,
}: { onMatch: (name: string) => void }) {
  const [shaking, setShaking] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const names = [
    "Priya S.",
    "Ananya K.",
    "Rohan M.",
    "Dev R.",
    "Sneha P.",
    "Kavya T.",
  ];
  const triggerShake = () => {
    setShaking(true);
    setResult(null);
    setTimeout(() => {
      const name = names[Math.floor(Math.random() * names.length)];
      setResult(name);
      setShaking(false);
      onMatch(name);
    }, 1200);
  };
  return (
    <div className="fixed bottom-24 right-4 z-40 flex flex-col items-end gap-2">
      <AnimatePresence>
        {result && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            className="bg-gradient-to-r from-pink-500 to-purple-600 text-white text-xs font-bold px-4 py-2 rounded-2xl shadow-lg"
          >
            🎲 Try {result}!
          </motion.div>
        )}
      </AnimatePresence>
      <motion.button
        type="button"
        data-ocid="shake.primary_button"
        onClick={triggerShake}
        animate={
          shaking
            ? {
                rotate: [-10, 10, -10, 10, -10, 10, 0],
                scale: [1, 1.1, 1, 1.1, 1, 1.1, 1],
              }
            : { rotate: 0 }
        }
        transition={shaking ? { duration: 0.6 } : {}}
        whileTap={{ scale: 0.9 }}
        className="w-14 h-14 rounded-full shadow-2xl flex items-center justify-center text-2xl"
        style={{ background: "linear-gradient(135deg, #ec4899, #a855f7)" }}
      >
        🎲
      </motion.button>
      <span className="text-white/30 text-[10px] text-center">Shake</span>
    </div>
  );
}

// ── Feature 12: Double Tap to Like handler ────────────────────────────────────
export function useDoubleTap(onDoubleTap: () => void) {
  let lastTap = 0;
  return {
    onClick: () => {
      const now = Date.now();
      if (now - lastTap < 300) onDoubleTap();
      lastTap = now;
    },
  };
}

export function HeartBurst({ onDone }: { onDone: () => void }) {
  return (
    <motion.div
      className="absolute inset-0 flex items-center justify-center pointer-events-none z-20"
      initial={{ opacity: 1 }}
      animate={{ opacity: 0 }}
      transition={{ duration: 0.8 }}
      onAnimationComplete={onDone}
    >
      <motion.span
        className="text-7xl"
        initial={{ scale: 0.3 }}
        animate={{ scale: [0.3, 1.5, 1.2] }}
        transition={{ duration: 0.4 }}
      >
        ❤️
      </motion.span>
      {Array.from({ length: 6 }).map((_, i) => (
        <motion.span
          // biome-ignore lint/suspicious/noArrayIndexKey: static animation particles
          key={`heartburst-particle-${i}`}
          className="absolute text-2xl"
          initial={{ opacity: 1, scale: 0 }}
          animate={{
            opacity: 0,
            scale: 1,
            x: Math.cos((i / 6) * 2 * Math.PI) * 60,
            y: Math.sin((i / 6) * 2 * Math.PI) * 60,
          }}
          transition={{ duration: 0.6, delay: 0.1 }}
        >
          ❤️
        </motion.span>
      ))}
    </motion.div>
  );
}

// ── Feature 19: Super Like ────────────────────────────────────────────────────
export function SuperLikeButton({ onSuperLike }: { onSuperLike: () => void }) {
  const [burst, setBurst] = useState(false);
  const handle = () => {
    setBurst(true);
    onSuperLike();
    setTimeout(() => setBurst(false), 800);
  };
  return (
    <div className="relative">
      <motion.button
        type="button"
        data-ocid="superlike.primary_button"
        onClick={handle}
        whileTap={{ scale: 0.9 }}
        animate={burst ? { rotate: [0, -20, 20, 0] } : {}}
        className="w-14 h-14 rounded-full flex items-center justify-center shadow-lg"
        style={{
          background: "linear-gradient(135deg, #f59e0b, #d97706)",
          boxShadow: burst
            ? "0 0 20px rgba(245,158,11,0.7)"
            : "0 4px 20px rgba(245,158,11,0.3)",
        }}
      >
        <Star className="w-6 h-6 text-white fill-white" />
      </motion.button>
      <AnimatePresence>
        {burst && (
          <motion.div
            initial={{ opacity: 1, scale: 0.5 }}
            animate={{ opacity: 0, scale: 2 }}
            exit={{}}
            className="absolute inset-0 rounded-full bg-yellow-400/30"
          />
        )}
      </AnimatePresence>
    </div>
  );
}

// ── Feature 24: Safe Report ───────────────────────────────────────────────────
const REPORT_CATEGORIES = [
  "Spam",
  "Fake Profile",
  "Inappropriate Content",
  "Harassment",
  "Scam",
  "Other",
];
export function SafeReportButton({ userName }: { userName: string }) {
  const [open, setOpen] = useState(false);
  const [category, setCategory] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const submit = () => {
    if (!category) return;
    setSubmitted(true);
    setTimeout(() => {
      setSubmitted(false);
      setOpen(false);
      setCategory("");
    }, 1500);
  };
  return (
    <>
      <button
        type="button"
        data-ocid="report.open_modal_button"
        onClick={() => setOpen(true)}
        className="w-9 h-9 rounded-full bg-white/5 flex items-center justify-center hover:bg-red-500/10 transition-colors"
      >
        <Flag className="w-4 h-4 text-white/40 hover:text-red-400" />
      </button>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent
          data-ocid="report.dialog"
          className="bg-[#1a1a2e] border-white/10 text-white max-w-xs"
        >
          <DialogHeader>
            <DialogTitle>Report {userName}</DialogTitle>
          </DialogHeader>
          {submitted ? (
            <motion.div
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              className="py-6 flex flex-col items-center gap-3"
            >
              <span className="text-4xl">✅</span>
              <p className="text-green-400 font-semibold">Report submitted</p>
              <p className="text-white/40 text-sm text-center">
                We'll review this and take appropriate action.
              </p>
            </motion.div>
          ) : (
            <div className="flex flex-col gap-2">
              <p className="text-white/50 text-sm">Select a reason:</p>
              {REPORT_CATEGORIES.map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setCategory(cat)}
                  className={`text-left px-3 py-2.5 rounded-xl text-sm transition-colors ${category === cat ? "bg-red-500/20 text-red-300 border border-red-500/30" : "bg-white/5 text-white/70 hover:bg-white/10"}`}
                >
                  {cat}
                </button>
              ))}
              <Button
                data-ocid="report.submit_button"
                onClick={submit}
                disabled={!category}
                className="mt-2 bg-red-600 border-0 text-white"
              >
                <Flag className="w-3.5 h-3.5 mr-2" /> Submit Report
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}

// ── Feature 21: Connection Score ──────────────────────────────────────────────
export function ConnectionScore({ score }: { score: number }) {
  const radius = 28;
  const circumference = 2 * Math.PI * radius;
  const dash = (score / 100) * circumference;
  return (
    <div className="flex flex-col items-center gap-1">
      <div className="relative w-16 h-16">
        <svg
          viewBox="0 0 64 64"
          className="w-full h-full -rotate-90"
          aria-label="Connection score"
          role="img"
        >
          <circle
            cx="32"
            cy="32"
            r={radius}
            fill="none"
            stroke="rgba(255,255,255,0.1)"
            strokeWidth="4"
          />
          <motion.circle
            cx="32"
            cy="32"
            r={radius}
            fill="none"
            stroke="url(#scoreGrad)"
            strokeWidth="4"
            strokeLinecap="round"
            initial={{ strokeDasharray: `0 ${circumference}` }}
            animate={{ strokeDasharray: `${dash} ${circumference - dash}` }}
            transition={{ duration: 1, ease: "easeOut" }}
          />
          <defs>
            <linearGradient id="scoreGrad" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#ec4899" />
              <stop offset="100%" stopColor="#a855f7" />
            </linearGradient>
          </defs>
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-white font-bold text-sm">{score}%</span>
        </div>
      </div>
      <span className="text-white/50 text-[10px]">Connection</span>
    </div>
  );
}
