import {
  Compass,
  Heart,
  HeartHandshake,
  MessageCircle,
  User,
  Users,
} from "lucide-react";
import { motion } from "motion/react";
import { useGetUnreadNotificationCount } from "../hooks/useQueries";

export type Tab = "browse" | "requests" | "matches" | "chats" | "profile";

interface Props {
  active: Tab;
  onChange: (tab: Tab) => void;
  requestCount?: number;
}

const tabs: {
  id: Tab;
  icon: React.FC<{ className?: string }>;
  label: string;
}[] = [
  { id: "browse", icon: Compass, label: "Browse" },
  { id: "requests", icon: HeartHandshake, label: "Requests" },
  { id: "matches", icon: Users, label: "Matches" },
  { id: "chats", icon: MessageCircle, label: "Chats" },
  { id: "profile", icon: User, label: "Profile" },
];

export default function BottomNav({
  active,
  onChange,
  requestCount = 0,
}: Props) {
  const { data: unreadCount } = useGetUnreadNotificationCount();
  const hasUnread = unreadCount !== undefined && unreadCount > 0n;

  return (
    <nav
      data-ocid="nav.panel"
      className="bottom-nav fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[430px] bg-[#0d0d14]/95 backdrop-blur-xl border-t border-white/5 flex items-center justify-around px-2 h-16 z-50"
    >
      {tabs.map((tab) => {
        const Icon = tab.icon;
        const isActive = active === tab.id;
        const showBadge =
          (tab.id === "chats" && hasUnread) ||
          (tab.id === "requests" && requestCount > 0);
        return (
          <button
            key={tab.id}
            type="button"
            data-ocid={`nav.${tab.id}.link`}
            onClick={() => onChange(tab.id)}
            className="relative flex flex-col items-center justify-center flex-1 h-full gap-0.5"
            aria-label={tab.label}
          >
            <div className="relative">
              <Icon
                className={`w-5 h-5 transition-colors ${
                  isActive ? "text-pink-500" : "text-white/40"
                }`}
              />
              {showBadge && (
                <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-pink-500 border border-[#0d0d14]" />
              )}
            </div>
            <span
              className={`text-[10px] font-medium transition-colors ${
                isActive ? "text-pink-500" : "text-white/30"
              }`}
            >
              {tab.label}
            </span>
            {isActive && (
              <motion.div
                layoutId="nav-indicator"
                className="absolute bottom-0.5 w-6 h-0.5 rounded-full bg-gradient-to-r from-pink-500 to-purple-500"
              />
            )}
          </button>
        );
      })}
    </nav>
  );
}
