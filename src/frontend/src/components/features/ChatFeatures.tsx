import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { Switch } from "@/components/ui/switch";
import { Clock, Heart, Send, Smile } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";

// ── Feature 3: Poll in Chat ───────────────────────────────────────────────────
interface PollOption {
  text: string;
  votes: number;
}
export function ChatPollModal({
  onClose,
  onSend,
}: {
  onClose: () => void;
  onSend: (poll: { question: string; options: PollOption[] }) => void;
}) {
  const [question, setQuestion] = useState("");
  const [opts, setOpts] = useState(["Option 1", "Option 2"]);
  const send = () => {
    if (!question.trim()) return;
    onSend({ question, options: opts.map((t) => ({ text: t, votes: 0 })) });
    onClose();
  };
  return (
    <motion.div
      data-ocid="poll.modal"
      className="fixed inset-0 z-50 bg-black/80 flex items-end"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <div
        className="bg-[#1a1a2e] border-t border-white/10 rounded-t-3xl p-5 w-full"
        role="presentation"
        onClick={(e) => e.stopPropagation()}
        onKeyDown={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-4">
          <p className="text-white font-bold text-lg">📊 Create Poll</p>
          <button
            type="button"
            data-ocid="poll.close_button"
            onClick={onClose}
            className="text-white/40"
          >
            ✕
          </button>
        </div>
        <Input
          data-ocid="poll.input"
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          placeholder="Ask a question..."
          className="bg-white/5 border-white/10 text-white mb-3"
        />
        <div className="flex flex-col gap-2 mb-3">
          {opts.map((o, i) => (
            <Input
              // biome-ignore lint/suspicious/noArrayIndexKey: poll options indexed
              key={`pollopt-create-${i}`}
              value={o}
              onChange={(e) =>
                setOpts((prev) =>
                  prev.map((x, j) => (j === i ? e.target.value : x)),
                )
              }
              placeholder={`Option ${i + 1}`}
              className="bg-white/5 border-white/10 text-white"
            />
          ))}
        </div>
        {opts.length < 4 && (
          <button
            type="button"
            onClick={() => setOpts((o) => [...o, ""])}
            className="text-sm text-pink-400 mb-3"
          >
            + Add option
          </button>
        )}
        <Button
          data-ocid="poll.submit_button"
          onClick={send}
          className="w-full bg-gradient-to-r from-pink-500 to-purple-600 border-0 text-white"
        >
          <Send className="w-4 h-4 mr-2" /> Send Poll
        </Button>
      </div>
    </motion.div>
  );
}

export function PollMessage({
  question,
  options,
}: { question: string; options: PollOption[] }) {
  const [votes, setVotes] = useState(options.map((o) => o.votes));
  const [voted, setVoted] = useState<number | null>(null);
  const total = votes.reduce((a, b) => a + b, 0);
  const vote = (i: number) => {
    if (voted !== null) return;
    setVotes((v) => v.map((val, j) => (j === i ? val + 1 : val)));
    setVoted(i);
  };
  return (
    <div className="bg-white/5 border border-white/10 rounded-2xl p-3 max-w-xs">
      <p className="text-white font-semibold text-sm mb-2">📊 {question}</p>
      <div className="flex flex-col gap-1.5">
        {options.map((opt, i) => (
          <button
            // biome-ignore lint/suspicious/noArrayIndexKey: poll options indexed
            key={`pollopt-${i}`}
            type="button"
            onClick={() => vote(i)}
            className="relative overflow-hidden rounded-xl text-left"
          >
            {voted !== null && (
              <motion.div
                initial={{ width: 0 }}
                animate={{
                  width: `${total ? Math.round((votes[i] / total) * 100) : 0}%`,
                }}
                className={`absolute inset-y-0 left-0 ${voted === i ? "bg-pink-500/40" : "bg-white/10"}`}
              />
            )}
            <div className="relative flex items-center justify-between px-3 py-2 border border-white/10 rounded-xl">
              <span className="text-white/80 text-xs">{opt.text}</span>
              {voted !== null && (
                <span className="text-white/50 text-xs">
                  {total ? Math.round((votes[i] / total) * 100) : 0}%
                </span>
              )}
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}

// ── Feature 4: Disappearing Messages ─────────────────────────────────────────
export function DisappearingMessageToggle({
  onChange,
}: { onChange?: (mode: string) => void }) {
  const [mode, setMode] = useState("off");
  const update = (v: string) => {
    setMode(v);
    onChange?.(v);
  };
  return (
    <div className="flex items-center justify-between p-3 bg-white/5 rounded-xl">
      <div className="flex items-center gap-2">
        <Clock className="w-4 h-4 text-orange-400" />
        <div>
          <p className="text-white/80 text-sm">Disappearing Messages</p>
          <p className="text-white/40 text-xs">
            {mode === "off" ? "Off" : mode === "24h" ? "24 hours" : "7 days"}
          </p>
        </div>
      </div>
      <Switch
        data-ocid="disappearing.switch"
        checked={mode !== "off"}
        onCheckedChange={(v) => update(v ? "24h" : "off")}
      />
    </div>
  );
}

export function DisappearingHeader({ mode }: { mode: string }) {
  if (mode === "off") return null;
  return (
    <div className="flex items-center justify-center gap-1.5 py-1.5 bg-orange-500/10 border-b border-orange-500/20">
      <Clock className="w-3 h-3 text-orange-400" />
      <span className="text-orange-400 text-xs">
        Messages disappear after {mode}
      </span>
    </div>
  );
}

// ── Feature 5: Chat Wallpaper ─────────────────────────────────────────────────
const WALLPAPERS = [
  { id: "default", label: "Default", bg: "#0a0a0f", preview: "#0a0a0f" },
  {
    id: "aurora",
    label: "Aurora",
    bg: "linear-gradient(135deg, #0a0a2e 0%, #1a0a3e 50%, #0a1a2e 100%)",
    preview: "#1a0a3e",
  },
  {
    id: "sunset",
    label: "Sunset",
    bg: "linear-gradient(135deg, #1a0505 0%, #2d0015 50%, #1a0505 100%)",
    preview: "#2d0015",
  },
  {
    id: "forest",
    label: "Forest",
    bg: "linear-gradient(135deg, #050a05 0%, #0a1a0a 50%, #050a05 100%)",
    preview: "#0a1a0a",
  },
  {
    id: "galaxy",
    label: "Galaxy",
    bg: "linear-gradient(135deg, #05000a 0%, #150020 50%, #05000a 100%)",
    preview: "#150020",
  },
  {
    id: "ocean",
    label: "Ocean",
    bg: "linear-gradient(135deg, #000510 0%, #001525 50%, #000510 100%)",
    preview: "#001525",
  },
];
export { WALLPAPERS as CHAT_WALLPAPERS };
export function ChatWallpaperPicker({
  onSelect,
}: { onSelect: (bg: string) => void }) {
  const [selected, setSelected] = useState("default");
  const select = (wp: (typeof WALLPAPERS)[0]) => {
    setSelected(wp.id);
    onSelect(wp.bg);
  };
  return (
    <div className="p-3">
      <p className="text-white/60 text-xs mb-3 font-medium">Chat Wallpaper</p>
      <div className="grid grid-cols-3 gap-2">
        {WALLPAPERS.map((wp) => (
          <button
            key={wp.id}
            type="button"
            data-ocid="wallpaper.toggle"
            onClick={() => select(wp)}
            className={`h-16 rounded-xl overflow-hidden relative border-2 transition-all ${selected === wp.id ? "border-pink-500" : "border-white/10"}`}
            style={{ background: wp.bg }}
          >
            <div className="absolute inset-0 flex items-end justify-center pb-1.5">
              <span className="text-white/70 text-[10px] bg-black/40 px-1.5 py-0.5 rounded-full">
                {wp.label}
              </span>
            </div>
            {selected === wp.id && (
              <div className="absolute top-1 right-1 w-4 h-4 rounded-full bg-pink-500 flex items-center justify-center">
                <span className="text-white text-[8px] font-bold">✓</span>
              </div>
            )}
          </button>
        ))}
      </div>
    </div>
  );
}

// ── Feature 28: Love Letter ───────────────────────────────────────────────────
export function LoveLetterModal({
  onClose,
  onSend,
}: { onClose: () => void; onSend: (msg: string) => void }) {
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [sent, setSent] = useState(false);
  const TEMPLATES = [
    "Every moment with you feels like a dream. 💕",
    "You are the reason I smile every morning. ☀️",
    "Distance means nothing when someone means everything. 💖",
    "I fell in love with the way you laugh. 🥰",
  ];
  const send = () => {
    if (!message.trim()) return;
    onSend(`💌 ${message}`);
    setSent(true);
    setTimeout(() => {
      setSent(false);
      setOpen(false);
      onClose();
    }, 1500);
  };
  return (
    <>
      <button
        type="button"
        data-ocid="loveletter.open_modal_button"
        onClick={() => setOpen(true)}
        className="flex flex-col items-center gap-1 px-3 py-2 rounded-xl bg-pink-500/10 hover:bg-pink-500/20 transition-colors"
      >
        <span className="text-xl">💌</span>
        <span className="text-[10px] text-pink-400">Love Letter</span>
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            data-ocid="loveletter.modal"
            className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              initial={{ scale: 0.8, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              className="w-full max-w-sm"
            >
              {/* Envelope */}
              <div className="relative bg-gradient-to-br from-[#2d1a0f] to-[#1a0d0a] border border-[#8b4513]/40 rounded-3xl overflow-hidden shadow-2xl">
                <div className="absolute top-0 left-0 right-0 h-20 overflow-hidden">
                  <div
                    className="w-full h-full"
                    style={{
                      background:
                        "linear-gradient(135deg, #c8860a 0%, #8b4513 50%, #c8860a 100%)",
                      clipPath: "polygon(0 0, 100% 0, 50% 100%)",
                    }}
                  />
                </div>
                <div className="pt-20 p-5">
                  <div className="flex items-center gap-2 mb-4">
                    <span className="text-2xl">💌</span>
                    <p className="text-[#c8860a] font-bold text-lg">
                      Love Letter
                    </p>
                  </div>
                  <div className="flex flex-col gap-2 mb-3">
                    {TEMPLATES.map((t) => (
                      <button
                        key={t}
                        type="button"
                        onClick={() => setMessage(t)}
                        className="text-left text-xs text-[#c8a060]/80 bg-[#c8860a]/10 px-3 py-2 rounded-xl hover:bg-[#c8860a]/20 transition-colors"
                      >
                        {t}
                      </button>
                    ))}
                  </div>
                  <textarea
                    data-ocid="loveletter.textarea"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Write your message..."
                    rows={3}
                    className="w-full bg-[#c8860a]/10 border border-[#c8860a]/20 rounded-xl p-3 text-[#f5deb3] text-sm resize-none outline-none placeholder:text-[#c8860a]/40"
                  />
                  <div className="flex gap-2 mt-3">
                    <Button
                      data-ocid="loveletter.cancel_button"
                      variant="ghost"
                      onClick={() => setOpen(false)}
                      className="flex-1 text-white/50"
                    >
                      Cancel
                    </Button>
                    <Button
                      data-ocid="loveletter.submit_button"
                      onClick={send}
                      className="flex-1 bg-gradient-to-r from-[#c8860a] to-[#8b4513] border-0 text-white"
                    >
                      {sent ? (
                        "Sent! 💕"
                      ) : (
                        <>
                          <Send className="w-3.5 h-3.5 mr-1.5" />
                          Send
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

// ── Feature 29: Custom Reactions ─────────────────────────────────────────────
const EXTRA_REACTIONS = [
  ["🦋", "🌺", "🌙", "⭐", "🎯", "💎"],
  ["🦄", "🌈", "✨", "🎭", "🎪", "🎠"],
  ["👑", "🍀", "🎋", "🌸", "🎆", "🎇"],
];
export function CustomReactionPanel({
  onReact,
}: { onReact: (emoji: string) => void }) {
  const [showPremium, setShowPremium] = useState(false);
  const BASE = ["❤️", "🔥", "😂", "😮", "😢", "👏"];
  return (
    <div className="flex flex-col gap-3">
      <div className="flex gap-2">
        {BASE.map((e) => (
          <button
            key={e}
            type="button"
            onClick={() => onReact(e)}
            className="text-2xl hover:scale-125 transition-transform active:scale-90"
          >
            {e}
          </button>
        ))}
        <button
          type="button"
          data-ocid="reactions.toggle"
          onClick={() => setShowPremium((p) => !p)}
          className="w-9 h-9 rounded-full bg-gradient-to-br from-pink-500/20 to-purple-500/20 border border-pink-500/30 flex items-center justify-center"
        >
          <Smile className="w-4 h-4 text-pink-400" />
        </button>
      </div>
      <AnimatePresence>
        {showPremium && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <p className="text-xs text-purple-400 mb-2">✨ Premium Reactions</p>
            {EXTRA_REACTIONS.map((row, ri) => (
              // biome-ignore lint/suspicious/noArrayIndexKey: reaction rows static
              <div key={`row-${ri}`} className="flex gap-2 mb-1.5">
                {row.map((e) => (
                  <button
                    key={e}
                    type="button"
                    onClick={() => onReact(e)}
                    className="text-2xl hover:scale-125 transition-transform active:scale-90"
                  >
                    {e}
                  </button>
                ))}
              </div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ── Feature 16: Chat Theme per Conversation (bubble colors) ──────────────────
const BUBBLE_THEMES = [
  { id: "default", label: "Default", sent: "#ec4899", received: "#1e1e2e" },
  { id: "ocean", label: "Ocean", sent: "#0ea5e9", received: "#0c1a2e" },
  { id: "forest", label: "Forest", sent: "#10b981", received: "#0a1a0a" },
  { id: "sunset", label: "Sunset", sent: "#f97316", received: "#1a0a05" },
  { id: "violet", label: "Violet", sent: "#8b5cf6", received: "#150a2e" },
  { id: "gold", label: "Gold", sent: "#f59e0b", received: "#1a1005" },
];
export { BUBBLE_THEMES };
export function BubbleThemePicker({
  onSelect,
}: { onSelect: (t: (typeof BUBBLE_THEMES)[0]) => void }) {
  const [selected, setSelected] = useState("default");
  return (
    <div className="p-3">
      <p className="text-white/60 text-xs mb-3 font-medium">Bubble Colors</p>
      <div className="grid grid-cols-3 gap-2">
        {BUBBLE_THEMES.map((t) => (
          <button
            key={t.id}
            type="button"
            data-ocid="bubble_theme.toggle"
            onClick={() => {
              setSelected(t.id);
              onSelect(t);
            }}
            className={`flex flex-col items-center gap-1 p-2 rounded-xl border-2 transition-all ${selected === t.id ? "border-pink-500" : "border-white/10"}`}
          >
            <div className="flex gap-1">
              <div
                className="w-5 h-5 rounded-full"
                style={{ background: t.sent }}
              />
              <div
                className="w-5 h-5 rounded-full"
                style={{ background: t.received }}
              />
            </div>
            <span className="text-white/50 text-[10px]">{t.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
