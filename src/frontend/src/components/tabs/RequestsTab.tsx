import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import type { Principal } from "@icp-sdk/core/principal";
import {
  Check,
  Heart,
  MessageCircle,
  Phone,
  Sparkles,
  Users,
  X,
  Zap,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useEffect, useRef, useState } from "react";
import type { Profile } from "../../backend";
import { useInternetIdentity } from "../../hooks/useInternetIdentity";
import {
  useAcceptRequest,
  useBlockedUsers,
  useGetAllProfiles,
  useTinderPass,
} from "../../hooks/useQueries";

interface Props {
  onUserClick: (p: Principal) => void;
  onMessageUser?: (p: Principal) => void;
  onInitCall?: (callee: Principal, mode: "voice" | "video") => void;
}

export default function RequestsTab({
  onUserClick,
  onMessageUser,
  onInitCall,
}: Props) {
  const { data: profiles, isLoading } = useGetAllProfiles();
  const { identity } = useInternetIdentity();
  const myPrincipal = identity?.getPrincipal();
  const acceptRequest = useAcceptRequest();
  const tinderPass = useTinderPass();
  const { blockedSet } = useBlockedUsers();
  const myPrincipalStr = myPrincipal?.toString() ?? "";
  const [acceptedIds, setAcceptedIds] = useState<Set<string>>(new Set());
  const [declinedIds, setDeclinedIds] = useState<Set<string>>(new Set());
  const [justAccepted, setJustAccepted] = useState<string | null>(null);
  const spotlightScrollRef = useRef<HTMLDivElement>(null);

  const otherProfiles =
    profiles?.filter(
      ([p]) =>
        p.toString() !== myPrincipal?.toString() &&
        !acceptedIds.has(p.toString()) &&
        !declinedIds.has(p.toString()) &&
        !blockedSet.has(p.toString()),
    ) ?? [];

  // Auto-scroll spotlight row every 2.5s
  useEffect(() => {
    const el = spotlightScrollRef.current;
    if (!el) return;
    const t = setInterval(() => {
      const maxScroll = el.scrollWidth - el.clientWidth;
      if (maxScroll <= 0) return;
      if (el.scrollLeft >= maxScroll - 5) {
        el.scrollTo({ left: 0, behavior: "smooth" });
      } else {
        el.scrollBy({ left: 76, behavior: "smooth" });
      }
    }, 2500);
    return () => clearInterval(t);
  }, []);

  const handleAccept = async (principal: Principal) => {
    try {
      await acceptRequest.mutateAsync(principal);
      setAcceptedIds((prev) => new Set(prev).add(principal.toString()));
      setJustAccepted(principal.toString());
      setTimeout(() => setJustAccepted(null), 2000);
    } catch {}
  };

  const handleDecline = async (principal: Principal) => {
    try {
      await tinderPass.mutateAsync(principal);
      setDeclinedIds((prev) => new Set(prev).add(principal.toString()));
    } catch {}
  };

  const handleCallUser = (principal: Principal, _name: string) => {
    if (onInitCall) {
      onInitCall(principal, "voice");
    } else {
      const calleePid = principal.toString();
      const signal = {
        callId: `call_${Date.now()}`,
        callerPrincipal: myPrincipalStr,
        mode: "voice" as const,
        ts: Date.now(),
      };
      localStorage.setItem(
        `sf_call_signal_${calleePid}`,
        JSON.stringify(signal),
      );
      setTimeout(
        () => localStorage.removeItem(`sf_call_signal_${calleePid}`),
        45000,
      );
    }
  };

  const coupleSection = otherProfiles.slice(
    0,
    Math.ceil(otherProfiles.length / 3),
  );
  const eventSection = otherProfiles.slice(
    Math.ceil(otherProfiles.length / 3),
    Math.ceil((otherProfiles.length * 2) / 3),
  );
  const othersSection = otherProfiles.slice(
    Math.ceil((otherProfiles.length * 2) / 3),
  );

  return (
    <div
      data-ocid="requests.page"
      className="flex flex-col h-full bg-[#0a0a0f]"
    >
      {/* Header */}
      <div className="px-4 pt-5 pb-3 shrink-0">
        <h1 className="text-xl font-bold text-white">Match Requests</h1>
        <p className="text-white/40 text-sm mt-0.5">People interested in you</p>
      </div>

      {/* ✨ Spotlight Section — auto-scrolling */}
      {otherProfiles.length > 0 && (
        <div className="shrink-0 mb-2">
          <div className="px-4 py-1 flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-yellow-400" />
            <span className="text-white font-semibold text-sm">Spotlight</span>
          </div>
          <div
            ref={spotlightScrollRef}
            className="flex gap-3 px-4 overflow-x-auto no-scrollbar pb-2"
          >
            {otherProfiles.map(([principal, profile]) => (
              <button
                key={principal.toString()}
                type="button"
                data-ocid="requests.button"
                onClick={() => onUserClick(principal)}
                className="shrink-0 flex flex-col items-center gap-1.5 active:scale-95 transition-transform"
              >
                <div className="relative w-16 h-16">
                  <div
                    className="absolute inset-0 rounded-full"
                    style={{
                      background:
                        "linear-gradient(135deg, #fbbf24, #f59e0b, #d97706)",
                      padding: 2,
                    }}
                  >
                    <div className="w-full h-full rounded-full bg-[#0a0a0f] flex items-center justify-center overflow-hidden">
                      {profile.avatar ? (
                        <img
                          src={profile.avatar.getDirectURL()}
                          alt={profile.displayName}
                          className="w-full h-full object-cover rounded-full"
                        />
                      ) : (
                        <span className="text-white text-xl font-bold">
                          {profile.displayName[0]?.toUpperCase()}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="absolute -bottom-0.5 -right-0.5 w-5 h-5 rounded-full bg-yellow-400 border-2 border-[#0a0a0f] flex items-center justify-center">
                    <Zap className="w-2.5 h-2.5 text-black" />
                  </div>
                </div>
                <span className="text-white/80 text-[10px] font-medium w-16 text-center truncate">
                  {profile.displayName}
                </span>
                {profile.location && (
                  <span className="text-white/40 text-[9px] truncate w-16 text-center">
                    📍 {profile.location}
                  </span>
                )}
              </button>
            ))}
          </div>
          <div className="mx-4 h-px bg-white/10 mt-1" />
        </div>
      )}

      <div className="flex-1 overflow-y-auto pb-20">
        {isLoading ? (
          <div className="p-4 flex flex-col gap-3">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                data-ocid="requests.loading_state"
                className="flex items-center gap-3 p-3"
              >
                <Skeleton className="w-14 h-14 rounded-full" />
                <div className="flex flex-col gap-2 flex-1">
                  <Skeleton className="w-32 h-3" />
                  <Skeleton className="w-24 h-2" />
                </div>
              </div>
            ))}
          </div>
        ) : otherProfiles.length > 0 ? (
          <div className="px-4 flex flex-col gap-1">
            {/* 💑 Couple Match Section */}
            <div className="flex items-center gap-2 py-2">
              <span className="text-base">💑</span>
              <span className="text-white/70 text-xs font-semibold uppercase tracking-wider">
                Couple Match
              </span>
              <div className="flex-1 h-px bg-white/10" />
            </div>
            <AnimatePresence>
              {coupleSection.map(([principal, profile], i) => (
                <motion.div
                  key={principal.toString()}
                  initial={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0, marginBottom: 0 }}
                  transition={{ duration: 0.3 }}
                  data-ocid={`requests.item.${i + 1}`}
                  className="relative bg-white/5 rounded-2xl p-3 border border-white/5 overflow-hidden mb-2"
                >
                  <RequestCard
                    principal={principal}
                    profile={profile}
                    idx={i}
                    justAccepted={justAccepted}
                    onUserClick={onUserClick}
                    onAccept={handleAccept}
                    onDecline={handleDecline}
                    onMessage={onMessageUser}
                    onCall={handleCallUser}
                    acceptPending={acceptRequest.isPending}
                  />
                </motion.div>
              ))}
            </AnimatePresence>

            {/* 🎉 Event Match Section */}
            {eventSection.length > 0 && (
              <>
                <div className="flex items-center gap-2 py-2 mt-2">
                  <span className="text-base">🎉</span>
                  <span className="text-white/70 text-xs font-semibold uppercase tracking-wider">
                    Event Match
                  </span>
                  <div className="flex-1 h-px bg-white/10" />
                </div>
                <AnimatePresence>
                  {eventSection.map(([principal, profile], i) => {
                    const idx = coupleSection.length + i;
                    return (
                      <motion.div
                        key={`event-${principal.toString()}`}
                        initial={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0, marginBottom: 0 }}
                        transition={{ duration: 0.3 }}
                        data-ocid={`requests.item.${idx + 1}`}
                        className="relative bg-white/5 rounded-2xl p-3 border border-white/5 overflow-hidden mb-2"
                      >
                        <RequestCard
                          principal={principal}
                          profile={profile}
                          idx={idx}
                          justAccepted={justAccepted}
                          onUserClick={onUserClick}
                          onAccept={handleAccept}
                          onDecline={handleDecline}
                          onMessage={onMessageUser}
                          onCall={handleCallUser}
                          acceptPending={acceptRequest.isPending}
                        />
                      </motion.div>
                    );
                  })}
                </AnimatePresence>
              </>
            )}

            {/* 👥 Others Section */}
            {othersSection.length > 0 && (
              <>
                <div className="flex items-center gap-2 py-2 mt-2">
                  <Users className="w-3.5 h-3.5 text-white/50" />
                  <span className="text-white/70 text-xs font-semibold uppercase tracking-wider">
                    Others
                  </span>
                  <div className="flex-1 h-px bg-white/10" />
                </div>
                <AnimatePresence>
                  {othersSection.map(([principal, profile], i) => {
                    const idx = coupleSection.length + eventSection.length + i;
                    return (
                      <motion.div
                        key={`other-${principal.toString()}`}
                        initial={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0, marginBottom: 0 }}
                        transition={{ duration: 0.3 }}
                        data-ocid={`requests.item.${idx + 1}`}
                        className="relative bg-white/5 rounded-2xl p-3 border border-white/5 overflow-hidden mb-2"
                      >
                        <RequestCard
                          principal={principal}
                          profile={profile}
                          idx={idx}
                          justAccepted={justAccepted}
                          onUserClick={onUserClick}
                          onAccept={handleAccept}
                          onDecline={handleDecline}
                          onMessage={onMessageUser}
                          onCall={handleCallUser}
                          acceptPending={acceptRequest.isPending}
                        />
                      </motion.div>
                    );
                  })}
                </AnimatePresence>
              </>
            )}
          </div>
        ) : (
          <div
            data-ocid="requests.empty_state"
            className="flex flex-col items-center justify-center py-24 gap-4 text-center px-8"
          >
            <div className="text-6xl">💌</div>
            <p className="text-white/50 font-semibold text-lg">
              No requests yet
            </p>
            <p className="text-white/30 text-sm">
              When someone likes your profile, they&apos;ll appear here
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

function RequestCard({
  principal,
  profile,
  idx,
  justAccepted,
  onUserClick,
  onAccept,
  onDecline,
  onMessage,
  onCall,
  acceptPending,
}: {
  principal: Principal;
  profile: Profile;
  idx: number;
  justAccepted: string | null;
  onUserClick: (p: Principal) => void;
  onAccept: (p: Principal) => void;
  onDecline: (p: Principal) => void;
  onMessage?: (p: Principal) => void;
  onCall: (principal: Principal, name: string) => void;
  acceptPending: boolean;
}) {
  return (
    <>
      {justAccepted === principal.toString() && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 z-10 flex items-center justify-center rounded-2xl bg-green-500/20 backdrop-blur-sm"
        >
          <div className="flex flex-col items-center gap-2">
            <span className="text-3xl">🎉</span>
            <p className="text-green-400 font-bold text-sm">Now Friends!</p>
          </div>
        </motion.div>
      )}
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={() => onUserClick(principal)}
          className="flex items-center gap-3 flex-1 min-w-0"
        >
          <div className="relative">
            <Avatar className="w-14 h-14 shrink-0">
              {profile.avatar && (
                <AvatarImage src={profile.avatar.getDirectURL()} />
              )}
              <AvatarFallback className="bg-gradient-to-br from-pink-500 to-purple-600 text-white font-bold">
                {profile.displayName[0]?.toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <span className="absolute -bottom-0.5 -right-0.5 text-base">
              💝
            </span>
          </div>
          <div className="flex flex-col min-w-0 text-left">
            <p className="font-semibold text-white truncate">
              {profile.displayName}
            </p>
            {profile.bio && (
              <p className="text-white/40 text-xs truncate mt-0.5">
                {profile.bio}
              </p>
            )}
            {profile.location && (
              <p className="text-white/30 text-xs">📍 {profile.location}</p>
            )}
          </div>
        </button>
        <div className="flex gap-2 shrink-0">
          <Button
            data-ocid={`requests.delete_button.${idx + 1}`}
            size="sm"
            variant="ghost"
            onClick={() => onDecline(principal)}
            className="w-9 h-9 p-0 rounded-full bg-red-500/10 hover:bg-red-500/20 border border-red-500/20"
          >
            <X className="w-4 h-4 text-red-400" />
          </Button>
          <Button
            data-ocid={`requests.primary_button.${idx + 1}`}
            size="sm"
            onClick={() => onAccept(principal)}
            disabled={acceptPending}
            className="w-9 h-9 p-0 rounded-full bg-gradient-to-br from-green-500 to-emerald-600 border-0"
          >
            <Check className="w-4 h-4 text-white" />
          </Button>
        </div>
      </div>
      <div className="flex gap-2 mt-2">
        <Button
          data-ocid={`requests.secondary_button.${idx + 1}`}
          size="sm"
          onClick={() => onMessage?.(principal)}
          className="flex-1 h-8 rounded-full bg-purple-600/20 hover:bg-purple-600/30 border border-purple-500/30 text-purple-300 text-xs gap-1.5"
          variant="ghost"
        >
          <MessageCircle className="w-3.5 h-3.5" />
          Chat
        </Button>
        <Button
          data-ocid={`requests.cancel_button.${idx + 1}`}
          size="sm"
          onClick={() => onCall(principal, profile.displayName)}
          className="flex-1 h-8 rounded-full bg-blue-600/20 hover:bg-blue-600/30 border border-blue-500/30 text-blue-300 text-xs gap-1.5"
          variant="ghost"
        >
          <Phone className="w-3.5 h-3.5" />
          Call
        </Button>
      </div>
    </>
  );
}
