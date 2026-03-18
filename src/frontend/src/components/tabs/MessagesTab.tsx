import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import type { Principal } from "@icp-sdk/core/principal";
import {
  ArrowLeft,
  Camera,
  Edit,
  Image,
  Inbox,
  Loader2,
  Mic,
  Palette,
  Phone,
  Phone as PhoneIcon,
  Plus,
  Search,
  Settings,
  SmilePlus,
  ThumbsUp,
  Train,
  Video,
  X,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useEffect, useRef, useState } from "react";
import type { Profile } from "../../backend";
import { useInternetIdentity } from "../../hooks/useInternetIdentity";
import {
  useBlockedUsers,
  useFormatTimestamp,
  useGetAllProfiles,
  useGetFriends,
  useGetMessages,
  useSendMessage,
} from "../../hooks/useQueries";
import CallHistoryScreen from "../CallHistoryScreen";
import CallScreen from "../CallScreen";
import IncomingCallOverlay from "../IncomingCallOverlay";
import LoveTrackScreen from "../LoveTrackScreen";
import OutgoingCallOverlay from "../OutgoingCallOverlay";

const REACTION_EMOJIS = ["❤️", "🔥", "😂", "😮", "😢", "👏"];

const CHAT_THEMES = [
  { id: "dark", label: "Dark", bg: "#0a0a0f", preview: "#0a0a0f" },
  {
    id: "ocean",
    label: "Deep Ocean",
    bg: "linear-gradient(135deg, #0a1628 0%, #0d2137 100%)",
    preview: "#0a1628",
  },
  {
    id: "rose",
    label: "Midnight Rose",
    bg: "linear-gradient(135deg, #1a0515 0%, #2d0030 100%)",
    preview: "#2d0015",
  },
  {
    id: "forest",
    label: "Forest",
    bg: "linear-gradient(135deg, #051a0a 0%, #0d2b15 100%)",
    preview: "#051a0a",
  },
  {
    id: "galaxy",
    label: "Galaxy",
    bg: "linear-gradient(135deg, #0d0028 0%, #1a0052 100%)",
    preview: "#0d0028",
  },
];

const EMOJI_LIST = [
  "😀",
  "😂",
  "😍",
  "🥰",
  "😎",
  "😭",
  "😡",
  "🤔",
  "😴",
  "🤗",
  "👍",
  "👎",
  "❤️",
  "🔥",
  "✨",
  "🎉",
  "💯",
  "🙏",
  "👏",
  "💪",
  "😘",
  "🥺",
  "😅",
  "😊",
  "🤣",
  "😇",
  "🤩",
  "😜",
  "🤪",
  "😏",
  "💖",
  "💕",
  "💔",
  "💋",
  "🌹",
  "🌺",
  "🎀",
  "🦋",
  "⭐",
  "🌙",
  "👋",
  "✌️",
  "🤞",
  "🤙",
  "🖤",
  "💜",
  "💙",
  "💚",
  "💛",
  "🧡",
  "🐱",
  "🐶",
  "🐰",
  "🦊",
  "🐼",
  "🦄",
  "🍕",
  "🎵",
  "⚽",
  "🏀",
];
export default function MessagesTab({
  onChatOpenChange,
}: { onChatOpenChange?: (open: boolean) => void }) {
  const [selectedUser, setSelectedUser] = useState<{
    principal: Principal;
    profile: Profile;
  } | null>(null);
  const [showCallHistory, setShowCallHistory] = useState(false);
  const [showSettings, setShowSettings] = useState(false);

  const handleSelectUser = (u: { principal: Principal; profile: Profile }) => {
    setSelectedUser(u);
    onChatOpenChange?.(true);
  };

  const handleBackFromChat = () => {
    setSelectedUser(null);
    onChatOpenChange?.(false);
  };

  if (showCallHistory) {
    return <CallHistoryScreen onBack={() => setShowCallHistory(false)} />;
  }

  if (showSettings) {
    return <ChatSettingsPanel onBack={() => setShowSettings(false)} />;
  }

  if (selectedUser) {
    return (
      <ConversationView
        otherUser={selectedUser.principal}
        otherProfile={selectedUser.profile}
        onBack={handleBackFromChat}
      />
    );
  }

  return (
    <ConversationList
      onSelect={handleSelectUser}
      onCallHistory={() => setShowCallHistory(true)}
      onSettings={() => setShowSettings(true)}
    />
  );
}

