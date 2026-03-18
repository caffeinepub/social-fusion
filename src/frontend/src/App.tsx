import type { Principal } from "@icp-sdk/core/principal";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
import BottomNav, { type Tab } from "./components/BottomNav";
import LoginScreen from "./components/LoginScreen";
import NotificationsPanel from "./components/NotificationsPanel";
import ProfileSetup from "./components/ProfileSetup";
import UserProfileView from "./components/UserProfileView";
import DiscoverTab from "./components/tabs/DiscoverTab";
import MatchesTab from "./components/tabs/MatchesTab";
import MessagesTab from "./components/tabs/MessagesTab";
import ProfileTab from "./components/tabs/ProfileTab";
import RequestsTab from "./components/tabs/RequestsTab";
import { useInternetIdentity } from "./hooks/useInternetIdentity";
import { useGetCallerProfileForAuth, usePrefetchAll } from "./hooks/useQueries";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { staleTime: 60_000 },
  },
});

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AppInner />
    </QueryClientProvider>
  );
}

function AppInner() {
  usePrefetchAll();
  const { identity, isInitializing } = useInternetIdentity();
  const isAuthenticated = !!identity;

  const {
    data: userProfile,
    isLoading: profileLoading,
    isFetched,
  } = useGetCallerProfileForAuth();

  const showProfileSetup =
    isAuthenticated && !profileLoading && isFetched && userProfile === null;

  if (isInitializing || (isAuthenticated && profileLoading && !isFetched)) {
    return (
      <div className="app-container">
        <div className="min-h-dvh flex items-center justify-center">
          <div className="flex flex-col items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-pink-500 to-purple-600 animate-pulse" />
            <p className="text-white/50 text-sm">Loading Social Fusion...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="app-container">
        <LoginScreen />
      </div>
    );
  }

  if (showProfileSetup) {
    return (
      <div className="app-container">
        <ProfileSetup />
      </div>
    );
  }

  return (
    <div className="app-container">
      <MainApp />
    </div>
  );
}

function MainApp() {
  const [activeTab, setActiveTab] = useState<Tab>("browse");
  const [viewingUser, setViewingUser] = useState<Principal | null>(null);
  const [notifOpen, setNotifOpen] = useState(false);
  const [chatOpen, setChatOpen] = useState(false);

  const handleUserClick = (p: Principal) => setViewingUser(p);
  const handleBack = () => setViewingUser(null);

  if (viewingUser) {
    return (
      <div className="flex flex-col h-dvh">
        <main className="flex-1 overflow-hidden">
          <UserProfileView principal={viewingUser} onBack={handleBack} />
        </main>
        <BottomNav active={activeTab} onChange={setActiveTab} />
      </div>
    );
  }

  // Hide header on browse tab (DiscoverTab has its own inline header)
  const showGlobalHeader = activeTab !== "browse";

  return (
    <div className="flex flex-col h-dvh">
      {/* Fixed header strip - hidden on browse tab */}
      {showGlobalHeader && (
        <header
          className="shrink-0 flex items-center justify-between px-4 bg-[#0a0a0f] border-b border-white/5"
          style={{ height: 48 }}
        >
          <span
            className="font-display font-bold text-lg"
            style={{
              background: "linear-gradient(90deg, #ec4899 0%, #a855f7 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
            }}
          >
            Social Fusion
          </span>
        </header>
      )}

      <main className="flex-1 overflow-hidden">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.15 }}
            className="h-full"
          >
            {activeTab === "browse" && (
              <DiscoverTab
                onUserClick={handleUserClick}
                onNotifOpen={() => setNotifOpen(true)}
              />
            )}
            {activeTab === "requests" && (
              <RequestsTab onUserClick={handleUserClick} />
            )}
            {activeTab === "matches" && (
              <MatchesTab
                onUserClick={handleUserClick}
                onMessageUser={() => setActiveTab("chats")}
              />
            )}
            {activeTab === "chats" && (
              <MessagesTab onChatOpenChange={setChatOpen} />
            )}
            {activeTab === "profile" && <ProfileTab />}
          </motion.div>
        </AnimatePresence>
      </main>

      {/* Hide bottom nav when a chat conversation is open */}
      {!chatOpen && <BottomNav active={activeTab} onChange={setActiveTab} />}

      <NotificationsPanel
        open={notifOpen}
        onClose={() => setNotifOpen(false)}
        onProfileClick={(p) => {
          setViewingUser(p);
          setNotifOpen(false);
        }}
      />
    </div>
  );
}
