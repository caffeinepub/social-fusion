import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import type { Principal } from "@icp-sdk/core/principal";
import {
  Bell,
  BellOff,
  Check,
  Eye,
  Heart,
  MessageCircle,
  Phone,
  Star,
  UserCheck,
  UserPlus,
  X,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
import type { Notification } from "../backend";
import { useInternetIdentity } from "../hooks/useInternetIdentity";
import {
  useGetNotifications,
  useGetUserProfile,
  useMarkNotificationsRead,
} from "../hooks/useQueries";
import { ProfileVisitBanner } from "./ProfileVisitTracker";

type FilterChip =
  | "all"
  | "comments"
  | "replies"
  | "requests"
  | "matches"
  | "calls"
  | "thanks"
  | "stars"
  | "viewed";

const FILTER_CHIPS: { id: FilterChip; label: string }[] = [
  { id: "all", label: "All" },
  { id: "comments", label: "Comments" },
  { id: "replies", label: "Replies" },
  { id: "requests", label: "Requests" },
  { id: "matches", label: "Matches" },
  { id: "calls", label: "Calls" },
  { id: "thanks", label: "Thanks" },
  { id: "stars", label: "Stars" },
  { id: "viewed", label: "👁️ Viewed Me" },
];

const FILTER_KINDS: Record<FilterChip, string[]> = {
  all: [],
  comments: ["comment"],
  replies: ["reply"],
  requests: ["friend_request", "match_request", "follow"],
  matches: ["friend_accept", "match"],
  calls: ["call"],
  thanks: ["thanks"],
  stars: ["star", "like"],
  viewed: [],
};

interface Props {
  open: boolean;
  onClose: () => void;
  onProfileClick?: (principal: Principal) => void;
}

export default function NotificationsPanel({
  open,
  onClose,
  onProfileClick,
}: Props) {
  const { data: notifications, isLoading } = useGetNotifications();
  const markRead = useMarkNotificationsRead();
  const [activeFilter, setActiveFilter] = useState<FilterChip>("all");
  const { identity } = useInternetIdentity();
  const myPrincipal = identity?.getPrincipal()?.toString() ?? "";

  const handleMarkAllRead = () => {
    markRead.mutate();
  };

  const filteredNotifications = (notifications ?? []).filter((n) => {
    if (activeFilter === "all" || activeFilter === "viewed") return true;
    const kinds = FILTER_KINDS[activeFilter];
    return kinds.includes(n.kind);
  });

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            key="notif-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
            onClick={onClose}
          />
          {/* Centered card */}
          <motion.div
            key="notif-modal"
            data-ocid="notifications.panel"
            initial={{ opacity: 0, scale: 0.85 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.85 }}
            transition={{
              type: "spring",
              damping: 22,
              stiffness: 300,
            }}
            className="fixed inset-0 z-50 flex items-center justify-center px-4 pointer-events-none"
          >
            <div className="pointer-events-auto w-full max-w-sm bg-[#1a1a2e] border border-white/15 rounded-2xl shadow-2xl flex flex-col overflow-hidden max-h-[85dvh]">
              {/* Header */}
              <div className="flex items-center justify-between px-4 py-3.5 border-b border-white/10 shrink-0">
                <div className="flex items-center gap-2">
                  <Bell className="w-4 h-4 text-pink-400" />
                  <h2 className="font-bold text-base text-white">
                    Notifications
                  </h2>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    data-ocid="notifications.secondary_button"
                    onClick={handleMarkAllRead}
                    disabled={markRead.isPending}
                    className="text-xs text-pink-400 flex items-center gap-1 hover:opacity-80 transition-opacity"
                  >
                    <Check className="w-3.5 h-3.5" /> Mark all read
                  </button>
                  <button
                    type="button"
                    data-ocid="notifications.close_button"
                    onClick={onClose}
                    className="w-7 h-7 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 transition-colors"
                  >
                    <X className="w-3.5 h-3.5 text-white" />
                  </button>
                </div>
              </div>

              {/* Filter chips */}
              <div className="flex gap-1.5 px-3 py-2.5 overflow-x-auto no-scrollbar shrink-0 border-b border-white/5">
                {FILTER_CHIPS.map(({ id, label }) => (
                  <button
                    key={id}
                    type="button"
                    data-ocid="notifications.tab"
                    onClick={() => setActiveFilter(id)}
                    className={`shrink-0 px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap transition-all ${
                      activeFilter === id
                        ? "bg-gradient-to-r from-pink-500 to-purple-600 text-white"
                        : "bg-white/8 text-white/50 hover:bg-white/12"
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>

              {/* List */}
              <div className="flex-1 overflow-y-auto">
                {activeFilter === "viewed" ? (
                  <div className="px-3">
                    <div className="flex items-center gap-2 py-3">
                      <Eye className="w-4 h-4 text-purple-400" />
                      <p className="text-white/60 text-sm font-semibold">
                        Who viewed your profile
                      </p>
                    </div>
                    <ProfileVisitBanner myPrincipal={myPrincipal} />
                  </div>
                ) : isLoading ? (
                  <div
                    data-ocid="notifications.loading_state"
                    className="p-4 flex flex-col gap-3"
                  >
                    {[1, 2, 3].map((i) => (
                      <div key={i} className="flex items-center gap-3">
                        <Skeleton className="w-10 h-10 rounded-full shrink-0" />
                        <div className="flex flex-col gap-1.5 flex-1">
                          <Skeleton className="w-48 h-3" />
                          <Skeleton className="w-24 h-2" />
                        </div>
                      </div>
                    ))}
                  </div>
                ) : filteredNotifications.length > 0 ? (
                  <div className="flex flex-col">
                    {filteredNotifications.map((notif, i) => (
                      <NotificationItem
                        key={notif.id.toString()}
                        notification={notif}
                        index={i}
                        onProfileClick={onProfileClick}
                        onClose={onClose}
                      />
                    ))}
                  </div>
                ) : (
                  <div
                    data-ocid="notifications.empty_state"
                    className="flex flex-col items-center justify-center py-12 gap-3"
                  >
                    <BellOff className="w-10 h-10 text-white/20" />
                    <p className="text-white/40 text-sm">
                      {activeFilter === "all"
                        ? "No notifications yet"
                        : `No ${activeFilter} notifications`}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

function NotificationItem({
  notification,
  index,
  onProfileClick,
  onClose,
}: {
  notification: Notification;
  index: number;
  onProfileClick?: (principal: Principal) => void;
  onClose: () => void;
}) {
  const { data: fromProfile, isLoading: profileLoading } = useGetUserProfile(
    notification.fromUser as Principal,
  );

  const getIcon = () => {
    switch (notification.kind) {
      case "follow":
        return <UserPlus className="w-3.5 h-3.5 text-blue-400" />;
      case "like":
        return <Heart className="w-3.5 h-3.5 text-rose-400" />;
      case "star":
        return <Star className="w-3.5 h-3.5 text-yellow-400" />;
      case "comment":
      case "reply":
        return <MessageCircle className="w-3.5 h-3.5 text-green-400" />;
      case "match":
      case "friend_accept":
        return <Heart className="w-3.5 h-3.5 text-pink-400" />;
      case "friend_request":
      case "match_request":
        return <UserCheck className="w-3.5 h-3.5 text-emerald-400" />;
      case "call":
        return <Phone className="w-3.5 h-3.5 text-purple-400" />;
      case "thanks":
        return <span className="text-xs">🙏</span>;
      default:
        return <Bell className="w-3.5 h-3.5 text-white/40" />;
    }
  };

  const getText = () => {
    const name = fromProfile?.displayName || "Someone";
    switch (notification.kind) {
      case "follow":
        return `${name} started following you`;
      case "like":
        return `${name} liked your post`;
      case "star":
        return `${name} gave you a star ⭐`;
      case "comment":
        return `${name} commented on your post`;
      case "reply":
        return `${name} replied to your comment`;
      case "match":
        return `You matched with ${name}! 💕`;
      case "friend_accept":
        return `${name} accepted your friend request 🎉`;
      case "friend_request":
        return `${name} sent you a friend request`;
      case "match_request":
        return `${name} wants to connect with you`;
      case "call":
        return `${name} called you`;
      case "thanks":
        return `${name} sent you thanks 🙏`;
      default:
        return `${name} sent you a notification`;
    }
  };

  const formatTs = (ts: bigint) => {
    const ms = Number(ts / 1_000_000n);
    const diff = Date.now() - ms;
    if (diff < 60_000) return "just now";
    if (diff < 3_600_000) return `${Math.floor(diff / 60_000)}m ago`;
    if (diff < 86_400_000) return `${Math.floor(diff / 3_600_000)}h ago`;
    return new Date(ms).toLocaleDateString();
  };

  const handleClick = () => {
    if (onProfileClick) {
      onProfileClick(notification.fromUser as Principal);
      onClose();
    }
  };

  return (
    <button
      type="button"
      data-ocid={`notifications.item.${index + 1}`}
      onClick={handleClick}
      className={`flex items-center gap-3 px-4 py-3 border-b border-white/5 w-full text-left transition-colors active:bg-white/5 hover:bg-white/5 ${
        !notification.read ? "bg-pink-500/5" : ""
      }`}
    >
      <div className="relative shrink-0">
        {profileLoading ? (
          <Skeleton className="w-10 h-10 rounded-full" />
        ) : (
          <Avatar className="w-10 h-10">
            {fromProfile?.avatar && (
              <AvatarImage src={fromProfile.avatar.getDirectURL()} />
            )}
            <AvatarFallback className="bg-gradient-to-br from-pink-500 to-purple-600 text-white text-sm">
              {fromProfile?.displayName?.[0]?.toUpperCase() || "?"}
            </AvatarFallback>
          </Avatar>
        )}
        <div className="absolute -bottom-0.5 -right-0.5 w-5 h-5 rounded-full bg-[#1a1a2e] flex items-center justify-center border border-white/10">
          {getIcon()}
        </div>
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-white text-sm leading-tight">{getText()}</p>
        <p className="text-white/30 text-xs mt-0.5">
          {formatTs(notification.timestamp)}
        </p>
      </div>
      {!notification.read && (
        <div className="w-2 h-2 rounded-full bg-pink-500 shrink-0" />
      )}
    </button>
  );
}
