import { Home, MessageCircle, PlusSquare, Search, User } from "lucide-react";
import { motion } from "motion/react";
import { useGetUnreadNotificationCount } from "../hooks/useQueries";

export type Tab = "home" | "discover" | "create" | "messages" | "profile";

interface Props {
  active: Tab;
  onChange: (tab: Tab) => void;
}

const tabs: {
  id: Tab;
  icon: React.FC<{ className?: string }>;
  label: string;
}[] = [
  { id: "home", icon: Home, label: "Home" },
  { id: "discover", icon: Search, label: "Discover" },
  { id: "create", icon: PlusSquare, label: "Create" },
  { id: "messages", icon: MessageCircle, label: "Messages" },
  { id: "profile", icon: User, label: "Profile" },
];

export default function BottomNav({ active, onChange }: Props) {
  const { data: unreadCount } = useGetUnreadNotificationCount();
  const hasUnread = unreadCount !== undefined && unreadCount > 0n;

  return (
    <nav
      data-ocid="nav.panel"
      className="bottom-nav fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[430px] bg-card/90 backdrop-blur-xl border-t border-border flex items-center justify-around px-2 h-16 z-50"
    >
      {tabs.map((tab) => {
        const Icon = tab.icon;
        const isActive = active === tab.id;
        const isCreate = tab.id === "create";
        const showBadge = tab.id === "home" && hasUnread;
        return (
          <button
            key={tab.id}
            type="button"
            data-ocid={`nav.${tab.id}.link`}
            onClick={() => onChange(tab.id)}
            className="relative flex flex-col items-center justify-center flex-1 h-full gap-0.5"
            aria-label={tab.label}
          >
            {isCreate ? (
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center shadow-md shadow-primary/30">
                <Icon className="w-5 h-5 text-white" />
              </div>
            ) : (
              <>
                <div className="relative">
                  <Icon
                    className={`w-5 h-5 transition-colors ${
                      isActive ? "text-primary" : "text-muted-foreground"
                    }`}
                  />
                  {showBadge && (
                    <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-destructive" />
                  )}
                </div>
                {isActive && (
                  <motion.div
                    layoutId="nav-indicator"
                    className="absolute bottom-1 w-1 h-1 rounded-full bg-primary"
                  />
                )}
              </>
            )}
          </button>
        );
      })}
    </nav>
  );
}
