import type { Principal } from "@icp-sdk/core/principal";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
import BottomNav, { type Tab } from "./components/BottomNav";
import CallScreen from "./components/CallScreen";
import IncomingCallOverlay from "./components/IncomingCallOverlay";
import LoginScreen from "./components/LoginScreen";
import NotificationsPanel from "./components/NotificationsPanel";
import ProfileSetup from "./components/ProfileSetup";
import UserProfileView from "./components/UserProfileView";
import DiscoverTab from "./components/tabs/DiscoverTab";
import MatchesTab from "./components/tabs/MatchesTab";
import MessagesTab from "./components/tabs/MessagesTab";
import ProfileTab from "./components/tabs/ProfileTab";
import RequestsTab from "./components/tabs/RequestsTab";
import { useCallSignal } from "./hooks/useCallSignal";
import { useInternetIdentity } from "./hooks/useInternetIdentity";
import {
  useGetAllProfiles,
  useGetCallerProfileForAuth,
  usePrefetchAll,
} from "./hooks/useQueries";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 2 * 60_000,
      gcTime: 10 * 60_000,
      retry: 3,
      retryDelay: (attempt) => Math.min(1000 * 2 ** attempt, 10000),
    },
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

  if (isInitializing) {
    return (
      <div className="app-container">
        <div className="min-h-dvh flex items-center justify-center">
          <div className="flex flex-col items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-pink-500 to-purple-600 animate-pulse" />
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
  const [globalCallMode, setGlobalCallMode] = useState<
    "voice" | "video" | null
  >(null);
  const [globalCallProfile, setGlobalCallProfile] = useState<
    { displayName: string; avatar?: { getDirectURL: () => string } } | undefined
  >(undefined);
  const [activeCallId, setActiveCallId] = useState<string | null>(null);

  const { data: allProfiles } = useGetAllProfiles();

  const { incomingCall, broadcastAccept, broadcastReject, clearIncoming } =
    useCallSignal();

  const { data: userProfile, isFetched } = useGetCallerProfileForAuth();
  const needsSetup = isFetched && userProfile === null;

  if (needsSetup) {
    return (
      <div className="flex flex-col h-dvh">
        <ProfileSetup />
      </div>
    );
  }

  const handleUserClick = (p: Principal) => setViewingUser(p);
  const handleBack = () => setViewingUser(null);

  // Global incoming call handler
  const handleAcceptIncoming = () => {
    if (!incomingCall) return;
    broadcastAccept(incomingCall.callId);
    // Find caller profile
    const found = allProfiles?.find(
      ([p]) => p.toString() === incomingCall.callerPrincipal,
    );
    setGlobalCallProfile(
      found
        ? (found[1] as {
            displayName: string;
            avatar?: { getDirectURL: () => string };
          })
        : undefined,
    );
    setGlobalCallMode(incomingCall.mode);
    setActiveCallId(incomingCall.callId);
    clearIncoming();
  };

  const handleRejectIncoming = () => {
    if (!incomingCall) return;
    broadcastReject(incomingCall.callId);
  };

  // If we have an active call from incoming, show CallScreen
  if (globalCallMode && globalCallProfile) {
    return (
      <div className="app-container">
        <CallScreen
          mode={globalCallMode}
          otherProfile={
            globalCallProfile as Parameters<
              typeof CallScreen
            >[0]["otherProfile"]
          }
          onEnd={() => {
            if (activeCallId) {
              // broadcastEnd would go here
            }
            setGlobalCallMode(null);
            setGlobalCallProfile(undefined);
            setActiveCallId(null);
          }}
        />
      </div>
    );
  }

  if (viewingUser) {
    return (
      <div className="flex flex-col h-dvh">
        <main className="flex-1 overflow-hidden">
          <UserProfileView principal={viewingUser} onBack={handleBack} />
        </main>
        <BottomNav active={activeTab} onChange={setActiveTab} />
        {/* Global incoming call overlay */}
        {incomingCall && (
          <IncomingCallOverlay
            profile={(() => {
              const found = allProfiles?.find(
                ([p]) => p.toString() === incomingCall.callerPrincipal,
              );
              return found
                ? (found[1] as Parameters<
                    typeof IncomingCallOverlay
                  >[0]["profile"])
                : undefined;
            })()}
            mode={incomingCall.mode}
            onAccept={handleAcceptIncoming}
            onReject={handleRejectIncoming}
          />
        )}
      </div>
    );
  }

  const showGlobalHeader = activeTab !== "browse";

  return (
    <div className="flex flex-col h-dvh">
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

      {!chatOpen && <BottomNav active={activeTab} onChange={setActiveTab} />}

      <NotificationsPanel
        open={notifOpen}
        onClose={() => setNotifOpen(false)}
        onProfileClick={(p) => {
          setViewingUser(p);
          setNotifOpen(false);
        }}
      />

      {/* Global incoming call overlay */}
      {incomingCall && (
        <IncomingCallOverlay
          profile={(() => {
            const found = allProfiles?.find(
              ([p]) => p.toString() === incomingCall.callerPrincipal,
            );
            return found
              ? (found[1] as Parameters<
                  typeof IncomingCallOverlay
                >[0]["profile"])
              : undefined;
          })()}
          mode={incomingCall.mode}
          onAccept={handleAcceptIncoming}
          onReject={handleRejectIncoming}
        />
      )}
    </div>
  );
}
