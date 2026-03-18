import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import type { Principal } from "@icp-sdk/core/principal";
import { Loader2, X } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
import { useInternetIdentity } from "../hooks/useInternetIdentity";
import {
  useFollow,
  useGetAllProfiles,
  useGetFollowing,
} from "../hooks/useQueries";

interface Props {
  type: "followers" | "following";
  principals: Principal[];
  onClose: () => void;
}

export default function FollowListSheet({ type, principals, onClose }: Props) {
  const { data: allProfiles } = useGetAllProfiles();
  const { identity } = useInternetIdentity();
  const myPrincipal = identity?.getPrincipal() ?? null;
  const followMutation = useFollow();
  const [pendingId, setPendingId] = useState<string | null>(null);

  // Get the list of principals the current user follows
  const { data: myFollowing = [] } = useGetFollowing(myPrincipal);

  const items = (allProfiles ?? []).filter(([p]) =>
    principals.some((fp) => fp.toString() === p.toString()),
  );

  const handleToggleFollow = async (
    p: Principal,
    currentlyFollowing: boolean,
  ) => {
    setPendingId(p.toString());
    try {
      await followMutation.mutateAsync({
        user: p,
        following: currentlyFollowing,
      });
    } catch {}
    setPendingId(null);
  };

  return (
    <AnimatePresence>
      <motion.div
        key="follow-backdrop"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/60 z-50"
        onClick={onClose}
      />
      <motion.div
        key="follow-sheet"
        data-ocid="profile.sheet"
        initial={{ y: "100%" }}
        animate={{ y: 0 }}
        exit={{ y: "100%" }}
        transition={{ type: "spring", damping: 28, stiffness: 300 }}
        className="fixed inset-x-0 bottom-0 z-50 bg-[#0f0f1a] border-t border-white/10 rounded-t-3xl overflow-hidden flex flex-col"
        style={{ maxHeight: "75dvh" }}
      >
        {/* Handle */}
        <div className="flex justify-center pt-3 pb-2 shrink-0">
          <div className="w-10 h-1 rounded-full bg-white/20" />
        </div>
        {/* Header */}
        <div className="flex items-center justify-between px-4 pb-3 shrink-0">
          <h3 className="text-white font-bold text-lg">
            {type === "followers" ? "Followers" : "Following"}
          </h3>
          <button
            type="button"
            data-ocid="profile.close_button"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center"
          >
            <X className="w-4 h-4 text-white" />
          </button>
        </div>
        {/* List */}
        <div className="flex-1 overflow-y-auto pb-8">
          {items.length === 0 ? (
            <div
              data-ocid="profile.empty_state"
              className="flex flex-col items-center justify-center py-16 gap-3"
            >
              <p className="text-white/30 text-sm">
                {type === "followers"
                  ? "No followers yet"
                  : "Not following anyone"}
              </p>
            </div>
          ) : (
            items.map(([principal, profile], i) => {
              const isMe = principal.toString() === myPrincipal?.toString();
              // Correctly determine if I am following this person
              const amIFollowing = myFollowing.some(
                (p) => p.toString() === principal.toString(),
              );
              const isPending = pendingId === principal.toString();
              return (
                <div
                  key={principal.toString()}
                  data-ocid={`profile.item.${i + 1}`}
                  className="flex items-center gap-3 px-4 py-3 border-b border-white/5"
                >
                  <Avatar className="w-11 h-11 shrink-0">
                    {profile.avatar && (
                      <AvatarImage src={profile.avatar.getDirectURL()} />
                    )}
                    <AvatarFallback className="bg-gradient-to-br from-pink-500 to-purple-600 text-white font-bold">
                      {profile.displayName[0]?.toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <p className="text-white font-semibold text-sm truncate">
                      {profile.displayName}
                    </p>
                    {profile.location && (
                      <p className="text-white/40 text-xs truncate">
                        📍 {profile.location}
                      </p>
                    )}
                  </div>
                  {!isMe && (
                    <Button
                      data-ocid={`profile.toggle.${i + 1}`}
                      size="sm"
                      onClick={() =>
                        handleToggleFollow(principal, amIFollowing)
                      }
                      disabled={isPending}
                      className={`h-8 px-4 rounded-full text-xs font-semibold ${
                        amIFollowing
                          ? "bg-white/10 text-white/70 border border-white/20"
                          : "bg-gradient-to-r from-pink-500 to-purple-600 border-0 text-white"
                      }`}
                    >
                      {isPending ? (
                        <Loader2 className="w-3 h-3 animate-spin" />
                      ) : amIFollowing ? (
                        "Unfollow"
                      ) : (
                        "Follow"
                      )}
                    </Button>
                  )}
                </div>
              );
            })
          )}
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
