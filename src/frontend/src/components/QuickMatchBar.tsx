import { motion } from "motion/react";

interface Props {
  onPass: () => void;
  onUndo: () => void;
  onSuperLike: () => void;
  onBoost: () => void;
}

export default function QuickMatchBar({
  onPass,
  onUndo,
  onSuperLike,
  onBoost,
}: Props) {
  return (
    <div className="flex items-center justify-center gap-4 py-2">
      <motion.button
        type="button"
        data-ocid="discover.delete_button"
        onClick={onPass}
        whileTap={{ scale: 0.8, rotate: -10 }}
        className="w-14 h-14 rounded-full flex items-center justify-center shadow-lg"
        style={{
          background: "rgba(255,255,255,0.08)",
          border: "1px solid rgba(255,255,255,0.12)",
        }}
      >
        <span className="text-xl">✕</span>
      </motion.button>

      <motion.button
        type="button"
        data-ocid="discover.secondary_button"
        onClick={onUndo}
        whileTap={{ scale: 0.8 }}
        className="w-11 h-11 rounded-full flex items-center justify-center shadow-lg"
        style={{
          background: "rgba(251,191,36,0.15)",
          border: "1px solid rgba(251,191,36,0.3)",
        }}
        title="Undo"
      >
        <span className="text-lg">↩</span>
      </motion.button>

      <motion.button
        type="button"
        data-ocid="discover.primary_button"
        onClick={onSuperLike}
        whileTap={{ scale: 0.8, rotate: 10 }}
        className="w-14 h-14 rounded-full flex items-center justify-center shadow-lg"
        style={{
          background: "linear-gradient(135deg, #3b82f6, #6366f1)",
          boxShadow: "0 4px 20px rgba(59,130,246,0.5)",
        }}
        title="Super Like"
      >
        <span className="text-2xl">⭐</span>
      </motion.button>

      <motion.button
        type="button"
        data-ocid="discover.toggle"
        onClick={onBoost}
        whileTap={{ scale: 0.8 }}
        className="w-11 h-11 rounded-full flex items-center justify-center shadow-lg"
        style={{
          background: "rgba(168,85,247,0.2)",
          border: "1px solid rgba(168,85,247,0.4)",
        }}
        title="Boost"
      >
        <span className="text-lg">🚀</span>
      </motion.button>
    </div>
  );
}
