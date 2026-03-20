import type { Principal } from "@icp-sdk/core/principal";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
import BiometricLockScreen from "./components/BiometricLockScreen";
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
import { PrivacyProvider } from "./contexts/PrivacyContext";
import { ThemeProvider } from "./contexts/ThemeContext";
import { useActor } from "./hooks/useActor";
import { useCallSignal } from "./hooks/useCallSignal";
import { useInternetIdentity } from "./hooks/useInternetIdentity";
import {
  useGetAllProfiles,
  useGetCallerProfileForAuth,
  useGetMatches,
  usePrefetchAll,
} from "./hooks/useQueries";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30_000,
      gcTime: 5 * 60_000,
      retry: 2,
      retryDelay: (attempt) => Math.min(500 * 2 ** attempt, 5000),
    },
  },
});

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <PrivacyProvider>
          <AppInner />
        </PrivacyProvider>
      </ThemeProvider>
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
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-pink-500 to-purple-600 animate-pulse" />
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
  const [prevTab, setPrevTab] = useState<Tab>("browse");
  const [viewingUser, setViewingUser] = useState<Principal | null>(null);
  const [notifOpen, setNotifOpen] = useState(false);
  const [chatOpen, setChatOpen] = useState(false);
  const [storyOpen, setStoryOpen] = useState(false);
  const [liveOpen, setLiveOpen] = useState(false);

  const [globalCallMode, setGlobalCallMode] = useState<
    "voice" | "video" | null
  >(null);
  const [globalCallProfile, setGlobalCallProfile] = useState<
    { displayName: string; avatar?: { getDirectURL: () => string } } | undefined
  >(undefined);
  const [globalCallRole, setGlobalCallRole] = useState<"caller" | "callee">(
    "caller",
  );
  const [activeCallId, setActiveCallId] = useState<string | null>(null);
  const [globalCallOtherPrincipal, setGlobalCallOtherPrincipal] =
    useState<Principal | null>(null);

  // Biometric lock state per tab
  const [profileUnlocked, setProfileUnlocked] = useState(false);
  const [chatUnlocked, setChatUnlocked] = useState(false);

  const biometricEnabled =
    localStorage.getItem("sf_biometric_enabled") === "true";

  const handleTabChange = (tab: Tab) => {
    if (prevTab !== tab) {
      if (biometricEnabled) {
        if (tab !== "profile") setProfileUnlocked(false);
        if (tab !== "chats") setChatUnlocked(false);
      }
    }
    setPrevTab(activeTab);
    setActiveTab(tab);
  };

  const { data: allProfiles } = useGetAllProfiles();
  const { identity } = useInternetIdentity();
  const { actor } = useActor();
  const myPrincipal = identity?.getPrincipal().toString();

  const { data: matchesList } = useGetMatches();
  const {
    incomingCall,
    broadcastCall,
    broadcastCallViaBackend,
    broadcastAccept,
    broadcastReject,
    clearIncoming,
  } = useCallSignal(myPrincipal, matchesList ?? [], actor);

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

  const showIncomingCall =
    !!incomingCall && incomingCall.callerPrincipal !== myPrincipal;

  const handleAcceptIncoming = () => {
    if (!incomingCall) return;
    broadcastAccept(incomingCall.callId);
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
    setGlobalCallRole("callee");
    setActiveCallId(incomingCall.callId);
    // Set other principal from allProfiles
    if (found) {
      setGlobalCallOtherPrincipal(found[0]);
    }
    clearIncoming();
  };

  const handleRejectIncoming = () => {
    if (!incomingCall) return;
    broadcastReject(incomingCall.callId);
  };

  if (globalCallMode && globalCallProfile) {
    return (
      <div className="app-container">
        <CallScreen
          mode={globalCallMode}
          role={globalCallRole}
          callId={activeCallId ?? undefined}
          otherProfile={
            globalCallProfile as Parameters<
              typeof CallScreen
            >[0]["otherProfile"]
          }
          otherPrincipal={globalCallOtherPrincipal ?? undefined}
          actor={actor}
          onEnd={() => {
            setGlobalCallMode(null);
            setGlobalCallProfile(undefined);
            setActiveCallId(null);
            setGlobalCallOtherPrincipal(null);
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
        <BottomNav active={activeTab} onChange={handleTabChange} />
        {showIncomingCall && (
          <IncomingCallOverlay
            profile={(() => {
              const found = allProfiles?.find(
                ([p]) => p.toString() === incomingCall!.callerPrincipal,
              );
              return found
                ? (found[1] as Parameters<
                    typeof IncomingCallOverlay
                  >[0]["profile"])
                : undefined;
            })()}
            mode={incomingCall!.mode}
            onAccept={handleAcceptIncoming}
            onReject={handleRejectIncoming}
          />
        )}
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
            {activeTab === "browse" && (
              <DiscoverTab
                onUserClick={handleUserClick}
                onNotifOpen={() => setNotifOpen(true)}
                onStoryOpen={() => setStoryOpen(true)}
                onStoryClose={() => setStoryOpen(false)}
                onLiveOpen={() => setLiveOpen(true)}
                onLiveClose={() => setLiveOpen(false)}
              />
            )}
            {activeTab === "requests" && (
              <RequestsTab
                onUserClick={handleUserClick}
                onMessageUser={() => setActiveTab("chats")}
                onInitCall={(callee, mode) => {
                  const profile = allProfiles?.find(
                    ([p]) => p.toString() === callee.toString(),
                  );
                  const cid = broadcastCall(
                    callee.toString(),
                    mode,
                    myPrincipal,
                  );
                  broadcastCallViaBackend?.(callee, mode, myPrincipal);
                  setGlobalCallMode(mode);
                  setGlobalCallRole("caller");
                  setActiveCallId(cid);
                  setGlobalCallOtherPrincipal(callee);
                  setGlobalCallProfile(
                    profile?.[1] as typeof globalCallProfile,
                  );
                }}
              />
            )}
            {activeTab === "matches" && (
              <MatchesTab
                onUserClick={handleUserClick}
                onMessageUser={() => setActiveTab("chats")}
              />
            )}
            {activeTab === "chats" &&
              (biometricEnabled && !chatUnlocked ? (
                <AnimatePresence>
                  <BiometricLockScreen onUnlock={() => setChatUnlocked(true)} />
                </AnimatePresence>
              ) : (
                <MessagesTab
                  onChatOpenChange={setChatOpen}
                  onViewProfile={handleUserClick}
                  onInitCall={(callee, mode) => {
                    const profile = allProfiles?.find(
                      ([p]) => p.toString() === callee.toString(),
                    );
                    const cid = broadcastCall(
                      callee.toString(),
                      mode,
                      myPrincipal,
                    );
                    broadcastCallViaBackend?.(callee, mode, myPrincipal);
                    setGlobalCallMode(mode);
                    setGlobalCallRole("caller");
                    setActiveCallId(cid);
                    setGlobalCallOtherPrincipal(callee);
                    setGlobalCallProfile(
                      profile?.[1] as typeof globalCallProfile,
                    );
                  }}
                />
              ))}
            {activeTab === "profile" &&
              (biometricEnabled && !profileUnlocked ? (
                <AnimatePresence>
                  <BiometricLockScreen
                    onUnlock={() => setProfileUnlocked(true)}
                  />
                </AnimatePresence>
              ) : (
                <ProfileTab />
              ))}
          </motion.div>
        </AnimatePresence>
      </main>

      {!chatOpen && !storyOpen && !liveOpen && (
        <BottomNav active={activeTab} onChange={handleTabChange} />
      )}

      <NotificationsPanel
        open={notifOpen}
        onClose={() => setNotifOpen(false)}
        onProfileClick={(p) => {
          setViewingUser(p);
          setNotifOpen(false);
        }}
      />

      {showIncomingCall && (
        <IncomingCallOverlay
          profile={(() => {
            const found = allProfiles?.find(
              ([p]) => p.toString() === incomingCall!.callerPrincipal,
            );
            return found
              ? (found[1] as Parameters<
                  typeof IncomingCallOverlay
                >[0]["profile"])
              : undefined;
          })()}
          mode={incomingCall!.mode}
          onAccept={handleAcceptIncoming}
          onReject={handleRejectIncoming}
        />
      )}
    </div>
  );
}
