import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import type { Principal } from "@icp-sdk/core/principal";
import {
  Archive,
  ArrowLeft,
  BellOff,
  Camera,
  CheckCheck,
  Clock,
  Edit,
  Image,
  Inbox,
  Loader2,
  Mic,
  Phone,
  Phone as PhoneIcon,
  Pin,
  Plus,
  Search,
  Settings,
  ShieldX,
  SmilePlus,
  Trash2,
  User,
  Video,
  X,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import React from "react";
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
import GifPicker from "../GifPicker";
import IcebreakerCard, { getRandomIcebreaker } from "../IcebreakerCard";
import IncomingCallOverlay from "../IncomingCallOverlay";
import OutgoingCallOverlay from "../OutgoingCallOverlay";
import StoryCreatorSheet from "../StoryCreatorSheet";
import {
  BUBBLE_THEMES,
  BubbleThemePicker,
  CHAT_WALLPAPERS,
  ChatPollModal,
  ChatWallpaperPicker,
  CustomReactionPanel,
  DisappearingHeader,
  DisappearingMessageToggle,
  LoveLetterModal,
  PollMessage,
} from "../features/ChatFeatures";

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

const STICKER_LIST = [
  "😀",
  "😂",
  "🥰",
  "😍",
  "😎",
  "😭",
  "😡",
  "🤔",
  "🥺",
  "😘",
  "👍",
  "❤️",
  "🔥",
  "✨",
  "🎉",
  "💯",
  "🙏",
  "👏",
  "💪",
  "💖",
  "💋",
  "🌹",
  "🦋",
  "⭐",
  "🎀",
  "🍕",
  "🎵",
  "🚀",
  "🌈",
  "🥳",
  "😜",
  "🤩",
  "😇",
  "🤗",
  "💎",
  "👑",
  "🌸",
  "🍀",
  "🌊",
  "🦄",
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
  onViewProfile,
  onInitCall,
}: {
  onChatOpenChange?: (open: boolean) => void;
  onViewProfile?: (p: import("@icp-sdk/core/principal").Principal) => void;
  onInitCall?: (callee: Principal, mode: "voice" | "video") => void;
}) {
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
        onViewProfile={onViewProfile}
        onInitCall={onInitCall}
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
  const [showStoryCreatorInList, setShowStoryCreatorInList] = useState(false);
  const { data: profiles, isLoading: _profilesLoading } = useGetAllProfiles();
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

  // Read chat privacy setting
  const chatPrivacy = (() => {
    try {
      return JSON.parse(localStorage.getItem("sf_chat_settings") || "{}");
    } catch {
      return {};
    }
  })();
  const whoCanMessage: string = chatPrivacy.whoCanMessage ?? "everyone";

  const friendUsers = otherUsers.filter(([p]) => friendSet.has(p.toString()));
  const otherNonFriendsAll = otherUsers.filter(
    ([p]) => !friendSet.has(p.toString()),
  );
  // Apply whoCanMessage filter
  const otherNonFriends =
    whoCanMessage === "nobody"
      ? []
      : whoCanMessage === "matchesOnly"
        ? [] // only friends/matches visible
        : otherNonFriendsAll;

  // Chat options state
  const [mutedChats, setMutedChats] = React.useState<Set<string>>(() => {
    try {
      return new Set(
        JSON.parse(localStorage.getItem("sf_muted_chats") || "[]"),
      );
    } catch {
      return new Set();
    }
  });
  const [archivedChats, setArchivedChats] = React.useState<Set<string>>(() => {
    try {
      return new Set(
        JSON.parse(localStorage.getItem("sf_archived_chats") || "[]"),
      );
    } catch {
      return new Set();
    }
  });
  const [deletedChats, setDeletedChats] = React.useState<Set<string>>(() => {
    try {
      return new Set(
        JSON.parse(localStorage.getItem("sf_deleted_convos") || "[]"),
      );
    } catch {
      return new Set();
    }
  });
  const [pinnedChats, setPinnedChats] = React.useState<Set<string>>(() => {
    try {
      return new Set(
        JSON.parse(localStorage.getItem("sf_pinned_chats") || "[]"),
      );
    } catch {
      return new Set();
    }
  });
  const [chatOptionsUser, setChatOptionsUser] = React.useState<{
    principal: Principal;
    profile: Profile;
  } | null>(null);

  const toggleMute = (pid: string) => {
    setMutedChats((prev) => {
      const next = new Set(prev);
      if (next.has(pid)) next.delete(pid);
      else next.add(pid);
      localStorage.setItem("sf_muted_chats", JSON.stringify([...next]));
      return next;
    });
  };
  const toggleArchive = (pid: string) => {
    setArchivedChats((prev) => {
      const next = new Set(prev);
      if (next.has(pid)) next.delete(pid);
      else next.add(pid);
      localStorage.setItem("sf_archived_chats", JSON.stringify([...next]));
      return next;
    });
  };
  const togglePin = (pid: string) => {
    setPinnedChats((prev) => {
      const next = new Set(prev);
      if (next.has(pid)) next.delete(pid);
      else next.add(pid);
      localStorage.setItem("sf_pinned_chats", JSON.stringify([...next]));
      return next;
    });
  };
  const deleteChat = (pid: string) => {
    setDeletedChats((prev) => {
      const next = new Set(prev);
      next.add(pid);
      localStorage.setItem("sf_deleted_convos", JSON.stringify([...next]));
      return next;
    });
  };

  // Filter out deleted and archived convos from main list; pinned go to top
  const visibleFriends = friendUsers.filter(
    ([p]) =>
      !deletedChats.has(p.toString()) && !archivedChats.has(p.toString()),
  );
  const visibleOthers = otherNonFriends.filter(
    ([p]) =>
      !deletedChats.has(p.toString()) && !archivedChats.has(p.toString()),
  );
  const pinnedFriends = visibleFriends.filter(([p]) =>
    pinnedChats.has(p.toString()),
  );
  const unpinnedFriends = visibleFriends.filter(
    ([p]) => !pinnedChats.has(p.toString()),
  );
  const pinnedOthers = visibleOthers.filter(([p]) =>
    pinnedChats.has(p.toString()),
  );
  const unpinnedOthers = visibleOthers.filter(
    ([p]) => !pinnedChats.has(p.toString()),
  );

  return (
    <>
      <StoryCreatorSheet
        open={showStoryCreatorInList}
        onClose={() => setShowStoryCreatorInList(false)}
      />
      {/* Chat options bottom sheet */}
      {chatOptionsUser && (
        <div
          className="fixed inset-0 z-50 flex items-end"
          style={{ background: "rgba(0,0,0,0.6)" }}
          onClick={() => setChatOptionsUser(null)}
          onKeyDown={() => setChatOptionsUser(null)}
          role="presentation"
        >
          <motion.div
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            className="w-full rounded-t-3xl p-6"
            style={{
              background: "#1a0a2e",
              border: "1px solid rgba(236,72,153,0.2)",
            }}
            onClick={(e) => e.stopPropagation()}
            onKeyDown={(e) => e.stopPropagation()}
            role="presentation"
          >
            <div className="flex items-center gap-3 mb-5">
              <Avatar className="w-10 h-10">
                {chatOptionsUser.profile.avatar && (
                  <AvatarImage
                    src={chatOptionsUser.profile.avatar.getDirectURL()}
                  />
                )}
                <AvatarFallback className="bg-gradient-to-br from-pink-500 to-purple-600 text-white text-sm">
                  {chatOptionsUser.profile.displayName[0]?.toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <p className="text-white font-semibold">
                {chatOptionsUser.profile.displayName}
              </p>
            </div>
            <div className="flex flex-col">
              {(
                [
                  {
                    label: "View Profile",
                    icon: (
                      <User className="w-[18px] h-[18px] text-purple-400" />
                    ),
                    iconBg: "rgba(168,85,247,0.15)",
                    action: () => {
                      onSelect(chatOptionsUser);
                      setChatOptionsUser(null);
                    },
                  },
                  {
                    label: pinnedChats.has(chatOptionsUser.principal.toString())
                      ? "Unpin Chat"
                      : "Pin to Top",
                    icon: <Pin className="w-[18px] h-[18px] text-amber-400" />,
                    iconBg: "rgba(251,191,36,0.12)",
                    action: () => {
                      togglePin(chatOptionsUser.principal.toString());
                      setChatOptionsUser(null);
                    },
                  },
                  {
                    label: mutedChats.has(chatOptionsUser.principal.toString())
                      ? "Unmute"
                      : "Mute Notifications",
                    icon: (
                      <BellOff className="w-[18px] h-[18px] text-blue-400" />
                    ),
                    iconBg: "rgba(96,165,250,0.12)",
                    action: () => {
                      toggleMute(chatOptionsUser.principal.toString());
                      setChatOptionsUser(null);
                    },
                  },
                  {
                    label: "Mark as Read",
                    icon: (
                      <CheckCheck className="w-[18px] h-[18px] text-green-400" />
                    ),
                    iconBg: "rgba(74,222,128,0.12)",
                    action: () => setChatOptionsUser(null),
                  },
                  {
                    label: "Archive Chat",
                    icon: (
                      <Archive className="w-[18px] h-[18px] text-white/40" />
                    ),
                    iconBg: "rgba(255,255,255,0.06)",
                    action: () => {
                      toggleArchive(chatOptionsUser.principal.toString());
                      setChatOptionsUser(null);
                    },
                  },
                ] as Array<{
                  label: string;
                  icon: React.ReactNode;
                  iconBg: string;
                  action: () => void;
                }>
              ).map((opt) => (
                <button
                  key={opt.label}
                  type="button"
                  data-ocid="messages.button"
                  onClick={opt.action}
                  className="flex items-center gap-4 px-1 py-3.5 rounded-xl transition-colors active:bg-white/5"
                >
                  <div
                    className="w-10 h-10 rounded-[14px] flex items-center justify-center shrink-0"
                    style={{ background: opt.iconBg }}
                  >
                    {opt.icon}
                  </div>
                  <span className="text-white/90 text-sm font-medium text-left flex-1">
                    {opt.label}
                  </span>
                </button>
              ))}
              <div
                className="h-px my-1"
                style={{ background: "rgba(255,255,255,0.06)" }}
              />
              <button
                type="button"
                data-ocid="messages.delete_button"
                onClick={() => {
                  deleteChat(chatOptionsUser.principal.toString());
                  setChatOptionsUser(null);
                }}
                className="flex items-center gap-4 px-1 py-3.5 rounded-xl transition-colors active:bg-red-500/5"
              >
                <div
                  className="w-10 h-10 rounded-[14px] flex items-center justify-center shrink-0"
                  style={{ background: "rgba(239,68,68,0.12)" }}
                >
                  <Trash2 className="w-[18px] h-[18px] text-red-400" />
                </div>
                <span className="text-red-400 text-sm font-medium text-left flex-1">
                  Delete Conversation
                </span>
              </button>
            </div>
            <button
              type="button"
              data-ocid="messages.cancel_button"
              onClick={() => setChatOptionsUser(null)}
              className="w-full mt-4 py-3 text-white/40 text-sm"
            >
              Cancel
            </button>
          </motion.div>
        </div>
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
                onClick={() => setShowStoryCreatorInList(true)}
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
          {otherUsers.length > 0 ? (
            <div className="flex flex-col">
              {visibleFriends.length > 0 && (
                <div className="px-4 pt-3 pb-1">
                  <p className="text-white/30 text-xs font-semibold uppercase tracking-wider">
                    Friends & Chats
                  </p>
                </div>
              )}
              {/* Pinned friends first */}
              {[...pinnedFriends, ...unpinnedFriends].map(
                ([principal, profile]: [Principal, Profile], i) => {
                  const pid = principal.toString();
                  const isPinned = pinnedChats.has(pid);
                  const isMuted = mutedChats.has(pid);
                  return (
                    <div
                      key={`friend-${pid}`}
                      className="flex items-center gap-3 px-4 py-3 hover:bg-white/5 transition-colors"
                    >
                      <button
                        type="button"
                        data-ocid={`messages.item.${i + 1}`}
                        onClick={() => onSelect({ principal, profile })}
                        className="flex items-center gap-3 flex-1 min-w-0"
                      >
                        <div className="relative shrink-0">
                          <div
                            className="w-13 h-13 rounded-full p-[2px]"
                            style={{
                              background: isPinned
                                ? "linear-gradient(135deg, #f97316, #ec4899)"
                                : "linear-gradient(135deg, #ec4899, #a855f7)",
                            }}
                          >
                            <Avatar className="w-11 h-11 block">
                              {profile.avatar && (
                                <AvatarImage
                                  src={profile.avatar.getDirectURL()}
                                />
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
                            {isPinned && (
                              <span className="text-[10px]">📌</span>
                            )}
                            {isMuted && <span className="text-[10px]">🔕</span>}
                            <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-green-500/20 text-green-400 font-semibold">
                              Friend
                            </span>
                          </div>
                          <p className="text-xs text-white/40 truncate">
                            {profile.bio || "Tap to chat"}
                          </p>
                        </div>
                        <span className="text-white/20 text-xs shrink-0">
                          now
                        </span>
                      </button>
                      <button
                        type="button"
                        data-ocid="messages.toggle"
                        onClick={(e) => {
                          e.stopPropagation();
                          setChatOptionsUser({ principal, profile });
                        }}
                        className="w-8 h-8 rounded-full flex items-center justify-center shrink-0 text-white/30 hover:text-white/70 hover:bg-white/5 transition-colors"
                      >
                        <span className="text-lg leading-none">⋯</span>
                      </button>
                    </div>
                  );
                },
              )}
              {visibleOthers.length > 0 && (
                <div className="px-4 pt-3 pb-1">
                  <p className="text-white/30 text-xs font-semibold uppercase tracking-wider">
                    Discover People
                  </p>
                </div>
              )}
              {[...pinnedOthers, ...unpinnedOthers].map(
                ([principal, profile]: [Principal, Profile], i) => {
                  const pid = principal.toString();
                  const isPinned = pinnedChats.has(pid);
                  const isMuted = mutedChats.has(pid);
                  return (
                    <div
                      key={pid}
                      className="flex items-center gap-3 px-4 py-3 hover:bg-white/5 transition-colors"
                    >
                      <button
                        type="button"
                        data-ocid={`messages.item.${visibleFriends.length + i + 1}`}
                        onClick={() => onSelect({ principal, profile })}
                        className="flex items-center gap-3 flex-1 min-w-0"
                      >
                        <div className="relative shrink-0">
                          <div
                            className="w-13 h-13 rounded-full p-[2px]"
                            style={{
                              background: isPinned
                                ? "linear-gradient(135deg, #f97316, #ec4899)"
                                : "linear-gradient(135deg, #ec4899, #a855f7)",
                            }}
                          >
                            <Avatar className="w-11 h-11 block">
                              {profile.avatar && (
                                <AvatarImage
                                  src={profile.avatar.getDirectURL()}
                                />
                              )}
                              <AvatarFallback className="bg-gradient-to-br from-pink-500/30 to-purple-600/30 text-white text-sm">
                                {profile.displayName[0]?.toUpperCase()}
                              </AvatarFallback>
                            </Avatar>
                          </div>
                          {i < 3 && (
                            <span className="absolute bottom-0 right-0 w-3 h-3 rounded-full bg-green-400 border-2 border-[#0a0a0f]" />
                          )}
                        </div>
                        <div className="flex flex-col text-left min-w-0 flex-1">
                          <div className="flex items-center gap-1.5">
                            <p className="font-semibold text-white text-sm">
                              {profile.displayName}
                            </p>
                            {isPinned && (
                              <span className="text-[10px]">📌</span>
                            )}
                            {isMuted && <span className="text-[10px]">🔕</span>}
                          </div>
                          <p className="text-xs text-white/40 truncate">
                            {profile.bio || "Tap to chat"}
                          </p>
                        </div>
                        <span className="text-white/20 text-xs shrink-0">
                          now
                        </span>
                      </button>
                      <button
                        type="button"
                        data-ocid="messages.toggle"
                        onClick={(e) => {
                          e.stopPropagation();
                          setChatOptionsUser({ principal, profile });
                        }}
                        className="w-8 h-8 rounded-full flex items-center justify-center shrink-0 text-white/30 hover:text-white/70 hover:bg-white/5 transition-colors"
                      >
                        <span className="text-lg leading-none">⋯</span>
                      </button>
                    </div>
                  );
                },
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

function TypingIndicator({
  otherPrincipal,
  otherName,
}: { otherPrincipal: string; otherName: string }) {
  const [isTyping, setIsTyping] = React.useState(false);

  React.useEffect(() => {
    const check = () => {
      const raw = localStorage.getItem(`sf_typing_${otherPrincipal}`);
      if (!raw) {
        setIsTyping(false);
        return;
      }
      const ts = Number(raw);
      setIsTyping(Date.now() - ts < 3000);
    };
    check();
    const t = setInterval(check, 1000);
    return () => clearInterval(t);
  }, [otherPrincipal]);

  if (!isTyping) return null;

  return (
    <div className="flex items-end gap-2 justify-start">
      <div className="w-6 h-6 shrink-0 mb-1" />
      <div className="bg-white/10 px-4 py-3 rounded-2xl rounded-bl-sm flex items-center gap-2">
        <span className="text-white/40 text-xs">{otherName} is typing</span>
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
            className="fixed inset-x-0 bottom-0 z-50 bg-[#0a0a0f]/95 backdrop-blur-xl rounded-t-3xl overflow-hidden flex flex-col"
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
                  className="w-full bg-transparent border border-white/10 text-white placeholder:text-white/30 h-10 rounded-xl pl-9 pr-4 text-sm outline-none focus:border-pink-500/50"
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
  onViewProfile,
  onInitCall,
}: {
  otherUser: Principal;
  otherProfile: Profile;
  onBack: () => void;
  onViewProfile?: (p: Principal) => void;
  onInitCall?: (callee: Principal, mode: "voice" | "video") => void;
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
    if (onInitCall) {
      onInitCall(otherUser, mode);
      return;
    }
    setOutgoingCall(mode);
    // Write call signal to callee's localStorage key
    const calleePid = otherUser.toString();
    const callerId = myPrincipal?.toString() ?? "unknown";
    const callId = `call-${Date.now()}-${Math.random().toString(36).slice(2)}`;
    const signal = { callId, callerPrincipal: callerId, mode, ts: Date.now() };
    localStorage.setItem(`sf_call_signal_${calleePid}`, JSON.stringify(signal));
    // Auto-cancel after 30s
    const timer = setTimeout(() => {
      setOutgoingCall(null);
      localStorage.removeItem(`sf_call_signal_${calleePid}`);
    }, 30000);
    // Poll for acceptance (same tab testing)
    const pollInterval = setInterval(() => {
      const raw = localStorage.getItem(`sf_call_signal_${calleePid}`);
      if (!raw) {
        clearInterval(pollInterval);
        clearTimeout(timer);
        setOutgoingCall(null);
      }
    }, 1000);
    void timer;
    void pollInterval;
  };
  const [reactions, setReactions] = useState<Reaction[]>([]);
  const [contextMenu, setContextMenu] = useState<{
    msgIndex: number;
    x: number;
    y: number;
  } | null>(null);
  const [_showThemeSelector, setShowThemeSelector] = useState(false);
  const [_chatTheme, _setChatTheme] = useState(CHAT_THEMES[0]);
  const [showPollModal, setShowPollModal] = useState(false);
  const [polls, setPolls] = useState<
    { question: string; options: { text: string; votes: number }[] }[]
  >([]);
  const [_localGiftMessages, _setLocalGiftMessages] = useState<
    {
      type: "gift";
      giftEmoji: string;
      giftName: string;
      senderId: string;
      timestamp: number;
    }[]
  >([]);
  const [_disappearMode, _setDisappearMode] = useState("off");
  const [chatWallpaper, setChatWallpaper] = useState("");
  const [_showWallpaperPicker, setShowWallpaperPicker] = useState(false);
  const [_bubbleTheme, _setBubbleTheme] = useState(BUBBLE_THEMES[0]);
  const [_showExtras, _setShowExtras] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [emojiTab, setEmojiTab] = useState<"emoji" | "sticker">("emoji");
  const [showGifPicker, setShowGifPicker] = useState(false);
  const [scheduleDate, setScheduleDate] = useState("");
  const [showScheduler, setShowScheduler] = useState(false);
  const [scheduledMessages, setScheduledMessages] = useState<
    { content: string; sendAt: string }[]
  >([]);
  const [showMsgSearch, setShowMsgSearch] = useState(false);
  const [msgSearchQuery, setMsgSearchQuery] = useState("");
  const [pinnedMsg, setPinnedMsg] = useState<string | null>(null);
  const [_disappearing, _setDisappearing] = useState<"off" | "24h" | "7d">(
    "off",
  );
  const [forwardMsg, setForwardMsg] = useState<string | null>(null);
  const [showForwardSheet, setShowForwardSheet] = useState(false);
  const [icebreaker] = useState(() => getRandomIcebreaker());
  const showIcebreaker = true;
  const [filePreview, setFilePreview] = useState<{
    url: string;
    name: string;
    type: string;
  } | null>(null);
  const [voicePreview, setVoicePreview] = useState<string | null>(null);
  const [_isRecording, setIsRecording] = useState(false);
  const [showAttachSheet, setShowAttachSheet] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const [localAudioMessages, setLocalAudioMessages] = useState<
    { timestamp: number; url: string }[]
  >([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { identity } = useInternetIdentity();
  const myPrincipal = identity?.getPrincipal();
  type LocalMediaMessage = {
    type: "media";
    mediaUrl: string;
    mediaType: "image" | "video";
    senderId: string;
    timestamp: number;
  };
  const _mediaConvoKey = `sf_media_msg_${[myPrincipal?.toString() ?? "", otherUser.toString()].sort().join("_")}`;
  const [localMediaMessages, setLocalMediaMessages] = useState<
    LocalMediaMessage[]
  >(() => {
    try {
      return JSON.parse(
        localStorage.getItem(
          `sf_media_msg_${[myPrincipal?.toString() ?? "", otherUser.toString()].sort().join("_")}`,
        ) || "[]",
      );
    } catch {
      return [];
    }
  });
  const { data: messages } = useGetMessages(otherUser);
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

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const url = URL.createObjectURL(file);
    setFilePreview({ url, name: file.name, type: file.type });
    // Also store as base64 for sending to other user
    try {
      const reader = new FileReader();
      const b64 = await new Promise<string>((resolve) => {
        reader.onload = (ev) => resolve((ev.target?.result as string) ?? "");
        reader.readAsDataURL(file);
      });
      const mediaType = file.type.startsWith("video/") ? "video" : "image";
      const convoKey = _mediaConvoKey;
      const existing = JSON.parse(
        localStorage.getItem(convoKey) || "[]",
      ) as LocalMediaMessage[];
      existing.push({
        type: "media",
        mediaUrl: b64,
        mediaType,
        senderId: myPrincipal?.toString() ?? "",
        timestamp: Date.now(),
      });
      // Keep only last 50
      while (existing.length > 50) existing.shift();
      localStorage.setItem(convoKey, JSON.stringify(existing));
      setLocalMediaMessages((prev) => [
        ...prev,
        {
          type: "media",
          mediaUrl: b64,
          mediaType,
          senderId: myPrincipal?.toString() ?? "",
          timestamp: Date.now(),
        },
      ]);
    } catch {}
  };

  const handleSendWithFile = (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim() && !filePreview) return;
    const content =
      text.trim() || (filePreview ? `📎 ${filePreview.name}` : "");
    // Optimistic: clear UI immediately
    setText("");
    if (filePreview) {
      URL.revokeObjectURL(filePreview.url);
      setFilePreview(null);
    }
    // Write typing signal cleared
    if (myPrincipal) {
      localStorage.removeItem(`sf_typing_${myPrincipal.toString()}`);
    }
    // Send in background
    sendMessage.mutate({ to: otherUser, content });
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      audioChunksRef.current = [];
      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) audioChunksRef.current.push(e.data);
      };
      recorder.onstop = () => {
        const blob = new Blob(audioChunksRef.current, { type: "audio/webm" });
        const url = URL.createObjectURL(blob);
        setVoicePreview(url);
        for (const t of stream.getTracks()) {
          t.stop();
        }
      };
      recorder.start();
      mediaRecorderRef.current = recorder;
      setIsRecording(true);
    } catch {}
  };

  const _stopRecording = () => {
    mediaRecorderRef.current?.stop();
    mediaRecorderRef.current = null;
    setIsRecording(false);
  };

  const sendVoiceMessage = async () => {
    if (!voicePreview) return;
    const ts = Date.now();
    setLocalAudioMessages((prev) => [
      ...prev,
      { timestamp: ts, url: voicePreview },
    ]);
    setVoicePreview(null);
    try {
      await sendMessage.mutateAsync({
        to: otherUser,
        content: "🎤 Voice message",
      });
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
        background: chatWallpaper ? `${_chatTheme.bg}` : _chatTheme.bg,
        backgroundImage: chatWallpaper || undefined,
        backgroundSize: "cover",
        backgroundPosition: "center",
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
        <button
          type="button"
          className="shrink-0"
          onClick={() => onViewProfile?.(otherUser)}
          title="View profile"
        >
          <Avatar className="w-9 h-9">
            {otherProfile.avatar && (
              <AvatarImage src={otherProfile.avatar.getDirectURL()} />
            )}
            <AvatarFallback className="bg-gradient-to-br from-pink-500 to-purple-600 text-white text-sm">
              {otherProfile.displayName[0]?.toUpperCase()}
            </AvatarFallback>
          </Avatar>
        </button>
        <div className="flex flex-col flex-1 min-w-0">
          <p className="font-semibold text-white text-sm truncate">
            {otherProfile.displayName}
          </p>
          <p className="text-xs text-green-400">Active now</p>
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
        <button
          type="button"
          data-ocid="messages.toggle"
          onClick={(e) => {
            e.stopPropagation();
            setShowMsgSearch((v) => !v);
          }}
          className="w-9 h-9 rounded-full bg-white/10 flex items-center justify-center"
          title="Search messages"
        >
          <Search className="w-4 h-4 text-white/70" />
        </button>
      </div>

      {/* Message search overlay */}
      {showMsgSearch && (
        <div className="px-3 py-2 border-b border-white/5 shrink-0">
          <input
            data-ocid="messages.search_input"
            value={msgSearchQuery}
            onChange={(e) => setMsgSearchQuery(e.target.value)}
            placeholder="Search messages..."
            className="w-full bg-white/10 text-white placeholder:text-white/30 rounded-full px-4 py-2 text-sm outline-none border border-white/10 focus:border-purple-500/50"
          />
        </div>
      )}

      {/* Pinned message banner */}
      {pinnedMsg && (
        <div className="flex items-center gap-2 px-3 py-2 bg-yellow-500/10 border-b border-yellow-500/20 shrink-0">
          <span className="text-sm">📌</span>
          <p className="flex-1 text-yellow-200/80 text-xs truncate">
            {pinnedMsg}
          </p>
          <button
            type="button"
            onClick={() => setPinnedMsg(null)}
            className="text-white/30 text-sm"
          >
            ×
          </button>
        </div>
      )}

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-3 flex flex-col-reverse gap-2">
        {/* Local media messages */}
        {localMediaMessages.map((mm) => {
          const isMe = mm.senderId === myPrincipal?.toString();
          return (
            <div
              key={mm.timestamp}
              className={`flex flex-col ${isMe ? "items-end" : "items-start"} gap-0.5`}
            >
              <div
                className={`flex items-end gap-2 ${isMe ? "justify-end" : "justify-start"}`}
              >
                <div className="max-w-[70%] rounded-2xl overflow-hidden">
                  {mm.mediaType === "video" ? (
                    <video
                      src={mm.mediaUrl}
                      controls
                      className="w-full rounded-2xl max-h-48"
                    >
                      <track kind="captions" />
                    </video>
                  ) : (
                    <img
                      src={mm.mediaUrl}
                      alt="Sent media"
                      className="w-full max-h-48 object-cover rounded-2xl"
                    />
                  )}
                </div>
              </div>
            </div>
          );
        })}
        {/* Local gift messages */}
        {_localGiftMessages.map((gm) => {
          const isMe = gm.senderId === myPrincipal?.toString();
          return (
            <div
              key={gm.timestamp}
              className={`flex flex-col ${isMe ? "items-end" : "items-start"} gap-0.5`}
            >
              <div
                className={`flex items-end gap-2 ${isMe ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[70%] px-4 py-3 rounded-2xl border ${isMe ? "bg-gradient-to-br from-yellow-600/30 to-orange-600/30 border-yellow-500/30 rounded-br-sm" : "bg-white/10 border-white/10 rounded-bl-sm"}`}
                >
                  <div className="flex flex-col items-center gap-1">
                    <span className="text-4xl">{gm.giftEmoji}</span>
                    <span className="text-white/80 text-xs font-semibold">
                      {gm.giftName}
                    </span>
                    <span className="text-yellow-400 text-[10px]">
                      Gift sent! 🎁
                    </span>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
        {/* Local voice messages */}
        {localAudioMessages.map((am) => (
          <div key={am.timestamp} className="flex flex-col items-end gap-0.5">
            <div className="flex items-end gap-2 justify-end">
              <div className="max-w-[70%] px-3 py-2 rounded-2xl rounded-br-sm bg-gradient-to-br from-purple-600 to-violet-500">
                <audio src={am.url} controls className="h-7 w-36 rounded">
                  <track kind="captions" />
                </audio>
                <p className="text-[10px] mt-0.5 text-white/50">now</p>
              </div>
            </div>
          </div>
        ))}
        {/* Typing indicator - always shown */}
        <TypingIndicator
          otherPrincipal={otherUser.toString()}
          otherName={otherProfile.displayName}
        />

        {messages && messages.length > 0 ? (
          [...messages]
            .reverse()
            .filter(
              (msg) =>
                !msgSearchQuery.trim() ||
                msg.content
                  .toLowerCase()
                  .includes(msgSearchQuery.toLowerCase()),
            )
            .map((msg, i) => {
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
                      <button
                        type="button"
                        className="shrink-0 mb-1"
                        onClick={() => onViewProfile?.(otherUser)}
                        title={`View ${otherProfile.displayName}'s profile`}
                      >
                        <Avatar className="w-6 h-6">
                          {otherProfile.avatar && (
                            <AvatarImage
                              src={otherProfile.avatar.getDirectURL()}
                            />
                          )}
                          <AvatarFallback className="bg-purple-600 text-white text-[10px]">
                            {otherProfile.displayName[0]?.toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                      </button>
                    )}
                    <div
                      className={`relative max-w-[70%] px-3.5 py-2 rounded-2xl text-sm cursor-pointer select-none ${
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
                        {readMessages.has(msg.timestamp.toString())
                          ? "✓✓"
                          : "✓"}
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
            {polls.map((poll, pi) => (
              <div
                // biome-ignore lint/suspicious/noArrayIndexKey: indexed polls
                key={`poll-msg-${pi}`}
                className="flex justify-start mb-2 px-2"
              >
                <PollMessage question={poll.question} options={poll.options} />
              </div>
            ))}
            {isEmptyChat && showIcebreaker && (
              <IcebreakerCard question={icebreaker} />
            )}
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
            <div className="w-px bg-white/10 mx-1 self-stretch" />
            <button
              type="button"
              onClick={() => {
                const msgs = messages ? [...messages].reverse() : [];
                const msg = msgs[contextMenu.msgIndex];
                if (msg) setPinnedMsg(msg.content);
                setContextMenu(null);
              }}
              className="w-10 h-10 rounded-full hover:bg-white/10 flex items-center justify-center text-lg transition-colors active:scale-90"
              title="Pin"
            >
              📌
            </button>
            <button
              type="button"
              onClick={() => {
                const msgs = messages ? [...messages].reverse() : [];
                const msg = msgs[contextMenu.msgIndex];
                if (msg) {
                  setForwardMsg(msg.content);
                  setShowForwardSheet(true);
                }
                setContextMenu(null);
              }}
              className="w-10 h-10 rounded-full hover:bg-white/10 flex items-center justify-center text-lg transition-colors active:scale-90"
              title="Forward"
            >
              ↗️
            </button>
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

      {/* Voice preview */}
      {voicePreview && (
        <div className="px-3 py-2 shrink-0 border-t border-white/5 flex items-center gap-3">
          <audio src={voicePreview} controls className="h-8 flex-1 rounded-xl">
            <track kind="captions" />
          </audio>
          <button
            type="button"
            onClick={sendVoiceMessage}
            className="px-4 py-1.5 rounded-full bg-gradient-to-br from-purple-600 to-violet-500 text-white text-xs font-semibold"
          >
            Send
          </button>
          <button
            type="button"
            onClick={() => {
              URL.revokeObjectURL(voicePreview);
              setVoicePreview(null);
            }}
            className="w-7 h-7 rounded-full bg-red-500/20 flex items-center justify-center"
          >
            <X className="w-3.5 h-3.5 text-red-400" />
          </button>
        </div>
      )}

      {/* Emoji / Sticker picker panel */}
      {showEmojiPicker && (
        <div
          className="shrink-0 border-t border-white/5 bg-[#0f0f1a]"
          onClick={(e) => e.stopPropagation()}
          onKeyDown={(e) => e.stopPropagation()}
          role="presentation"
        >
          {/* Tabs */}
          <div className="flex border-b border-white/5">
            {(["emoji", "sticker"] as const).map((tab) => (
              <button
                key={tab}
                type="button"
                onClick={() => setEmojiTab(tab)}
                className={`flex-1 py-2 text-xs font-semibold transition-colors ${emojiTab === tab ? "text-pink-400 border-b-2 border-pink-400" : "text-white/30"}`}
              >
                {tab === "emoji" ? "😊 Emojis" : "🎭 Stickers"}
              </button>
            ))}
          </div>
          <div className="px-3 py-3">
            {emojiTab === "emoji" ? (
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
            ) : (
              <div className="grid grid-cols-8 gap-1 max-h-32 overflow-y-auto no-scrollbar">
                {STICKER_LIST.map((sticker) => (
                  <button
                    key={sticker}
                    type="button"
                    onClick={async () => {
                      setText("");
                      try {
                        await sendMessage.mutateAsync({
                          to: otherUser,
                          content: sticker,
                        });
                      } catch {}
                    }}
                    className="w-9 h-9 flex items-center justify-center text-2xl hover:bg-white/10 rounded-xl transition-colors active:scale-90"
                  >
                    {sticker}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

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

      {/* Attachment options sheet */}
      <AnimatePresence>
        {showAttachSheet && (
          <>
            <motion.div
              key="attach-backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 z-40"
              onClick={() => setShowAttachSheet(false)}
            />
            <motion.div
              key="attach-sheet"
              data-ocid="messages.sheet"
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 28, stiffness: 300 }}
              className="fixed inset-x-0 bottom-0 z-50 rounded-t-3xl p-5 pb-10"
              style={{
                background: "#1a0a2e",
                border: "1px solid rgba(236,72,153,0.2)",
              }}
            >
              <div className="flex justify-center mb-4">
                <div className="w-10 h-1 rounded-full bg-white/20" />
              </div>
              <p className="text-white font-bold text-base mb-4">Send</p>
              <div className="grid grid-cols-4 gap-3">
                {[
                  {
                    icon: "📷",
                    label: "Images",
                    action: () => {
                      fileInputRef.current?.click();
                      setShowAttachSheet(false);
                    },
                  },
                  {
                    icon: "🎥",
                    label: "Video",
                    action: () => {
                      fileInputRef.current?.click();
                      setShowAttachSheet(false);
                    },
                  },
                  {
                    icon: "🎵",
                    label: "Audio",
                    action: () => {
                      const inp = document.createElement("input");
                      inp.type = "file";
                      inp.accept = "audio/*";
                      inp.onchange = (ev) => {
                        const file = (ev.target as HTMLInputElement).files?.[0];
                        if (file) {
                          const url = URL.createObjectURL(file);
                          setFilePreview({
                            url,
                            name: file.name,
                            type: file.type,
                          });
                        }
                      };
                      inp.click();
                      setShowAttachSheet(false);
                    },
                  },
                  {
                    icon: "📁",
                    label: "File",
                    action: () => {
                      fileInputRef.current?.click();
                      setShowAttachSheet(false);
                    },
                  },
                  {
                    icon: "😊",
                    label: "Emoji",
                    action: () => {
                      setShowEmojiPicker(true);
                      setShowGifPicker(false);
                      setShowAttachSheet(false);
                    },
                  },
                  {
                    icon: "📊",
                    label: "Poll",
                    action: () => {
                      setShowPollModal(true);
                      setShowAttachSheet(false);
                    },
                  },
                  {
                    icon: "🎬",
                    label: "GIF",
                    action: () => {
                      setShowGifPicker(true);
                      setShowEmojiPicker(false);
                      setShowAttachSheet(false);
                    },
                  },
                  {
                    icon: "📍",
                    label: "Location",
                    action: () => {
                      setText((t) => `${t} 📍 Location`);
                      setShowAttachSheet(false);
                    },
                  },
                  {
                    icon: "👤",
                    label: "Contact",
                    action: () => {
                      setText((t) => `${t} 👤 Contact`);
                      setShowAttachSheet(false);
                    },
                  },
                  {
                    icon: "🎤",
                    label: "Record",
                    action: () => {
                      startRecording();
                      setShowAttachSheet(false);
                    },
                  },
                ].map((opt) => (
                  <button
                    key={opt.label}
                    type="button"
                    data-ocid="messages.button"
                    onClick={opt.action}
                    className="flex flex-col items-center gap-2 py-3 rounded-2xl bg-white/5 hover:bg-white/10 transition-colors active:scale-95"
                  >
                    <span className="text-2xl">{opt.icon}</span>
                    <span className="text-white/60 text-xs">{opt.label}</span>
                  </button>
                ))}
              </div>
              <button
                type="button"
                data-ocid="messages.cancel_button"
                onClick={() => setShowAttachSheet(false)}
                className="w-full mt-4 py-3 text-white/40 text-sm"
              >
                Cancel
              </button>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Input bar */}
      <form
        onSubmit={handleSendWithFile}
        className="flex items-center gap-2 px-3 py-2 border-t border-white/5 shrink-0 pb-[calc(0.5rem+env(safe-area-inset-bottom,64px))]"
      >
        {/* + icon opens attachment sheet */}
        <button
          type="button"
          data-ocid="messages.open_modal_button"
          onClick={() => setShowAttachSheet(true)}
          className="w-9 h-9 flex items-center justify-center rounded-full shrink-0 transition-all active:scale-90"
          style={{
            background:
              "linear-gradient(135deg, rgba(236,72,153,0.25), rgba(168,85,247,0.25))",
            border: "1px solid rgba(236,72,153,0.3)",
          }}
        >
          <Plus className="w-5 h-5 text-pink-400" />
        </button>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*,video/*,audio/*"
          className="hidden"
          onChange={handleFileSelect}
        />
        <div className="flex-1 relative">
          <input
            data-ocid="messages.input"
            value={text}
            onChange={(e) => {
              setText(e.target.value);
              if (myPrincipal && e.target.value.trim()) {
                localStorage.setItem(
                  `sf_typing_${myPrincipal.toString()}`,
                  String(Date.now()),
                );
              }
            }}
            placeholder="Message..."
            className="w-full bg-white/10 text-white placeholder:text-white/30 rounded-full px-4 py-2 text-sm outline-none border border-white/10 focus:border-purple-500/50"
          />
        </div>
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            setShowEmojiPicker((v) => !v);
            setShowGifPicker(false);
          }}
          className={`w-8 h-8 flex items-center justify-center shrink-0 transition-colors ${showEmojiPicker ? "text-purple-400" : "text-white/40"}`}
        >
          <SmilePlus className="w-5 h-5" />
        </button>
        {text.trim() ? (
          <>
            <button
              type="button"
              data-ocid="messages.button"
              onClick={() => setShowScheduler((v) => !v)}
              title="Schedule message"
              className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center shrink-0"
            >
              <Clock className="w-4 h-4 text-white/50" />
            </button>
            <Button
              type="submit"
              data-ocid="messages.submit_button"
              size="sm"
              className="w-8 h-8 p-0 rounded-full bg-gradient-to-br from-purple-600 to-violet-500 border-0 shrink-0"
            >
              <svg
                viewBox="0 0 24 24"
                className="w-3.5 h-3.5 fill-white"
                aria-hidden="true"
              >
                <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" />
              </svg>
            </Button>
          </>
        ) : null}
      </form>
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
            mode={outgoingCall as "voice" | "video"}
            onCancel={() => setOutgoingCall(null)}
          />
        )}
      </AnimatePresence>
      <AnimatePresence>
        {incomingCallMode && (
          <IncomingCallOverlay
            profile={otherProfile}
            mode={incomingCallMode as "voice" | "video"}
            onAccept={() => {
              const m = incomingCallMode;
              setIncomingCallMode(null);
              setActiveCall(m);
            }}
            onReject={() => setIncomingCallMode(null)}
          />
        )}
      </AnimatePresence>
      <GifPicker
        open={showGifPicker}
        onClose={() => setShowGifPicker(false)}
        onSelect={async (gifText) => {
          try {
            await sendMessage.mutateAsync({ to: otherUser, content: gifText });
          } catch {}
        }}
      />
      {showScheduler && (
        <div className="px-3 pb-2 bg-white/5 border-t border-white/10 shrink-0">
          <p className="text-white/50 text-xs py-2 font-semibold">
            📅 Schedule Message
          </p>
          <div className="flex gap-2 items-center">
            <input
              type="datetime-local"
              value={scheduleDate}
              onChange={(e) => setScheduleDate(e.target.value)}
              className="flex-1 bg-white/10 text-white text-xs rounded-lg px-2 py-1.5 outline-none border border-white/15"
            />
            <button
              type="button"
              data-ocid="messages.confirm_button"
              onClick={() => {
                if (text.trim() && scheduleDate) {
                  setScheduledMessages((prev) => [
                    ...prev,
                    { content: text, sendAt: scheduleDate },
                  ]);
                  setText("");
                  setScheduleDate("");
                  setShowScheduler(false);
                }
              }}
              className="px-3 py-1.5 rounded-lg text-white text-xs font-semibold shrink-0"
              style={{
                background: "linear-gradient(135deg, #ec4899, #a855f7)",
              }}
            >
              Schedule
            </button>
          </div>
          {scheduledMessages.length > 0 && (
            <div className="mt-2">
              {scheduledMessages.map((sm, _i) => (
                <div
                  key={`sched-${sm.sendAt}-${sm.content.slice(0, 8)}`}
                  className="flex items-center gap-2 py-1"
                >
                  <span className="text-yellow-400 text-xs">⏰</span>
                  <p className="text-white/60 text-xs flex-1 truncate">
                    {sm.content}
                  </p>
                  <p className="text-white/30 text-[10px]">
                    {sm.sendAt.replace("T", " ")}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
      {_showWallpaperPicker && (
        <div className="px-3 pb-3 bg-black/40 backdrop-blur-sm border-t border-white/10 shrink-0">
          <div className="flex items-center justify-between py-2">
            <p className="text-white/70 text-xs font-semibold">
              🎨 Chat Wallpaper
            </p>
            <button
              type="button"
              onClick={() => setShowWallpaperPicker(false)}
              className="text-white/40 text-xs"
            >
              ✕
            </button>
          </div>
          <ChatWallpaperPicker
            onSelect={(w) => {
              setChatWallpaper(w);
              setShowWallpaperPicker(false);
            }}
          />
        </div>
      )}
      {showPollModal && (
        <ChatPollModal
          onClose={() => setShowPollModal(false)}
          onSend={(poll) => setPolls((p) => [...p, poll])}
        />
      )}
      {showForwardSheet && forwardMsg && (
        <div className="fixed inset-0 z-50 flex items-end">
          <div
            className="absolute inset-0 bg-black/50"
            onClick={() => setShowForwardSheet(false)}
            onKeyDown={(e) => {
              if (e.key === "Escape") setShowForwardSheet(false);
            }}
            role="button"
            tabIndex={-1}
            aria-label="Close"
          />
          <div className="relative w-full bg-[#1a1a2e] rounded-t-3xl p-4 max-h-[60dvh] overflow-y-auto">
            <p className="text-white font-bold mb-3">Forward message to...</p>
            <p className="text-white/50 text-sm mb-4 bg-white/5 p-3 rounded-xl italic">
              "{forwardMsg}"
            </p>
            <button
              type="button"
              data-ocid="messages.confirm_button"
              onClick={async () => {
                try {
                  await sendMessage.mutateAsync({
                    to: otherUser,
                    content: `↗️ Forwarded: ${forwardMsg}`,
                  });
                } catch {}
                setShowForwardSheet(false);
              }}
              className="w-full py-3 rounded-2xl text-white font-semibold"
              style={{
                background: "linear-gradient(135deg, #ec4899, #a855f7)",
              }}
            >
              Forward Here
            </button>
          </div>
        </div>
      )}
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
