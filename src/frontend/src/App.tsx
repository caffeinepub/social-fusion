import { Toaster } from "@/components/ui/sonner";
import type { Principal } from "@icp-sdk/core/principal";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
import BottomNav, { type Tab } from "./components/BottomNav";
import LoginScreen from "./components/LoginScreen";
import ProfileSetup from "./components/ProfileSetup";
import UserProfileView from "./components/UserProfileView";
import CreateTab from "./components/tabs/CreateTab";
import DiscoverTab from "./components/tabs/DiscoverTab";
import HomeTab from "./components/tabs/HomeTab";
import MessagesTab from "./components/tabs/MessagesTab";
import ProfileTab from "./components/tabs/ProfileTab";
import { useInternetIdentity } from "./hooks/useInternetIdentity";
import { useGetCallerProfileForAuth } from "./hooks/useQueries";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { staleTime: 30_000 },
  },
});

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AppInner />
      <Toaster position="top-center" richColors />
    </QueryClientProvider>
  );
}

function AppInner() {
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
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-primary to-secondary animate-pulse" />
            <p className="text-muted-foreground text-sm">Loading...</p>
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
  const [activeTab, setActiveTab] = useState<Tab>("home");
  const [viewingUser, setViewingUser] = useState<Principal | null>(null);

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

  return (
    <div className="flex flex-col h-dvh">
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
            {activeTab === "home" && <HomeTab onUserClick={handleUserClick} />}
            {activeTab === "discover" && (
              <DiscoverTab onUserClick={handleUserClick} />
            )}
            {activeTab === "create" && (
              <CreateTab onSuccess={() => setActiveTab("home")} />
            )}
            {activeTab === "messages" && <MessagesTab />}
            {activeTab === "profile" && <ProfileTab />}
          </motion.div>
        </AnimatePresence>
      </main>
      <BottomNav active={activeTab} onChange={setActiveTab} />
    </div>
  );
}
