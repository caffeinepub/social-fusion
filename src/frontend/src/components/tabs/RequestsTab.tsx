import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import type { Principal } from "@icp-sdk/core/principal";
import { Check, MessageCircle, Phone, X } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
import { useInternetIdentity } from "../../hooks/useInternetIdentity";
import {
  useAcceptRequest,
  useBlockedUsers,
  useGetAllProfiles,
  useTinderPass,
} from "../../hooks/useQueries";
import CallScreen from "../CallScreen";

interface Props {
  onUserClick: (p: Principal) => void;
  onMessageUser?: (p: Principal) => void;
}

export default function RequestsTab({ onUserClick, onMessageUser }: Props) {
  const { data: profiles, isLoading } = useGetAllProfiles();
  const { identity } = useInternetIdentity();
  const myPrincipal = identity?.getPrincipal();
  const acceptRequest = useAcceptRequest();
  const tinderPass = useTinderPass();
  const { blockedSet } = useBlockedUsers();
  const [callingUser, setCallingUser] = useState<{ name: string } | null>(null);
  const [acceptedIds, setAcceptedIds] = useState<Set<string>>(new Set());
  const [declinedIds, setDeclinedIds] = useState<Set<string>>(new Set());
  const [justAccepted, setJustAccepted] = useState<string | null>(null);

  const otherProfiles =
    profiles?.filter(
      ([p]) =>
        p.toString() !== myPrincipal?.toString() &&
        !acceptedIds.has(p.toString()) &&
        !declinedIds.has(p.toString()) &&
        !blockedSet.has(p.toString()),
    ) ?? [];

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

  if (callingUser) {
    const fakeProfile = {
      displayName: callingUser.name,
      bio: "",
      website: "",
      birthday: "",
      gender: "",
      location: "",
      relationshipStatus: "",
      interests: "",
      hobbies: "",
      favMovies: "",
      favSongs: "",
      education: "",
      thoughts: "",
    };
    return (
      <CallScreen
        mode="voice"
        otherProfile={fakeProfile as any}
        onEnd={() => setCallingUser(null)}
      />
    );
  }

  return (
    <div
      data-ocid="requests.page"
      className="flex flex-col h-full bg-[#0a0a0f]"
    >
      {/* Header */}
      <div className="px-4 pt-6 pb-4 shrink-0">
        <h1 className="text-2xl font-bold font-display text-white">
          Match Requests
        </h1>
        <p className="text-white/40 text-sm mt-0.5">People interested in you</p>
      </div>

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
          <div className="px-4 flex flex-col gap-3">
            <AnimatePresence>
              {otherProfiles.map(([principal, profile], i) => (
                <motion.div
                  key={principal.toString()}
                  initial={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0, marginBottom: 0 }}
                  transition={{ duration: 0.3 }}
                  data-ocid={`requests.item.${i + 1}`}
                  className="bg-white/5 rounded-2xl p-3 border border-white/5 overflow-hidden"
                >
                  {justAccepted === principal.toString() && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0 }}
                      className="absolute inset-0 z-10 flex items-center justify-center rounded-2xl bg-green-500/20 backdrop-blur-sm"
                    >
                      <div className="flex flex-col items-center gap-2">
                        <span className="text-3xl">🎉</span>
                        <p className="text-green-400 font-bold text-sm">
                          Now Friends!
                        </p>
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
                          <p className="text-white/30 text-xs">
                            📍 {profile.location}
                          </p>
                        )}
                      </div>
                    </button>
                    <div className="flex gap-2 shrink-0">
                      <Button
                        data-ocid={`requests.delete_button.${i + 1}`}
                        size="sm"
                        variant="ghost"
                        onClick={() => handleDecline(principal)}
                        className="w-9 h-9 p-0 rounded-full bg-red-500/10 hover:bg-red-500/20 border border-red-500/20"
                      >
                        <X className="w-4 h-4 text-red-400" />
                      </Button>
                      <Button
                        data-ocid={`requests.primary_button.${i + 1}`}
                        size="sm"
                        onClick={() => handleAccept(principal)}
                        disabled={acceptRequest.isPending}
                        className="w-9 h-9 p-0 rounded-full bg-gradient-to-br from-green-500 to-emerald-600 border-0"
                      >
                        <Check className="w-4 h-4 text-white" />
                      </Button>
                    </div>
                  </div>
                  {/* Chat & Call row */}
                  <div className="flex gap-2 mt-2">
                    <Button
                      data-ocid={`requests.secondary_button.${i + 1}`}
                      size="sm"
                      onClick={() => onMessageUser?.(principal)}
                      className="flex-1 h-8 rounded-full bg-purple-600/20 hover:bg-purple-600/30 border border-purple-500/30 text-purple-300 text-xs gap-1.5"
                      variant="ghost"
                    >
                      <MessageCircle className="w-3.5 h-3.5" />
                      Chat
                    </Button>
                    <Button
                      data-ocid={`requests.cancel_button.${i + 1}`}
                      size="sm"
                      onClick={() =>
                        setCallingUser({ name: profile.displayName })
                      }
                      className="flex-1 h-8 rounded-full bg-blue-600/20 hover:bg-blue-600/30 border border-blue-500/30 text-blue-300 text-xs gap-1.5"
                      variant="ghost"
                    >
                      <Phone className="w-3.5 h-3.5" />
                      Call
                    </Button>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
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
