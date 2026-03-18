import { X } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";

const GIFS = [
  { id: "g1", emoji: "❤️", label: "Love", frames: ["❤️", "💕", "💖", "❤️"] },
  { id: "g2", emoji: "😂", label: "LOL", frames: ["😂", "🤣", "😂", "🤣"] },
  { id: "g3", emoji: "💃", label: "Dance", frames: ["💃", "🕺", "💃", "🕺"] },
  { id: "g4", emoji: "🎉", label: "Party", frames: ["🎉", "🎊", "🥳", "🎉"] },
  { id: "g5", emoji: "🌹", label: "Rose", frames: ["🌹", "🌷", "🌸", "🌹"] },
  { id: "g6", emoji: "😘", label: "Kiss", frames: ["😘", "💋", "😘", "💋"] },
  { id: "g7", emoji: "🔥", label: "Fire", frames: ["🔥", "✨", "🔥", "💫"] },
  { id: "g8", emoji: "🤩", label: "Wow", frames: ["🤩", "😍", "🤩", "😍"] },
  {
    id: "g9",
    emoji: "🥺",
    label: "Miss you",
    frames: ["🥺", "😢", "🥺", "💔"],
  },
  { id: "g10", emoji: "🙏", label: "Thanks", frames: ["🙏", "💯", "🙏", "💯"] },
  { id: "g11", emoji: "👑", label: "Queen", frames: ["👑", "💎", "👑", "✨"] },
  { id: "g12", emoji: "🦋", label: "Fly", frames: ["🦋", "🌈", "🦋", "🌟"] },
];

function AnimatedGif({
  frames,
  size = 40,
}: { frames: string[]; size?: number }) {
  return (
    <motion.div
      className="flex items-center justify-center rounded-xl cursor-pointer hover:scale-110 transition-transform"
      style={{ width: size, height: size, fontSize: size * 0.6 }}
      animate={{ opacity: [1, 0.7, 1] }}
      transition={{ duration: 0.8, repeat: Number.POSITIVE_INFINITY }}
    >
      {frames[0]}
    </motion.div>
  );
}

interface Props {
  open: boolean;
  onClose: () => void;
  onSelect: (text: string) => void;
}

export default function GifPicker({ open, onClose, onSelect }: Props) {
  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            key="gif-backdrop"
            className="fixed inset-0 z-40"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />
          <motion.div
            key="gif-sheet"
            data-ocid="messages.sheet"
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", damping: 28, stiffness: 300 }}
            className="fixed inset-x-0 bottom-0 z-50 rounded-t-3xl overflow-hidden flex flex-col"
            style={{ background: "#0f0f1a", maxHeight: "60dvh" }}
          >
            <div className="flex items-center justify-between px-4 py-3 border-b border-white/8">
              <p className="text-white font-bold text-sm">
                🎬 GIFs & Reactions
              </p>
              <button
                type="button"
                data-ocid="messages.close_button"
                onClick={onClose}
                className="w-7 h-7 rounded-full bg-white/10 flex items-center justify-center"
              >
                <X className="w-3.5 h-3.5 text-white" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-3">
              <div className="grid grid-cols-4 gap-2">
                {GIFS.map((gif) => (
                  <button
                    key={gif.id}
                    type="button"
                    onClick={() => {
                      onSelect(`${gif.emoji} ${gif.label}`);
                      onClose();
                    }}
                    className="flex flex-col items-center gap-1 p-2 rounded-xl hover:bg-white/8 active:scale-90 transition-all"
                  >
                    <AnimatedGif frames={gif.frames} />
                    <span className="text-white/50 text-[10px]">
                      {gif.label}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
