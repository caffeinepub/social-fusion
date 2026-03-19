import { X } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";

interface Props {
  open: boolean;
  onClose: () => void;
  recipientName?: string;
  onSend?: (gift: { emoji: string; name: string; coins: number }) => void;
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
  onSend,
}: Props) {
  const handleSend = (gift: (typeof GIFTS)[0]) => {
    onSend?.(gift);
    onClose();
  };

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            key="gift-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/70 z-50"
            onClick={onClose}
          />

          {/* Centered modal */}
          <div className="fixed inset-0 z-50 flex items-center justify-center pointer-events-none">
            <motion.div
              key="gift-modal"
              data-ocid="gift.modal"
              initial={{ opacity: 0, scale: 0.85 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.85 }}
              transition={{ type: "spring", damping: 24, stiffness: 300 }}
              className="max-w-[360px] w-full mx-4 bg-[#12121e] rounded-3xl border border-white/10 shadow-2xl p-5 pointer-events-auto"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="flex items-center justify-between mb-4">
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
              <div className="grid grid-cols-4 gap-3">
                {GIFTS.map((gift) => (
                  <button
                    key={gift.name}
                    type="button"
                    data-ocid="gift.primary_button"
                    onClick={() => handleSend(gift)}
                    className="flex flex-col items-center gap-1.5 bg-white/5 border border-white/10 rounded-2xl p-3 active:scale-95 transition-transform hover:bg-white/10"
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
          </div>
        </>
      )}
    </AnimatePresence>
  );
}
