import { motion } from "motion/react";
import { useEffect, useState } from "react";

const CONFETTI_ITEMS = Array.from({ length: 12 }, (_, i) => ({
  id: i,
  color: ["#ff0080", "#fbbf24", "#06b6d4", "#22c55e", "#a855f7", "#f97316"][
    i % 6
  ],
  x: (Math.random() - 0.5) * 200,
  y: -(40 + Math.random() * 60),
  rotate: Math.random() * 360,
}));

function isTodayBirthday(birthday: string): boolean {
  try {
    const b = new Date(birthday);
    const now = new Date();
    return b.getMonth() === now.getMonth() && b.getDate() === now.getDate();
  } catch {
    return false;
  }
}

export default function BirthdayBanner({ birthday }: { birthday?: string }) {
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (birthday && isTodayBirthday(birthday)) {
      setShow(true);
    }
  }, [birthday]);

  if (!show) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className="relative mx-4 my-2 rounded-2xl overflow-hidden"
      style={{
        background: "linear-gradient(135deg, #1a0a2e, #2d0050)",
        border: "1px solid rgba(236,72,153,0.4)",
      }}
    >
      {/* Confetti */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {CONFETTI_ITEMS.map(({ id, color, x, y, rotate }) => (
          <motion.div
            key={id}
            className="absolute top-1/2 left-1/2 w-2 h-2 rounded-sm"
            style={{ background: color }}
            animate={{
              x: [0, x],
              y: [0, y],
              rotate: [0, rotate],
              opacity: [1, 0],
            }}
            transition={{
              duration: 1.5,
              repeat: Number.POSITIVE_INFINITY,
              delay: (id * 0.12) % 1.5,
              ease: "easeOut",
            }}
          />
        ))}
      </div>
      <div className="relative flex items-center gap-3 px-4 py-3">
        <span className="text-3xl">🎂</span>
        <div>
          <p className="text-white font-bold text-sm">Happy Birthday!</p>
          <p className="text-pink-300/70 text-xs">
            Wishing you a wonderful day! 🎉
          </p>
        </div>
        <button
          type="button"
          onClick={() => setShow(false)}
          className="ml-auto text-white/30 text-lg leading-none"
        >
          ×
        </button>
      </div>
    </motion.div>
  );
}
