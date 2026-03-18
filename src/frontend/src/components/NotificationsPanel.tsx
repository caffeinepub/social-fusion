import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import type { Principal } from "@icp-sdk/core/principal";
import {
  Bell,
  BellOff,
  Check,
  Heart,
  MessageCircle,
  UserPlus,
  X,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import type { Notification } from "../backend";
import {
  useGetNotifications,
  useGetUserProfile,
  useMarkNotificationsRead,
} from "../hooks/useQueries";

interface Props {
  open: boolean;
  onClose: () => void;
}

export default function NotificationsPanel({ open, onClose }: Props) {
  const { data: notifications, isLoading } = useGetNotifications();
  const markRead = useMarkNotificationsRead();

  const handleMarkAllRead = () => {
    markRead.mutate();
  };

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
            className="fixed inset-0 bg-black/40 z-40"
            onClick={onClose}
          />
          {/* Panel */}
          <motion.div
            key="notif-panel"
            data-ocid="notifications.panel"
            initial={{ opacity: 0, y: -16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -16 }}
            transition={{ duration: 0.2 }}
            className="fixed top-0 left-1/2 -translate-x-1/2 w-full max-w-[430px] bg-card border-b border-border shadow-2xl z-50 max-h-[75dvh] flex flex-col rounded-b-3xl overflow-hidden"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-4 border-b border-border shrink-0">
              <div className="flex items-center gap-2">
                <Bell className="w-5 h-5 text-primary" />
                <h2 className="font-bold text-base font-display">
                  Notifications
                </h2>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  data-ocid="notifications.secondary_button"
                  onClick={handleMarkAllRead}
                  disabled={markRead.isPending}
                  className="text-xs text-primary flex items-center gap-1 hover:opacity-80 transition-opacity"
                >
                  <Check className="w-3.5 h-3.5" /> Mark all read
                </button>
                <button
                  type="button"
                  data-ocid="notifications.close_button"
                  onClick={onClose}
                  className="w-8 h-8 rounded-full bg-muted flex items-center justify-center"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* List */}
            <div className="flex-1 overflow-y-auto">
              {isLoading ? (
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
              ) : notifications && notifications.length > 0 ? (
                <div className="flex flex-col">
                  {notifications.map((notif, i) => (
                    <NotificationItem
                      key={notif.id.toString()}
                      notification={notif}
                      index={i}
                    />
                  ))}
                </div>
              ) : (
                <div
                  data-ocid="notifications.empty_state"
                  className="flex flex-col items-center justify-center py-12 gap-3"
                >
                  <BellOff className="w-10 h-10 text-muted-foreground" />
                  <p className="text-muted-foreground text-sm">
                    No notifications yet
                  </p>
                </div>
              )}
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
}: {
  notification: Notification;
  index: number;
}) {
  const { data: fromProfile } = useGetUserProfile(
    notification.fromUser as Principal,
  );

  const getIcon = () => {
    switch (notification.kind) {
      case "follow":
        return <UserPlus className="w-3.5 h-3.5 text-blue-500" />;
      case "like":
        return <Heart className="w-3.5 h-3.5 text-rose-500" />;
      case "comment":
        return <MessageCircle className="w-3.5 h-3.5 text-green-500" />;
      case "match":
        return <Heart className="w-3.5 h-3.5 text-pink-500" />;
      default:
        return <Bell className="w-3.5 h-3.5 text-muted-foreground" />;
    }
  };

  const getText = () => {
    const name = fromProfile?.displayName || "Someone";
    switch (notification.kind) {
      case "follow":
        return `${name} started following you`;
      case "like":
        return `${name} liked your post`;
      case "comment":
        return `${name} commented on your post`;
      case "match":
        return `You matched with ${name}! 💕`;
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

  return (
    <div
      data-ocid={`notifications.item.${index + 1}`}
      className={`flex items-center gap-3 px-4 py-3 border-b border-border/50 ${
        !notification.read ? "bg-primary/5" : ""
      }`}
    >
      <div className="relative shrink-0">
        <Avatar className="w-10 h-10">
          {fromProfile?.avatar && (
            <AvatarImage src={fromProfile.avatar.getDirectURL()} />
          )}
          <AvatarFallback className="bg-muted text-sm">
            {fromProfile?.displayName?.[0]?.toUpperCase() || "?"}
          </AvatarFallback>
        </Avatar>
        <div className="absolute -bottom-0.5 -right-0.5 w-5 h-5 rounded-full bg-card flex items-center justify-center border border-border">
          {getIcon()}
        </div>
      </div>
      <div className="flex flex-col flex-1 min-w-0">
        <p className="text-sm leading-snug">{getText()}</p>
        <p className="text-xs text-muted-foreground mt-0.5">
          {formatTs(notification.timestamp)}
        </p>
      </div>
      {!notification.read && (
        <div className="w-2 h-2 rounded-full bg-primary shrink-0" />
      )}
    </div>
  );
}