function ConversationList({
  onSelect,
  onCallHistory,
  onSettings,
}: {
  onSelect: (u: { principal: Principal; profile: Profile }) => void;
  onCallHistory: () => void;
  onSettings: () => void;
}) {
  const [showNewChatSheet, setShowNewChatSheet] = useState(false);
  const [showLoveTrack, setShowLoveTrack] = useState(false);
  const { data: profiles, isLoading } = useGetAllProfiles();
  const { data: friendPrincipals } = useGetFriends();
  const { blockedSet } = useBlockedUsers();
  const { identity } = useInternetIdentity();
  const myPrincipal = identity?.getPrincipal();

  const friendSet = new Set((friendPrincipals ?? []).map((p) => p.toString()));

  const otherUsers =
    profiles?.filter(
      ([p]) =>
        p.toString() !== myPrincipal?.toString() &&
        !blockedSet.has(p.toString()),
    ) ?? [];

  const friendUsers = otherUsers.filter(([p]) => friendSet.has(p.toString()));
  const otherNonFriends = otherUsers.filter(
    ([p]) => !friendSet.has(p.toString()),
  );

  return (
    <>
      {showLoveTrack && (
        <LoveTrackScreen onClose={() => setShowLoveTrack(false)} />
      )}
      <div
        data-ocid="messages.page"
        className="flex flex-col h-full bg-[#0a0a0f]"
      >
        {/* Header */}
        <div className="flex items-center px-4 pt-5 pb-3 shrink-0">
          <button
            type="button"
            data-ocid="messages.secondary_button"
            className="w-9 h-9 rounded-full bg-white/10 flex items-center justify-center mr-2"
            onClick={onSettings}
          >
            <Settings className="w-4 h-4 text-white/70" />
          </button>
          <h1 className="text-xl font-bold font-display text-white flex-1 text-center">
            Chats
          </h1>
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              data-ocid="messages.toggle"
              onClick={onCallHistory}
              className="w-9 h-9 rounded-full bg-white/10 flex items-center justify-center"
              title="Call History"
            >
              <Inbox className="w-4 h-4 text-white/70" />
            </button>
            <button
              type="button"
              data-ocid="messages.toggle"
              onClick={() => setShowLoveTrack(true)}
              className="w-9 h-9 rounded-full flex items-center justify-center border border-pink-500/30"
              style={{
                background:
                  "linear-gradient(135deg, rgba(236,72,153,0.2), rgba(168,85,247,0.2))",
              }}
              title="Love Track"
            >
              <Train className="w-4 h-4 text-pink-300" />
            </button>
            <button
              type="button"
              data-ocid="messages.edit_button"
              onClick={() => setShowNewChatSheet(true)}
              className="w-9 h-9 rounded-full bg-white/10 flex items-center justify-center"
            >
              <Edit className="w-4 h-4 text-white/70" />
            </button>
          </div>
        </div>

        {/* Search bar */}
        <div className="px-4 pb-3 shrink-0">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
            <Input
              data-ocid="messages.search_input"
              placeholder="Search or start new chat"
              className="pl-9 bg-white/5 border-white/10 text-white placeholder:text-white/30 h-10 rounded-xl"
            />
          </div>
        </div>

        {/* Story / Online Users row */}
        <div className="px-4 pb-3 shrink-0">
          <div className="flex items-center gap-3 overflow-x-auto no-scrollbar pb-1">
            {/* Add Story */}
            <div className="flex flex-col items-center gap-1 shrink-0">
              <button
                type="button"
                data-ocid="messages.upload_button"
                className="w-14 h-14 rounded-full border-2 border-dashed border-pink-500/50 bg-pink-500/10 flex items-center justify-center active:scale-95 transition-transform"
              >
                <Plus className="w-5 h-5 text-pink-400" />
              </button>
              <span className="text-white/40 text-[10px]">Add story</span>
            </div>
            {/* Online users */}
            {otherUsers
              .filter((_, idx) => idx % 2 === 0)
              .slice(0, 8)
              .map(([principal, profile]) => (
                <div
                  key={principal.toString()}
                  className="flex flex-col items-center gap-1 shrink-0"
                >
                  <div className="relative">
                    <div
                      className="w-14 h-14 rounded-full p-[2px]"
                      style={{
                        background: "linear-gradient(135deg, #ec4899, #a855f7)",
                      }}
                    >
                      <div className="w-full h-full rounded-full overflow-hidden bg-[#0a0a0f]">
                        {profile.avatar ? (
                          <img
                            src={profile.avatar.getDirectURL()}
                            alt={profile.displayName}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full rounded-full bg-gradient-to-br from-pink-500/30 to-purple-600/30 flex items-center justify-center text-white text-sm font-bold">
                            {profile.displayName[0]?.toUpperCase()}
                          </div>
                        )}
                      </div>
                    </div>
                    <span className="absolute bottom-0 right-0 w-3.5 h-3.5 rounded-full bg-green-400 border-2 border-[#0a0a0f]" />
                  </div>
                  <span className="text-white/50 text-[10px] w-14 text-center truncate">
                    {profile.displayName}
                  </span>
                </div>
              ))}
          </div>
        </div>

        <div className="h-px bg-white/5 mx-4 shrink-0" />

        <div className="flex-1 overflow-y-auto pb-20">
          {isLoading ? (
            <div className="p-3 flex flex-col gap-3">
              {["s1", "s2", "s3", "s4"].map((sk) => (
                <div
                  key={sk}
                  data-ocid="messages.loading_state"
                  className="flex items-center gap-3 p-3"
                >
                  <Skeleton className="w-12 h-12 rounded-full" />
                  <div className="flex flex-col gap-1.5 flex-1">
                    <Skeleton className="w-32 h-3" />
                    <Skeleton className="w-24 h-2" />
                  </div>
                </div>
              ))}
            </div>
          ) : otherUsers.length > 0 ? (
            <div className="flex flex-col">
              {friendUsers.length > 0 && (
                <div className="px-4 pt-3 pb-1">
                  <p className="text-white/30 text-xs font-semibold uppercase tracking-wider">
                    Friends & Chats
                  </p>
                </div>
              )}
              {friendUsers.map(
                ([principal, profile]: [Principal, Profile], i) => (
                  <button
                    key={`friend-${principal.toString()}`}
                    type="button"
                    data-ocid={`messages.item.${i + 1}`}
                    onClick={() => onSelect({ principal, profile })}
                    className="flex items-center gap-3 px-4 py-3 hover:bg-white/5 transition-colors"
                  >
                    <div className="relative shrink-0">
                      <div
                        className="w-13 h-13 rounded-full p-[2px]"
                        style={{
                          background:
                            "linear-gradient(135deg, #ec4899, #a855f7)",
                        }}
                      >
                        <Avatar className="w-11 h-11 block">
                          {profile.avatar && (
                            <AvatarImage src={profile.avatar.getDirectURL()} />
                          )}
                          <AvatarFallback className="bg-gradient-to-br from-pink-500/30 to-purple-600/30 text-white text-sm">
                            {profile.displayName[0]?.toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                      </div>
                      <span className="absolute bottom-0 right-0 w-3 h-3 rounded-full bg-green-400 border-2 border-[#0a0a0f]" />
                    </div>
                    <div className="flex flex-col text-left min-w-0 flex-1">
                      <div className="flex items-center gap-1.5">
                        <p className="font-semibold text-white text-sm">
                          {profile.displayName}
                        </p>
                        <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-green-500/20 text-green-400 font-semibold">
                          Friend
                        </span>
                      </div>
                      <p className="text-xs text-white/40 truncate">
                        {profile.bio || "Tap to chat"}
                      </p>
                    </div>
                    <span className="text-white/20 text-xs shrink-0">now</span>
                  </button>
                ),
              )}
              {otherNonFriends.length > 0 && (
                <div className="px-4 pt-3 pb-1">
                  <p className="text-white/30 text-xs font-semibold uppercase tracking-wider">
                    Discover People
                  </p>
                </div>
              )}
              {otherNonFriends.map(
                ([principal, profile]: [Principal, Profile], i) => (
                  <button
                    key={principal.toString()}
                    type="button"
                    data-ocid={`messages.item.${friendUsers.length + i + 1}`}
                    onClick={() => onSelect({ principal, profile })}
                    className="flex items-center gap-3 px-4 py-3 hover:bg-white/5 transition-colors"
                  >
                    {/* Avatar with gradient ring + online dot */}
                    <div className="relative shrink-0">
                      <div
                        className="w-13 h-13 rounded-full p-[2px]"
                        style={{
                          background:
                            "linear-gradient(135deg, #ec4899, #a855f7)",
                        }}
                      >
                        <Avatar className="w-11 h-11 block">
                          {profile.avatar && (
                            <AvatarImage src={profile.avatar.getDirectURL()} />
                          )}
                          <AvatarFallback className="bg-gradient-to-br from-pink-500/30 to-purple-600/30 text-white text-sm">
                            {profile.displayName[0]?.toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                      </div>
                      {/* Online dot on first 3 users */}
                      {i < 3 && (
                        <span className="absolute bottom-0 right-0 w-3 h-3 rounded-full bg-green-400 border-2 border-[#0a0a0f]" />
                      )}
                    </div>
                    <div className="flex flex-col text-left min-w-0 flex-1">
                      <p className="font-semibold text-white text-sm">
                        {profile.displayName}
                      </p>
                      <p className="text-xs text-white/40 truncate">
                        {profile.bio || "Tap to chat"}
                      </p>
                    </div>
                    <span className="text-white/20 text-xs shrink-0">now</span>
                  </button>
                ),
              )}
            </div>
          ) : (
            <div
              data-ocid="messages.empty_state"
              className="flex flex-col items-center justify-center py-20 text-center gap-4 px-8"
            >
              <div className="w-16 h-16 rounded-2xl bg-white/5 flex items-center justify-center">
                <PhoneIcon className="w-7 h-7 text-white/20" />
              </div>
              <p className="text-white/50 font-semibold">
                No conversations yet
              </p>
              <p className="text-white/30 text-sm">
                Match with someone to start chatting!
              </p>
            </div>
          )}
        </div>
      </div>

      <NewChatBottomSheet
        open={showNewChatSheet}
        onClose={() => setShowNewChatSheet(false)}
        profiles={profiles ?? []}
        myPrincipal={myPrincipal ?? null}
        onSelect={(u) => {
          setShowNewChatSheet(false);
          onSelect(u);
        }}
      />
    </>
  );
}

type Reaction = { emoji: string; msgIndex: number };

function TypingIndicator() {
  return (
    <div className="flex items-end gap-2 justify-start">
      <div className="w-6 h-6 shrink-0 mb-1" />
      <div className="bg-white/10 px-4 py-3 rounded-2xl rounded-bl-sm flex items-center gap-1">
        {[0, 1, 2].map((i) => (
          <motion.span
            key={i}
            className="w-1.5 h-1.5 rounded-full bg-white/50 block"
            animate={{ y: [0, -4, 0] }}
            transition={{
              duration: 0.6,
              repeat: Number.POSITIVE_INFINITY,
              delay: i * 0.15,
              ease: "easeInOut",
            }}
          />
        ))}
      </div>
    </div>
  );
}

function NewChatBottomSheet({
  open,
  onClose,
  profiles,
  myPrincipal,
  onSelect,
}: {
  open: boolean;
  onClose: () => void;
  profiles: Array<[Principal, Profile]>;
  myPrincipal: import("@icp-sdk/core/principal").Principal | null;
  onSelect: (u: { principal: Principal; profile: Profile }) => void;
}) {
  const [query, setQuery] = useState("");
  const others = profiles.filter(
    ([p]) => p.toString() !== myPrincipal?.toString(),
  );
  const filtered = query.trim()
    ? others.filter(
        ([, prof]) =>
          prof.displayName.toLowerCase().includes(query.toLowerCase()) ||
          prof.location?.toLowerCase().includes(query.toLowerCase()),
      )
    : others;

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            key="new-chat-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-40"
            onClick={onClose}
          />
          <motion.div
            key="new-chat-sheet"
            data-ocid="messages.sheet"
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", damping: 28, stiffness: 300 }}
            className="fixed inset-x-0 bottom-0 z-50 bg-[#1a1a2e] rounded-t-3xl overflow-hidden flex flex-col"
            style={{ maxHeight: "80dvh" }}
          >
            {/* Handle */}
            <div className="flex justify-center pt-3 pb-1 shrink-0">
              <div className="w-10 h-1 rounded-full bg-white/20" />
            </div>
            {/* Header */}
            <div className="flex items-center justify-between px-4 pb-3 shrink-0">
              <h3 className="text-white font-bold text-lg">New Message</h3>
              <button
                type="button"
                data-ocid="messages.close_button"
                onClick={onClose}
                className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center"
              >
                <X className="w-4 h-4 text-white" />
              </button>
            </div>
            {/* Search */}
            <div className="px-4 pb-3 shrink-0">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
                <input
                  data-ocid="messages.search_input"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search people..."
                  className="w-full bg-white/8 border border-white/10 text-white placeholder:text-white/30 h-10 rounded-xl pl-9 pr-4 text-sm outline-none focus:border-pink-500/50"
                />
              </div>
            </div>
            {/* User list */}
            <div className="flex-1 overflow-y-auto pb-6">
              {filtered.length === 0 ? (
                <div
                  data-ocid="messages.empty_state"
                  className="flex flex-col items-center justify-center py-10 gap-2"
                >
                  <p className="text-white/30 text-sm">No users found</p>
                </div>
              ) : (
                filtered.map(([principal, profile], i) => (
                  <button
                    key={principal.toString()}
                    type="button"
                    data-ocid={`messages.item.${i + 1}`}
                    onClick={() => onSelect({ principal, profile })}
                    className="flex items-center gap-3 px-4 py-3 w-full hover:bg-white/5 transition-colors"
                  >
                    <Avatar className="w-11 h-11 shrink-0">
                      {profile.avatar && (
                        <AvatarImage src={profile.avatar.getDirectURL()} />
                      )}
                      <AvatarFallback className="bg-gradient-to-br from-pink-500 to-purple-600 text-white font-bold">
                        {profile.displayName[0]?.toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex flex-col text-left">
                      <p className="text-white font-semibold text-sm">
                        {profile.displayName}
                      </p>
                      {profile.location && (
                        <p className="text-white/40 text-xs">
                          📍 {profile.location}
                        </p>
                      )}
                    </div>
                  </button>
                ))
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

function ConversationView({
  otherUser,
  otherProfile,
  onBack,
}: {
  otherUser: Principal;
  otherProfile: Profile;
  onBack: () => void;
}) {
  const [text, setText] = useState("");
  const [activeCall, setActiveCall] = useState<"voice" | "video" | null>(null);
  const [outgoingCall, setOutgoingCall] = useState<"voice" | "video" | null>(
    null,
  );
  const [incomingCallMode, setIncomingCallMode] = useState<
    "voice" | "video" | null
  >(null);

  const handleInitCall = (mode: "voice" | "video") => {
    setOutgoingCall(mode);
    setTimeout(() => {
      setOutgoingCall(null);
      setIncomingCallMode(mode);
    }, 2000);
  };
  const [reactions, setReactions] = useState<Reaction[]>([]);
  const [contextMenu, setContextMenu] = useState<{
    msgIndex: number;
    x: number;
    y: number;
  } | null>(null);
  const [showThemeSelector, setShowThemeSelector] = useState(false);
  const [chatTheme, setChatTheme] = useState(CHAT_THEMES[0]);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [filePreview, setFilePreview] = useState<{
    url: string;
    name: string;
    type: string;
  } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { identity } = useInternetIdentity();
  const myPrincipal = identity?.getPrincipal();
  const { data: messages, isLoading } = useGetMessages(otherUser);
  const sendMessage = useSendMessage();
  const formatTs = useFormatTimestamp();

  // handleSend replaced by handleSendWithFile

  const handleLongPress = (e: React.MouseEvent, msgIndex: number) => {
    e.preventDefault();
    setContextMenu({ msgIndex, x: e.clientX, y: e.clientY });
  };

  const handleReact = (emoji: string, msgIndex: number) => {
    setReactions((prev) => {
      const filtered = prev.filter((r) => r.msgIndex !== msgIndex);
      return [...filtered, { emoji, msgIndex }];
    });
    setContextMenu(null);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const url = URL.createObjectURL(file);
    setFilePreview({ url, name: file.name, type: file.type });
  };

  const handleSendWithFile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim() && !filePreview) return;
    try {
      const content =
        text.trim() || (filePreview ? `📎 ${filePreview.name}` : "");
      await sendMessage.mutateAsync({ to: otherUser, content });
      setText("");
      if (filePreview) {
        URL.revokeObjectURL(filePreview.url);
        setFilePreview(null);
      }
    } catch {}
  };

  const [readMessages, setReadMessages] = useState<Set<string>>(new Set());
  // After 2 seconds, mark all messages as read (simulate read receipt)
  useEffect(() => {
    if (!messages || messages.length === 0) return;
    const t = setTimeout(() => {
      setReadMessages(new Set(messages.map((m) => m.timestamp.toString())));
    }, 2000);
    return () => clearTimeout(t);
  }, [messages]);

  const quickReplies = [
    "Say hi 👋",
    "You seem interesting...",
    "Let's connect! 🔗",
  ];

  const isEmptyChat = !messages || messages.length === 0;

  return (
    <div
      data-ocid="messages.dialog"
      className="flex flex-col h-full"
      style={{
        background: chatTheme.bg,
      }}
      onClick={() => {
        setContextMenu(null);
        setShowThemeSelector(false);
      }}
      onKeyDown={(e) => {
        if (e.key === "Escape") {
          setContextMenu(null);
          setShowThemeSelector(false);
        }
      }}
      role="presentation"
    >
      {/* Header */}
      <div className="flex items-center gap-2 px-3 py-3 border-b border-white/5 shrink-0">
        <button
          type="button"
          data-ocid="messages.close_button"
          onClick={onBack}
          className="w-9 h-9 rounded-full flex items-center justify-center text-white/70"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <Avatar className="w-9 h-9 shrink-0">
          {otherProfile.avatar && (
            <AvatarImage src={otherProfile.avatar.getDirectURL()} />
          )}
          <AvatarFallback className="bg-gradient-to-br from-pink-500 to-purple-600 text-white text-sm">
            {otherProfile.displayName[0]?.toUpperCase()}
          </AvatarFallback>
        </Avatar>
        <div className="flex flex-col flex-1 min-w-0">
          <p className="font-semibold text-white text-sm truncate">
            {otherProfile.displayName}
          </p>
          <p className="text-xs text-green-400">Active now</p>
        </div>

        {/* Theme selector button */}
        <div className="relative">
          <button
            type="button"
            data-ocid="messages.toggle"
            onClick={(e) => {
              e.stopPropagation();
              setShowThemeSelector((v) => !v);
            }}
            className="w-9 h-9 rounded-full bg-white/10 flex items-center justify-center"
            title="Chat theme"
          >
            <Palette className="w-4 h-4 text-white/70" />
          </button>

          <AnimatePresence>
            {showThemeSelector && (
              <motion.div
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                className="absolute right-0 top-11 z-50 bg-[#1a1a2e] border border-white/10 rounded-2xl p-3 shadow-xl"
                onClick={(e) => e.stopPropagation()}
              >
                <p className="text-white/40 text-xs mb-2 text-center">
                  Chat theme
                </p>
                <div className="flex gap-2">
                  {CHAT_THEMES.map((theme) => (
                    <button
                      key={theme.id}
                      type="button"
                      onClick={() => {
                        setChatTheme(theme);
                        setShowThemeSelector(false);
                      }}
                      className="flex flex-col items-center gap-1"
                      title={theme.label}
                    >
                      <div
                        className="w-8 h-8 rounded-full border-2 transition-all"
                        style={{
                          background: theme.bg,
                          borderColor:
                            chatTheme.id === theme.id
                              ? "#ec4899"
                              : "rgba(255,255,255,0.2)",
                        }}
                      />
                      <span className="text-white/30 text-[9px] w-10 text-center leading-tight">
                        {theme.label}
                      </span>
                    </button>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <button
          type="button"
          data-ocid="messages.secondary_button"
          onClick={() => handleInitCall("voice")}
          className="w-9 h-9 rounded-full bg-white/10 flex items-center justify-center"
          title="Voice call"
        >
          <Phone className="w-4 h-4 text-white/70" />
        </button>
        <button
          type="button"
          data-ocid="messages.toggle"
          onClick={() => handleInitCall("video")}
          className="w-9 h-9 rounded-full bg-purple-600 flex items-center justify-center"
          title="Video call"
        >
          <Video className="w-4 h-4 text-white" />
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-3 flex flex-col-reverse gap-2">
        {/* Typing indicator - always shown */}
        <TypingIndicator />

        {isLoading ? (
          <div
            data-ocid="messages.loading_state"
            className="flex justify-center py-8"
          >
            <Loader2 className="w-6 h-6 animate-spin text-white/30" />
          </div>
        ) : messages && messages.length > 0 ? (
          [...messages].reverse().map((msg, i) => {
            const isMe = msg.from.toString() === myPrincipal?.toString();
            const reaction = reactions.find((r) => r.msgIndex === i);
            return (
              <div
                key={msg.timestamp.toString() + String(i)}
                data-ocid={`messages.row.${i + 1}`}
                className={`flex flex-col ${
                  isMe ? "items-end" : "items-start"
                } gap-0.5`}
              >
                <div
                  className={`flex items-end gap-2 ${
                    isMe ? "justify-end" : "justify-start"
                  }`}
                >
                  {!isMe && (
                    <Avatar className="w-6 h-6 shrink-0 mb-1">
                      {otherProfile.avatar && (
                        <AvatarImage src={otherProfile.avatar.getDirectURL()} />
                      )}
                      <AvatarFallback className="bg-purple-600 text-white text-[10px]">
                        {otherProfile.displayName[0]?.toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                  )}
                  <div
                    className={`relative max-w-[72%] px-3.5 py-2 rounded-2xl text-sm cursor-pointer select-none ${
                      isMe
                        ? "bg-gradient-to-br from-purple-600 to-violet-500 text-white rounded-br-sm"
                        : "bg-white/10 text-white rounded-bl-sm"
                    }`}
                    onContextMenu={(e) => handleLongPress(e, i)}
                    onDoubleClick={(e) => handleLongPress(e, i)}
                  >
                    <p>{msg.content}</p>
                    <p
                      className={`text-[10px] mt-0.5 ${
                        isMe ? "text-white/50" : "text-white/30"
                      }`}
                    >
                      {formatTs(msg.timestamp)}
                    </p>
                  </div>
                  {isMe && (
                    <span
                      className={`text-[10px] ${readMessages.has(msg.timestamp.toString()) ? "text-pink-400" : "text-white/30"}`}
                    >
                      {readMessages.has(msg.timestamp.toString()) ? "✓✓" : "✓"}
                    </span>
                  )}
                </div>
                {reaction && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className={`text-sm bg-white/10 rounded-full px-2 py-0.5 border border-white/10 ${
                      isMe ? "mr-2" : "ml-8"
                    }`}
                  >
                    {reaction.emoji}
                  </motion.div>
                )}
              </div>
            );
          })
        ) : (
          <div
            data-ocid="messages.empty_state"
            className="flex flex-col items-center justify-center py-8 text-center gap-4"
          >
            <p className="text-white/30 text-sm">No messages yet. Say hi! 👋</p>
            {isEmptyChat && (
              <div className="flex flex-wrap gap-2 justify-center">
                {quickReplies.map((reply) => (
                  <button
                    key={reply}
                    type="button"
                    data-ocid="messages.secondary_button"
                    onClick={() => setText(reply)}
                    className="px-4 py-2 rounded-full bg-white/5 border border-white/15 text-white/60 text-sm hover:bg-white/10 transition-colors active:scale-95"
                  >
                    {reply}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Emoji reaction context menu */}
      <AnimatePresence>
        {contextMenu && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            className="fixed z-50 bg-[#1a1a2e] border border-white/10 rounded-2xl px-3 py-2 flex gap-1 shadow-2xl"
            style={{
              left: Math.min(contextMenu.x - 100, window.innerWidth - 240),
              top: contextMenu.y - 60,
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {REACTION_EMOJIS.map((emoji) => (
              <button
                key={emoji}
                type="button"
                onClick={() => handleReact(emoji, contextMenu.msgIndex)}
                className="w-10 h-10 rounded-full hover:bg-white/10 flex items-center justify-center text-xl transition-colors active:scale-90"
              >
                {emoji}
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* File preview */}
      {filePreview && (
        <div className="px-3 py-2 shrink-0 border-t border-white/5">
          <div className="relative inline-block">
            {filePreview.type.startsWith("video/") ? (
              <video
                src={filePreview.url}
                className="h-20 rounded-xl object-cover"
                controls
              >
                <track kind="captions" />
              </video>
            ) : (
              <img
                src={filePreview.url}
                alt="preview"
                className="h-20 rounded-xl object-cover"
              />
            )}
            <button
              type="button"
              onClick={() => {
                URL.revokeObjectURL(filePreview.url);
                setFilePreview(null);
              }}
              className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-red-500 flex items-center justify-center"
            >
              <X className="w-3 h-3 text-white" />
            </button>
          </div>
        </div>
      )}

      {/* Emoji picker panel */}
      {showEmojiPicker && (
        <div
          className="shrink-0 border-t border-white/5 bg-[#0f0f1a] px-3 py-3"
          onClick={(e) => e.stopPropagation()}
          onKeyDown={(e) => e.stopPropagation()}
          role="presentation"
        >
          <div className="grid grid-cols-10 gap-1 max-h-32 overflow-y-auto no-scrollbar">
            {EMOJI_LIST.map((emoji) => (
              <button
                key={emoji}
                type="button"
                onClick={() => setText((t) => t + emoji)}
                className="w-8 h-8 flex items-center justify-center text-lg hover:bg-white/10 rounded-lg transition-colors active:scale-90"
              >
                {emoji}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Vanish mode hint */}
      <div className="flex items-center justify-center gap-2 py-1.5 shrink-0">
        <div className="w-3 h-3 rounded-full border border-white/20 animate-spin border-t-transparent" />
        <span className="text-white/20 text-[10px]">
          Swipe up to turn on vanish mode
        </span>
      </div>

      {/* Quick Replies bar */}
      <div className="px-3 pb-1 shrink-0 overflow-x-auto no-scrollbar">
        <div className="flex gap-2 pb-1">
          {[
            "Hey! 👋",
            "How are you? 😊",
            "Sounds great! ✨",
            "Let's talk 💬",
            "I like you ❤️",
            "Miss you 🥺",
          ].map((reply) => (
            <button
              key={reply}
              type="button"
              onClick={() => {
                setText(reply);
              }}
              className="shrink-0 px-3 py-1.5 rounded-full text-xs text-white/80 whitespace-nowrap transition-all active:scale-95"
              style={{
                background: "rgba(255,255,255,0.06)",
                border: "1px solid",
                borderColor: "transparent",
                backgroundClip: "padding-box",
                boxShadow: "0 0 0 1px rgba(236,72,153,0.3)",
              }}
            >
              {reply}
            </button>
          ))}
        </div>
      </div>

      {/* Input bar */}
      <form
        onSubmit={handleSendWithFile}
        className="flex items-center gap-2 px-3 py-2 border-t border-white/5 shrink-0 pb-[calc(0.5rem+env(safe-area-inset-bottom,64px))]"
      >
        <button
          type="button"
          className="w-8 h-8 flex items-center justify-center text-white/40 shrink-0"
        >
          <Plus className="w-5 h-5" />
        </button>
        <button
          type="button"
          className="w-8 h-8 flex items-center justify-center text-white/40 shrink-0"
        >
          <Camera className="w-5 h-5" />
        </button>
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className="w-8 h-8 flex items-center justify-center text-white/40 shrink-0 active:text-purple-400 transition-colors"
        >
          <Image className="w-5 h-5" />
        </button>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*,video/*"
          className="hidden"
          onChange={handleFileSelect}
        />
        <button
          type="button"
          className="w-8 h-8 flex items-center justify-center text-white/40 shrink-0"
        >
          <Mic className="w-5 h-5" />
        </button>
        <div className="flex-1 relative">
          <input
            data-ocid="messages.input"
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Aa"
            className="w-full bg-white/10 text-white placeholder:text-white/30 rounded-full px-4 py-2 text-sm outline-none border border-white/10 focus:border-purple-500/50"
          />
        </div>
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            setShowEmojiPicker((v) => !v);
          }}
          className={`w-8 h-8 flex items-center justify-center shrink-0 transition-colors ${showEmojiPicker ? "text-purple-400" : "text-white/40"}`}
        >
          <SmilePlus className="w-5 h-5" />
        </button>
        {text.trim() ? (
          <Button
            type="submit"
            data-ocid="messages.submit_button"
            size="sm"
            disabled={sendMessage.isPending}
            className="w-8 h-8 p-0 rounded-full bg-gradient-to-br from-purple-600 to-violet-500 border-0 shrink-0"
          >
            {sendMessage.isPending ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <svg
                viewBox="0 0 24 24"
                className="w-3.5 h-3.5 fill-white"
                aria-hidden="true"
              >
                <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" />
              </svg>
            )}
          </Button>
        ) : (
          <button
            type="button"
            data-ocid="messages.toggle"
            className="w-8 h-8 flex items-center justify-center text-purple-400 shrink-0"
          >
            <ThumbsUp className="w-5 h-5" />
          </button>
        )}
      </form>

      {/* Call overlays */}
      <AnimatePresence>
        {activeCall && (
          <CallScreen
            mode={activeCall}
            otherProfile={otherProfile}
            onEnd={() => setActiveCall(null)}
          />
        )}
      </AnimatePresence>
      <AnimatePresence>
        {outgoingCall && (
          <OutgoingCallOverlay
            profile={otherProfile}
            mode={outgoingCall}
            onCancel={() => setOutgoingCall(null)}
          />
        )}
      </AnimatePresence>
      <AnimatePresence>
        {incomingCallMode && (
          <IncomingCallOverlay
            profile={otherProfile}
            mode={incomingCallMode}
            onAccept={() => {
              const m = incomingCallMode;
              setIncomingCallMode(null);
              setActiveCall(m);
            }}
            onReject={() => setIncomingCallMode(null)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

// ─── Chat Settings Panel ────────────────────────────────────────────────────
function ChatSettingsPanel({ onBack }: { onBack: () => void }) {
  const [activeSection, setActiveSection] = useState<
    "settings" | "privacy" | "inbox" | "pending" | "stars" | "online"
  >("settings");
  const [searchQuery, setSearchQuery] = useState("");
  const { data: profiles } = useGetAllProfiles();
  const { identity } = useInternetIdentity();
  const myPrincipal = identity?.getPrincipal();

  const otherUsers =
    profiles?.filter(([p]) => p.toString() !== myPrincipal?.toString()) ?? [];
  const onlineUsers = otherUsers.filter((_, i) => i % 2 === 0); // simulate online

  const filteredOnline = searchQuery
    ? onlineUsers.filter(([, p]) =>
        p.displayName.toLowerCase().includes(searchQuery.toLowerCase()),
      )
    : onlineUsers;

  const sections = [
    { id: "settings", label: "Settings", icon: "⚙️" },
    { id: "privacy", label: "Privacy", icon: "🔒" },
    { id: "inbox", label: "Inbox", icon: "📥" },
    { id: "pending", label: "Pending", icon: "⏳" },
    { id: "stars", label: "Stars", icon: "⭐" },
    { id: "online", label: "Online", icon: "🟢" },
  ] as const;

  return (
    <div className="flex flex-col h-full bg-[#0a0a0f]">
      {/* Header */}
      <div className="flex items-center px-4 pt-5 pb-3 shrink-0 border-b border-white/5">
        <button
          type="button"
          onClick={onBack}
          className="w-9 h-9 rounded-full bg-white/10 flex items-center justify-center mr-3"
        >
          <ArrowLeft className="w-4 h-4 text-white" />
        </button>
        <h1 className="text-xl font-bold text-white flex-1">Chat Settings</h1>
      </div>

      {/* Section tabs */}
      <div className="flex gap-1.5 px-4 py-3 overflow-x-auto no-scrollbar shrink-0">
        {sections.map((s) => (
          <button
            key={s.id}
            type="button"
            onClick={() => setActiveSection(s.id)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all ${
              activeSection === s.id
                ? "bg-gradient-to-r from-pink-500 to-purple-600 text-white"
                : "bg-white/8 text-white/60"
            }`}
          >
            <span>{s.icon}</span>
            {s.label}
          </button>
        ))}
      </div>

      <div className="flex-1 overflow-y-auto px-4">
        {activeSection === "settings" && (
          <div className="flex flex-col gap-4 py-4">
            <p className="text-white/40 text-sm text-center">
              Notification & display settings
            </p>
            {[
              {
                label: "Message notifications",
                desc: "Notify for new messages",
              },
              {
                label: "Message preview",
                desc: "Show message content in notifications",
              },
              { label: "Sound effects", desc: "Play sounds on new message" },
            ].map((item) => (
              <div
                key={item.label}
                className="flex items-center justify-between bg-white/5 rounded-xl p-4"
              >
                <div>
                  <p className="text-white text-sm font-medium">{item.label}</p>
                  <p className="text-white/40 text-xs">{item.desc}</p>
                </div>
                <div className="w-10 h-6 rounded-full bg-purple-600 flex items-center justify-end px-1">
                  <div className="w-4 h-4 rounded-full bg-white" />
                </div>
              </div>
            ))}
          </div>
        )}

        {activeSection === "privacy" && (
          <div className="flex flex-col gap-4 py-4">
            <p className="text-white/40 text-sm text-center">
              Control who can contact you
            </p>
            {[
              {
                label: "Who can message me",
                options: ["Everyone", "Matches only", "Nobody"],
                selected: "Everyone",
              },
              {
                label: "Read receipts",
                options: ["On", "Off"],
                selected: "On",
              },
              {
                label: "Online status",
                options: ["Visible", "Hidden"],
                selected: "Visible",
              },
            ].map((item) => (
              <div key={item.label} className="bg-white/5 rounded-xl p-4">
                <p className="text-white text-sm font-medium mb-2">
                  {item.label}
                </p>
                <div className="flex gap-2 flex-wrap">
                  {item.options.map((opt) => (
                    <button
                      key={opt}
                      type="button"
                      className={`px-3 py-1 rounded-full text-xs ${opt === item.selected ? "bg-purple-600 text-white" : "bg-white/10 text-white/60"}`}
                    >
                      {opt}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        {activeSection === "inbox" && (
          <div className="flex flex-col gap-2 py-4">
            <p className="text-white/40 text-sm text-center mb-2">
              All messages
            </p>
            {otherUsers.length === 0 && (
              <p className="text-white/30 text-sm text-center py-8">
                No messages yet
              </p>
            )}
            {otherUsers.map(([principal, profile]) => (
              <div
                key={principal.toString()}
                className="flex items-center gap-3 bg-white/5 rounded-xl p-3"
              >
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-pink-500 to-purple-600 flex items-center justify-center text-sm font-bold text-white shrink-0">
                  {profile.displayName?.[0]?.toUpperCase() ?? "?"}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-white text-sm font-semibold truncate">
                    {profile.displayName}
                  </p>
                  <p className="text-white/40 text-xs">
                    Tap to open conversation
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}

        {activeSection === "pending" && (
          <div className="flex flex-col gap-2 py-4">
            <p className="text-white/40 text-sm text-center mb-2">
              Message requests waiting for approval
            </p>
            <div className="flex flex-col items-center justify-center py-12 gap-3">
              <span className="text-4xl">📨</span>
              <p className="text-white/30 text-sm">No pending requests</p>
            </div>
          </div>
        )}

        {activeSection === "stars" && (
          <div className="flex flex-col gap-2 py-4">
            <p className="text-white/40 text-sm text-center mb-2">
              Users who gave you a star
            </p>
            {otherUsers.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 gap-3">
                <span className="text-4xl">⭐</span>
                <p className="text-white/30 text-sm">No stars yet</p>
              </div>
            ) : (
              otherUsers.slice(0, 3).map(([principal, profile]) => (
                <div
                  key={principal.toString()}
                  className="flex items-center gap-3 bg-white/5 rounded-xl p-3"
                >
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-yellow-500 to-orange-500 flex items-center justify-center text-sm font-bold text-white shrink-0">
                    {profile.displayName?.[0]?.toUpperCase() ?? "?"}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-white text-sm font-semibold truncate">
                      {profile.displayName}
                    </p>
                    <p className="text-yellow-400 text-xs">⭐ Starred you</p>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {activeSection === "online" && (
          <div className="flex flex-col gap-3 py-4">
            {/* Search box */}
            <div className="relative mb-2">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
              <input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search online users..."
                className="w-full bg-white/5 border border-white/10 text-white placeholder:text-white/30 h-10 rounded-xl pl-9 pr-4 text-sm outline-none focus:border-purple-500/50"
              />
            </div>
            {/* Online users */}
            {filteredOnline.length === 0 ? (
              <p className="text-white/30 text-sm text-center py-8">
                No users found
              </p>
            ) : (
              filteredOnline.map(([principal, profile]) => (
                <div
                  key={principal.toString()}
                  className="flex items-center gap-3 bg-white/5 rounded-xl p-3"
                >
                  <div className="relative">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-green-500 to-teal-500 flex items-center justify-center text-sm font-bold text-white shrink-0">
                      {profile.displayName?.[0]?.toUpperCase() ?? "?"}
                    </div>
                    <span className="absolute bottom-0 right-0 w-3 h-3 rounded-full bg-green-400 border-2 border-[#0a0a0f]" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-white text-sm font-semibold truncate">
                      {profile.displayName}
                    </p>
                    <p className="text-green-400 text-xs">● Online</p>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
}
