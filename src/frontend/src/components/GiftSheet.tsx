import { X } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";

interface Props {
  open: boolean;
  onClose: () => void;
  recipientName?: string;
}

const GIFTS = [
  { emoji: "🌹", name: "Rose", coins: 10 },
  { emoji: "💎", name: "Diamond", coins: 100 },
  { emoji: "👑", name: "Crown", coins: 500 },
  { emoji: "🔥", name: "Fire", coins: 50 },
  { emoji: "⭐", name: "Star", coins: 25 },
  { emoji: "🦄", name: "Unicorn", coins: 200 },
  { emoji: "💖", name: "Heart", coins: 15 },
  { emoji: "🏆", name: "Trophy", coins: 300 },
];

export default function GiftSheet({
  open,
  onClose,
  recipientName = "them",
}: Props) {
  const handleSend = (_gift: (typeof GIFTS)[0]) => {
    onClose();
  };

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            key="gift-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 z-50"
            onClick={onClose}
          />
          <motion.div
            key="gift-sheet"
            data-ocid="gift.sheet"
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", damping: 26, stiffness: 300 }}
            className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[430px] bg-[#12121e] border-t border-white/10 rounded-t-3xl z-50 pb-8"
          >
            {/* Handle */}
            <div className="flex justify-center pt-3 pb-1">
              <div className="w-10 h-1 rounded-full bg-white/20" />
            </div>

            {/* Header */}
            <div className="flex items-center justify-between px-5 py-3">
              <div>
                <h3 className="text-white font-bold text-lg">Send a Gift</h3>
                <p className="text-white/40 text-sm">to {recipientName}</p>
              </div>
              <div className="flex items-center gap-3">
                <div className="bg-yellow-500/20 border border-yellow-500/30 px-3 py-1.5 rounded-full flex items-center gap-1.5">
                  <span className="text-sm">💰</span>
                  <span className="text-yellow-400 text-sm font-bold">
                    1,250
                  </span>
                </div>
                <button
                  type="button"
                  data-ocid="gift.close_button"
                  onClick={onClose}
                  className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center"
                >
                  <X className="w-4 h-4 text-white" />
                </button>
              </div>
            </div>

            {/* Gift grid */}
            <div className="grid grid-cols-4 gap-3 px-5 pt-2">
              {GIFTS.map((gift) => (
                <button
                  key={gift.name}
                  type="button"
                  data-ocid="gift.primary_button"
                  onClick={() => handleSend(gift)}
                  className="flex flex-col items-center gap-1.5 bg-white/5 border border-white/8 rounded-2xl p-3 active:scale-95 transition-transform hover:bg-white/10"
                >
                  <span className="text-3xl">{gift.emoji}</span>
                  <span className="text-white/80 text-xs font-medium">
                    {gift.name}
                  </span>
                  <span className="text-yellow-400 text-xs font-bold">
                    {gift.coins}c
                  </span>
                </button>
              ))}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
