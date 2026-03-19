import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Gift,
  Heart,
  Mic,
  MicOff,
  PhoneOff,
  Radio,
  Send,
  UserPlus,
  Video,
  VideoOff,
  X,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useEffect, useRef, useState } from "react";
import { useGetCallerProfile } from "../hooks/useQueries";

interface LiveMessage {
  id: string;
  user: string;
  avatar?: string;
  text: string;
  time: number;
}

interface LiveScreenProps {
  mode: "audio" | "video";
  isHost: boolean;
  onEnd: () => void;
  onClose: () => void;
  streamerName?: string;
}

const SIMULATED_USERS = [
  {
    name: "Priya S.",
    messages: ["You look amazing! 😍", "❤️❤️❤️", "When's the next live?"],
  },
  {
    name: "Rahul M.",
    messages: ["Hey! Just joined 👋", "This is so cool!", "🔥🔥"],
  },
  { name: "Anjali K.", messages: ["Love this!", "💋💋", "Queen!"] },
  {
    name: "Dev P.",
    messages: ["Hi everyone!", "Amazing vibe ✨", "Keep going!"],
  },
  {
    name: "Neha R.",
    messages: ["Just joined the live 🥰", "So beautiful!", "💝"],
  },
];

export default function LiveScreen({
  mode,
  isHost,
  onEnd,
  onClose,
  streamerName,
}: LiveScreenProps) {
  const { data: callerProfile } = useGetCallerProfile();
  const [messages, setMessages] = useState<LiveMessage[]>([]);
  const [inputText, setInputText] = useState("");
  const [likeCount, setLikeCount] = useState(42);
  const [viewerCount, setViewerCount] = useState(isHost ? 1 : 8);
  const [likeAnim, setLikeAnim] = useState(false);
  const [joinRequests, setJoinRequests] = useState<string[]>([]);
  const [showJoinPanel, setShowJoinPanel] = useState(false);
  const [audioMuted, setAudioMuted] = useState(false);
  const [videoMuted, setVideoMuted] = useState(false);
  const [showGiftPicker, setShowGiftPicker] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const hostName = streamerName || callerProfile?.displayName || "You";

  // Simulated incoming messages
  useEffect(() => {
    const msgIdx = { current: 0 };

    // Add welcome message
    setTimeout(() => {
      setMessages((prev) => [
        ...prev,
        {
          id: `sys-${Date.now()}`,
          user: "System",
          text: isHost ? "You started a live! 🎉" : `${hostName} is live! 🔴`,
          time: Date.now(),
        },
      ]);
    }, 500);

    const interval = setInterval(
      () => {
        const randomUser =
          SIMULATED_USERS[Math.floor(Math.random() * SIMULATED_USERS.length)];
        const msg =
          randomUser.messages[msgIdx.current % randomUser.messages.length];
        msgIdx.current++;
        setMessages((prev) => [
          ...prev.slice(-30),
          {
            id: `msg-${Date.now()}-${Math.random()}`,
            user: randomUser.name,
            text: msg,
            time: Date.now(),
          },
        ]);
      },
      3500 + Math.random() * 2000,
    );

    return () => clearInterval(interval);
  }, [isHost, hostName]);

  // Viewer count increments
  useEffect(() => {
    const interval = setInterval(() => {
      setViewerCount((v) => v + Math.floor(Math.random() * 3));
    }, 8000);
    return () => clearInterval(interval);
  }, []);

  // Simulated join requests (for host)
  useEffect(() => {
    if (!isHost) return;
    const timeout = setTimeout(() => {
      setJoinRequests(["Priya S.", "Rahul M."]);
    }, 6000);
    return () => clearTimeout(timeout);
  }, [isHost]);

  // Auto scroll messages
  // biome-ignore lint/correctness/useExhaustiveDependencies: messagesEndRef is stable
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = () => {
    if (!inputText.trim()) return;
    setMessages((prev) => [
      ...prev,
      {
        id: `my-${Date.now()}`,
        user: callerProfile?.displayName || "You",
        text: inputText.trim(),
        time: Date.now(),
      },
    ]);
    setInputText("");
  };

  const handleLike = () => {
    setLikeCount((c) => c + 1);
    setLikeAnim(true);
    setTimeout(() => setLikeAnim(false), 600);
  };

  const handleJoinRequest = () => {
    setMessages((prev) => [
      ...prev,
      {
        id: `join-${Date.now()}`,
        user: callerProfile?.displayName || "You",
        text: "✋ Requested to join the live",
        time: Date.now(),
      },
    ]);
  };

  const GIFT_EMOJIS = ["💝", "🎁", "💐", "🍫", "💌", "✨"];

  return (
    <div
      data-ocid="live.modal"
      className="fixed inset-0 z-[200] flex flex-col"
      style={{ background: "#000" }}
    >
      {/* Video/Audio Background */}
      <div className="absolute inset-0">
        {mode === "video" ? (
          <div
            className="w-full h-full"
            style={{
              background:
                "linear-gradient(135deg, #0d0018 0%, #1a0035 40%, #0d001a 100%)",
            }}
          >
            {/* Simulated video - pulsing glow */}
            <div className="absolute inset-0 flex items-center justify-center">
              <motion.div
                animate={{ scale: [1, 1.05, 1], opacity: [0.3, 0.6, 0.3] }}
                transition={{
                  repeat: Number.POSITIVE_INFINITY,
                  duration: 3,
                  ease: "easeInOut",
                }}
                className="w-48 h-48 rounded-full"
                style={{
                  background:
                    "radial-gradient(circle, rgba(236,72,153,0.4) 0%, rgba(168,85,247,0.2) 60%, transparent 100%)",
                }}
              />
            </div>
            <div className="absolute inset-0 flex items-center justify-center">
              <Avatar className="w-32 h-32 border-4 border-pink-500/40">
                {callerProfile?.avatar ? (
                  <AvatarImage src={callerProfile.avatar.getDirectURL()} />
                ) : null}
                <AvatarFallback className="bg-gradient-to-br from-pink-500 to-purple-600 text-white text-4xl font-bold">
                  {hostName[0]?.toUpperCase() || "L"}
                </AvatarFallback>
              </Avatar>
            </div>
          </div>
        ) : (
          // Audio mode - waveform animation
          <div
            className="w-full h-full flex items-center justify-center"
            style={{
              background:
                "linear-gradient(135deg, #0a0a1a 0%, #1a0a2e 50%, #0a1a2e 100%)",
            }}
          >
            <div className="flex flex-col items-center gap-8">
              <motion.div
                animate={{ scale: [1, 1.08, 1] }}
                transition={{
                  repeat: Number.POSITIVE_INFINITY,
                  duration: 2,
                  ease: "easeInOut",
                }}
                className="relative"
              >
                <div
                  className="absolute -inset-6 rounded-full animate-pulse"
                  style={{
                    background:
                      "radial-gradient(circle, rgba(236,72,153,0.3) 0%, transparent 70%)",
                  }}
                />
                <Avatar className="w-28 h-28 border-4 border-pink-500">
                  {callerProfile?.avatar ? (
                    <AvatarImage src={callerProfile.avatar.getDirectURL()} />
                  ) : null}
                  <AvatarFallback className="bg-gradient-to-br from-pink-500 to-purple-600 text-white text-3xl font-bold">
                    {hostName[0]?.toUpperCase() || "L"}
                  </AvatarFallback>
                </Avatar>
              </motion.div>
              {/* Audio waveform bars */}
              <div className="flex items-center gap-1.5">
                {Array.from({ length: 20 }).map((_, i) => (
                  <motion.div
                    // biome-ignore lint/suspicious/noArrayIndexKey: fixed-length static bars
                    key={`audio-bar-${i}`}
                    className="w-1.5 rounded-full bg-pink-500"
                    animate={{
                      height: [8, 8 + Math.random() * 32, 8],
                    }}
                    transition={{
                      repeat: Number.POSITIVE_INFINITY,
                      duration: 0.5 + Math.random() * 0.5,
                      ease: "easeInOut",
                      delay: i * 0.05,
                    }}
                  />
                ))}
              </div>
              <p className="text-white/60 text-sm">Audio Live</p>
            </div>
          </div>
        )}
      </div>

      {/* Top Bar */}
      <div className="relative z-10 flex items-center gap-3 px-4 pt-12 pb-3">
        <div
          className="flex items-center gap-2 flex-1 min-w-0 px-3 py-1.5 rounded-full"
          style={{ background: "rgba(0,0,0,0.5)" }}
        >
          <Avatar className="w-8 h-8 shrink-0">
            {callerProfile?.avatar ? (
              <AvatarImage src={callerProfile.avatar.getDirectURL()} />
            ) : null}
            <AvatarFallback className="bg-gradient-to-br from-pink-500 to-purple-600 text-white text-xs font-bold">
              {hostName[0]?.toUpperCase() || "L"}
            </AvatarFallback>
          </Avatar>
          <span className="text-white font-semibold text-sm truncate">
            {hostName}
          </span>
          <span className="shrink-0 px-2 py-0.5 bg-red-500 text-white text-[10px] font-bold rounded-full">
            LIVE
          </span>
          <span className="shrink-0 text-white/60 text-xs">
            👁 {viewerCount}
          </span>
        </div>
        {isHost && (
          <button
            data-ocid="live.delete_button"
            type="button"
            onClick={onEnd}
            className="shrink-0 px-3 py-1.5 bg-red-500/90 text-white text-xs font-bold rounded-full active:scale-95 transition-transform"
          >
            End Live
          </button>
        )}
        <button
          data-ocid="live.close_button"
          type="button"
          onClick={onClose}
          className="w-9 h-9 shrink-0 rounded-full flex items-center justify-center active:scale-90 transition-transform"
          style={{ background: "rgba(0,0,0,0.6)" }}
        >
          <X className="w-5 h-5 text-white" />
        </button>
      </div>

      {/* Host controls (if host and video mode) */}
      {isHost && (
        <div className="relative z-10 flex items-center gap-2 px-4">
          <button
            type="button"
            onClick={() => setAudioMuted((m) => !m)}
            className="w-9 h-9 rounded-full flex items-center justify-center"
            style={{ background: "rgba(0,0,0,0.5)" }}
          >
            {audioMuted ? (
              <MicOff className="w-4 h-4 text-red-400" />
            ) : (
              <Mic className="w-4 h-4 text-white" />
            )}
          </button>
          {mode === "video" && (
            <button
              type="button"
              onClick={() => setVideoMuted((m) => !m)}
              className="w-9 h-9 rounded-full flex items-center justify-center"
              style={{ background: "rgba(0,0,0,0.5)" }}
            >
              {videoMuted ? (
                <VideoOff className="w-4 h-4 text-red-400" />
              ) : (
                <Video className="w-4 h-4 text-white" />
              )}
            </button>
          )}
          {isHost && joinRequests.length > 0 && (
            <button
              type="button"
              onClick={() => setShowJoinPanel((s) => !s)}
              className="px-3 py-1 rounded-full text-xs font-bold text-white relative"
              style={{ background: "rgba(236,72,153,0.7)" }}
            >
              Requests ({joinRequests.length})
            </button>
          )}
        </div>
      )}

      {/* Join requests panel */}
      <AnimatePresence>
        {showJoinPanel && joinRequests.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="relative z-10 mx-4 mt-2 rounded-xl p-3"
            style={{ background: "rgba(0,0,0,0.8)" }}
          >
            {joinRequests.map((name) => (
              <div key={name} className="flex items-center gap-2 py-1.5">
                <span className="text-white text-sm flex-1">
                  {name} wants to join
                </span>
                <button
                  type="button"
                  className="text-xs text-green-400 font-bold px-2 py-0.5 rounded-full border border-green-400/30"
                  onClick={() =>
                    setJoinRequests((r) => r.filter((n) => n !== name))
                  }
                >
                  Accept
                </button>
                <button
                  type="button"
                  className="text-xs text-red-400 font-bold px-2 py-0.5 rounded-full border border-red-400/30"
                  onClick={() =>
                    setJoinRequests((r) => r.filter((n) => n !== name))
                  }
                >
                  Deny
                </button>
              </div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Spacer */}
      <div className="flex-1" />

      {/* Right side actions */}
      <div
        className="absolute right-3 z-10"
        style={{ top: "40%", transform: "translateY(-50%)" }}
      >
        <div className="flex flex-col items-center gap-4">
          {/* Like */}
          <div className="flex flex-col items-center gap-1">
            <motion.button
              data-ocid="live.toggle"
              type="button"
              onClick={handleLike}
              animate={likeAnim ? { scale: [1, 1.4, 1] } : {}}
              transition={{ duration: 0.4 }}
              className="w-11 h-11 rounded-full flex items-center justify-center active:scale-90 transition-transform"
              style={{ background: "rgba(0,0,0,0.5)" }}
            >
              <Heart className="w-6 h-6 text-pink-400" fill="#ec4899" />
            </motion.button>
            <span className="text-white text-[11px] font-bold">
              {likeCount}
            </span>
          </div>
          {/* Gift */}
          <div className="flex flex-col items-center gap-1">
            <button
              data-ocid="live.open_modal_button"
              type="button"
              onClick={() => setShowGiftPicker(true)}
              className="w-11 h-11 rounded-full flex items-center justify-center active:scale-90 transition-transform"
              style={{ background: "rgba(0,0,0,0.5)" }}
            >
              <Gift className="w-6 h-6 text-yellow-400" />
            </button>
            <span className="text-white/60 text-[10px]">Gift</span>
          </div>
          {/* Join request (viewers only) */}
          {!isHost && (
            <div className="flex flex-col items-center gap-1">
              <button
                data-ocid="live.secondary_button"
                type="button"
                onClick={handleJoinRequest}
                className="w-11 h-11 rounded-full flex items-center justify-center active:scale-90 transition-transform"
                style={{ background: "rgba(0,0,0,0.5)" }}
              >
                <UserPlus className="w-6 h-6 text-blue-400" />
              </button>
              <span className="text-white/60 text-[10px]">Join</span>
            </div>
          )}
        </div>
      </div>

      {/* Gift picker */}
      <AnimatePresence>
        {showGiftPicker && (
          <motion.div
            data-ocid="live.sheet"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="absolute right-16 z-20 rounded-2xl p-3"
            style={{
              background: "rgba(20,10,40,0.95)",
              top: "40%",
              transform: "translateY(-50%)",
              border: "1px solid rgba(236,72,153,0.3)",
            }}
          >
            <div className="grid grid-cols-3 gap-2">
              {GIFT_EMOJIS.map((emoji) => (
                <button
                  key={emoji}
                  type="button"
                  className="w-12 h-12 text-2xl rounded-xl active:scale-90 transition-transform"
                  style={{ background: "rgba(255,255,255,0.05)" }}
                  onClick={() => {
                    setMessages((prev) => [
                      ...prev,
                      {
                        id: `gift-${Date.now()}`,
                        user: callerProfile?.displayName || "You",
                        text: `Sent a gift ${emoji}`,
                        time: Date.now(),
                      },
                    ]);
                    setShowGiftPicker(false);
                  }}
                >
                  {emoji}
                </button>
              ))}
            </div>
            <button
              data-ocid="live.close_button"
              type="button"
              onClick={() => setShowGiftPicker(false)}
              className="mt-2 w-full text-center text-white/40 text-xs"
            >
              Cancel
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Chat area (bottom 40%) */}
      <div className="relative z-10 flex flex-col" style={{ maxHeight: "44%" }}>
        {/* Messages */}
        <div
          data-ocid="live.panel"
          className="flex-1 overflow-y-auto px-3 pb-2 space-y-1.5"
          style={{ maxHeight: "calc(44% - 56px)" }}
        >
          {messages.map((msg) => (
            <div key={msg.id} className="flex items-start gap-2">
              <div
                className="w-6 h-6 shrink-0 rounded-full flex items-center justify-center text-[10px] font-bold text-white mt-0.5"
                style={{
                  background: "linear-gradient(135deg, #ec4899, #a855f7)",
                }}
              >
                {msg.user[0]?.toUpperCase() || "?"}
              </div>
              <div>
                <span className="text-pink-400 text-[11px] font-bold mr-1">
                  {msg.user}
                </span>
                <span className="text-white/80 text-[12px]">{msg.text}</span>
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>

        {/* Chat input */}
        <div
          className="flex items-center gap-2 px-3 py-2"
          style={{
            background: "rgba(0,0,0,0.7)",
            borderTop: "1px solid rgba(255,255,255,0.08)",
          }}
        >
          {isHost && (
            <button
              type="button"
              onClick={onEnd}
              className="w-9 h-9 shrink-0 rounded-full flex items-center justify-center"
              style={{ background: "rgba(239,68,68,0.3)" }}
            >
              <PhoneOff className="w-4 h-4 text-red-400" />
            </button>
          )}
          <div
            className="flex-1 flex items-center rounded-full px-3 py-2 gap-2"
            style={{ background: "rgba(255,255,255,0.1)" }}
          >
            <input
              data-ocid="live.input"
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") sendMessage();
              }}
              placeholder="Say something..."
              className="flex-1 bg-transparent text-white text-sm placeholder:text-white/40 outline-none"
            />
          </div>
          <button
            data-ocid="live.submit_button"
            type="button"
            onClick={sendMessage}
            className="w-9 h-9 shrink-0 rounded-full flex items-center justify-center active:scale-90 transition-transform"
            style={{ background: "linear-gradient(135deg, #ec4899, #a855f7)" }}
          >
            <Send className="w-4 h-4 text-white" />
          </button>
        </div>
      </div>
    </div>
  );
}
