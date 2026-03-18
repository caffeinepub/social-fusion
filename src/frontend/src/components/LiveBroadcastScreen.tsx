import { Button } from "@/components/ui/button";
import { ArrowLeft, Mic, MicOff, X } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useEffect, useRef, useState } from "react";

interface Props {
  onBack: () => void;
}

const FAKE_COMMENTS = [
  { name: "Sofia R.", msg: "❤️ amazing!" },
  { name: "Jake M.", msg: "🔥 love this" },
  { name: "Priya K.", msg: "😍 you're so cute" },
  { name: "Alex T.", msg: "👏 incredible" },
  { name: "Luna W.", msg: "keep going! 💕" },
  { name: "Marcus J.", msg: "🔥🔥🔥" },
  { name: "Bella S.", msg: "first time watching, love it!" },
  { name: "Kai O.", msg: "✨ vibes are immaculate" },
  { name: "Yuna L.", msg: "hi from Korea! 🇰🇷" },
  { name: "Dmitri V.", msg: "❤️❤️❤️" },
];

interface Comment {
  id: number;
  name: string;
  msg: string;
}

interface FloatingEmoji {
  id: number;
  emoji: string;
  x: number;
}

export default function LiveBroadcastScreen({ onBack }: Props) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [floatingEmojis, setFloatingEmojis] = useState<FloatingEmoji[]>([]);
  const [viewers, setViewers] = useState(247);
  const [audioOnly, setAudioOnly] = useState(false);
  const [joinRequested, setJoinRequested] = useState(false);
  const [guestJoined, setGuestJoined] = useState(false);
  const commentIdRef = useRef(0);
  const emojiIdRef = useRef(0);
  const commentsEndRef = useRef<HTMLDivElement>(null);

  // Auto-add fake comments
  useEffect(() => {
    const interval = setInterval(() => {
      const fake =
        FAKE_COMMENTS[Math.floor(Math.random() * FAKE_COMMENTS.length)];
      commentIdRef.current += 1;
      setComments((prev) => [
        ...prev.slice(-30),
        { id: commentIdRef.current, ...fake },
      ]);
      setViewers((v) => v + Math.floor(Math.random() * 3) - 1);
    }, 2200);
    return () => clearInterval(interval);
  }, []);

  // Auto-scroll comments
  // biome-ignore lint/correctness/useExhaustiveDependencies: commentsEndRef is stable
  useEffect(() => {
    commentsEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [comments]);

  const handleEmojiTap = (emoji: string) => {
    emojiIdRef.current += 1;
    const id = emojiIdRef.current;
    const x = 20 + Math.random() * 60;
    setFloatingEmojis((prev) => [...prev, { id, emoji, x }]);
    setTimeout(() => {
      setFloatingEmojis((prev) => prev.filter((e) => e.id !== id));
    }, 1400);
  };

  const handleJoinRequest = () => {
    setJoinRequested(true);
    // Simulate grant after 3s
    setTimeout(() => setGuestJoined(true), 3000);
  };

  return (
    <div
      data-ocid="live.page"
      className="relative flex flex-col h-full bg-black overflow-hidden"
    >
      {/* Camera area */}
      {guestJoined ? (
        <div className="flex flex-col flex-1 overflow-hidden">
          {/* Host video */}
          <div
            className="flex-1 relative"
            style={{
              background:
                "linear-gradient(135deg, #2d0050 0%, #0a0a0f 50%, #3d0000 100%)",
            }}
          >
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-8xl opacity-30">📷</span>
            </div>
            <div className="absolute bottom-2 left-3 bg-black/60 px-2 py-1 rounded-full text-white text-xs font-semibold">
              You (Host)
            </div>
          </div>
          {/* Guest video */}
          <div
            className="flex-1 relative"
            style={{
              background:
                "linear-gradient(135deg, #003d2e 0%, #0a0a0f 50%, #1a0030 100%)",
            }}
          >
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-8xl opacity-30">📷</span>
            </div>
            <div className="absolute bottom-2 left-3 bg-black/60 px-2 py-1 rounded-full text-white text-xs font-semibold">
              Guest
            </div>
          </div>
        </div>
      ) : (
        <div
          className="flex-1 relative"
          style={{
            background:
              "linear-gradient(135deg, #2d0050 0%, #0a0a0f 40%, #3d0000 100%)",
          }}
        >
          <div
            className="absolute inset-0 opacity-30"
            style={{
              backgroundImage:
                "radial-gradient(circle at 30% 40%, #ff0080 0%, transparent 50%), radial-gradient(circle at 70% 60%, #7c3aed 0%, transparent 50%)",
            }}
          />
          {audioOnly && (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="flex flex-col items-center gap-3">
                <div className="w-24 h-24 rounded-full bg-gradient-to-br from-pink-500 to-purple-600 flex items-center justify-center">
                  <Mic className="w-10 h-10 text-white" />
                </div>
                <p className="text-white/60 text-sm">Audio Only Mode</p>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Floating emojis */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <AnimatePresence>
          {floatingEmojis.map((fe) => (
            <motion.span
              key={fe.id}
              initial={{ opacity: 1, y: 0, scale: 0.8 }}
              animate={{ opacity: 0, y: -200, scale: 1.4 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 1.3, ease: "easeOut" }}
              className="absolute bottom-40 text-3xl"
              style={{ left: `${fe.x}%` }}
            >
              {fe.emoji}
            </motion.span>
          ))}
        </AnimatePresence>
      </div>

      {/* Top bar */}
      <div className="absolute top-0 left-0 right-0 flex items-center justify-between px-4 pt-5 pb-3 z-20">
        <div className="flex items-center gap-2">
          <button
            type="button"
            data-ocid="live.close_button"
            onClick={onBack}
            className="w-8 h-8 rounded-full bg-black/40 flex items-center justify-center"
          >
            <ArrowLeft className="w-4 h-4 text-white" />
          </button>
          <div className="flex items-center gap-1.5 bg-red-500 px-2.5 py-1 rounded-full">
            <span className="w-2 h-2 rounded-full bg-white animate-pulse" />
            <span className="text-white text-xs font-bold">LIVE</span>
          </div>
          <div className="bg-black/40 px-2.5 py-1 rounded-full flex items-center gap-1">
            <span className="text-white/80 text-xs">👁 {viewers}</span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            data-ocid="live.toggle"
            onClick={() => setAudioOnly((a) => !a)}
            className={`w-9 h-9 rounded-full flex items-center justify-center ${
              audioOnly ? "bg-pink-500" : "bg-black/40"
            }`}
          >
            {audioOnly ? (
              <MicOff className="w-4 h-4 text-white" />
            ) : (
              <Mic className="w-4 h-4 text-white" />
            )}
          </button>
          <button
            type="button"
            data-ocid="live.delete_button"
            onClick={onBack}
            className="w-9 h-9 rounded-full bg-black/40 flex items-center justify-center"
          >
            <X className="w-4 h-4 text-white" />
          </button>
        </div>
      </div>

      {/* Bottom panel */}
      <div className="absolute bottom-0 left-0 right-0 z-20">
        {/* Comments */}
        <div className="h-44 px-4 overflow-y-auto no-scrollbar flex flex-col justify-end">
          <AnimatePresence initial={false}>
            {comments.map((c) => (
              <motion.div
                key={c.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="flex items-start gap-2 mb-1.5"
              >
                <span className="text-xs bg-white/20 text-white/90 rounded-full px-2 py-0.5 shrink-0 font-semibold">
                  {c.name}
                </span>
                <span className="text-white/80 text-xs">{c.msg}</span>
              </motion.div>
            ))}
          </AnimatePresence>
          <div ref={commentsEndRef} />
        </div>

        {/* Emoji bar + Join button */}
        <div className="bg-gradient-to-t from-black/80 to-transparent px-4 pb-6 pt-2">
          <div className="flex items-center justify-between">
            <div className="flex gap-2">
              {["❤️", "🔥", "😍", "👏"].map((emoji) => (
                <button
                  key={emoji}
                  type="button"
                  data-ocid="live.primary_button"
                  onClick={() => handleEmojiTap(emoji)}
                  className="w-11 h-11 rounded-full bg-white/10 flex items-center justify-center text-xl active:scale-90 transition-transform"
                >
                  {emoji}
                </button>
              ))}
            </div>
            {!guestJoined && (
              <Button
                data-ocid="live.secondary_button"
                onClick={handleJoinRequest}
                disabled={joinRequested}
                className="bg-gradient-to-r from-pink-500 to-purple-600 text-white text-xs px-4 h-9 rounded-full border-0"
              >
                {joinRequested ? "Requested!" : "Request to Join"}
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
