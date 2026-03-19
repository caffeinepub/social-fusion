import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import type { Principal } from "@icp-sdk/core/principal";
import { Flame, Gift, Heart, MessageCircle, Star } from "lucide-react";
import { useState } from "react";
import { usePrivacy } from "../../contexts/PrivacyContext";
import {
  useGetCallerProfile,
  useGetMatches,
  useGetUserProfile,
} from "../../hooks/useQueries";
import { ConnectionScore } from "../features/DiscoverFeatures";

interface Props {
  onUserClick: (p: Principal) => void;
  onMessageUser: () => void;
}

// Simulate online/offline per profile (deterministic)
function isOnline(principal: Principal): boolean {
  const str = principal.toString();
  const code = str.charCodeAt(str.length - 1) + str.charCodeAt(0);
  return code % 3 !== 0;
}

// Simulate streak (days since match) % 7 + 1
function getStreak(principal: Principal): number {
  const str = principal.toString();
  const seed = str.charCodeAt(0) + str.charCodeAt(str.length - 1);
  return (seed % 7) + 1;
}

// Simulate relationship goal from principal
function getRelGoal(principal: Principal): string {
  const goals = ["Serious", "Casual", "Friendship", "Open to all"];
  const idx = principal.toString().charCodeAt(0) % goals.length;
  return goals[idx];
}

const GIFT_EMOJIS = [
  "\u{1F49D}",
  "\u{1F381}",
  "\u{1F490}",
  "\u{1F36B}",
  "\u{1F48C}",
  "\u2728",
];
const QUICK_EMOJIS = [
  "\u2764\uFE0F",
  "\u{1F60D}",
  "\u{1F44B}",
  "\u{1F48B}",
  "\u{1F525}",
];

export default function MatchesTab({ onUserClick, onMessageUser }: Props) {
  const { data: matchPrincipals, isLoading } = useGetMatches();
  const { isPrivate } = usePrivacy();
  const uniqueMatches = matchPrincipals
    ? Array.from(
        new Map(matchPrincipals.map((p) => [p.toString(), p])).values(),
      ).filter((p) => !isPrivate(p.toString()))
    : [];
  const count = uniqueMatches.length;

  return (
    <div data-ocid="matches.page" className="flex flex-col h-full bg-[#0a0a0f]">
      {/* Header */}
      <div className="px-4 pt-6 pb-3 shrink-0 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold font-display text-white">
            Matches
          </h1>
          <p className="text-white/40 text-sm mt-0.5">
            {count} mutual {count === 1 ? "match" : "matches"}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span
            className="px-3 py-1 rounded-full text-xs font-bold text-pink-400"
            style={{ background: "rgba(236,72,153,0.12)" }}
          >
            All
          </span>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto pb-24">
        {isLoading ? (
          <div className="p-4 grid grid-cols-2 gap-3">
            {[1, 2, 3, 4].map((i) => (
              <div
                key={i}
                data-ocid="matches.loading_state"
                className="rounded-2xl overflow-hidden"
              >
                <Skeleton className="w-full h-52" />
              </div>
            ))}
          </div>
        ) : uniqueMatches.length > 0 ? (
          <div className="p-4 grid grid-cols-2 gap-3">
            {uniqueMatches.map((principal, i) => (
              <MatchCard
                key={principal.toString()}
                principal={principal}
                index={i}
                onUserClick={onUserClick}
                onMessageUser={onMessageUser}
              />
            ))}
          </div>
        ) : (
          <div
            data-ocid="matches.empty_state"
            className="flex flex-col items-center justify-center py-24 gap-4 text-center px-8"
          >
            <div className="text-6xl">\u2B50</div>
            <p className="text-white/50 font-semibold text-lg">
              No matches yet
            </p>
            <p className="text-white/30 text-sm">Keep exploring!</p>
          </div>
        )}
      </div>
    </div>
  );
}

function MatchCard({
  principal,
  index,
  onUserClick,
  onMessageUser,
}: {
  principal: Principal;
  index: number;
  onUserClick: (p: Principal) => void;
  onMessageUser: () => void;
}) {
  const { data: profile } = useGetUserProfile(principal);
  const { data: myProfile } = useGetCallerProfile();
  const score = Math.floor(
    50 + ((principal.toString().charCodeAt(0) * 7) % 50),
  );
  const online = isOnline(principal);
  const streak = getStreak(principal);
  const relGoal = getRelGoal(principal);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [showGiftPicker, setShowGiftPicker] = useState(false);
  const [sentEmoji, setSentEmoji] = useState<string | null>(null);
  const [heartSent, setHeartSent] = useState(false);

  // Mutual interests count
  const myInterests = myProfile?.interests
    ? myProfile.interests.split(",").map((s) => s.trim().toLowerCase())
    : [];
  const theirInterests = profile?.interests
    ? profile.interests.split(",").map((s) => s.trim().toLowerCase())
    : [];
  const mutualCount = myInterests.filter((i) =>
    theirInterests.includes(i),
  ).length;

  // Story ring simulation (has story if principal last char code is even)
  const hasStory =
    principal.toString().charCodeAt(principal.toString().length - 1) % 2 === 0;

  return (
    <div
      data-ocid={`matches.item.${index + 1}`}
      className="relative rounded-2xl overflow-hidden bg-white/5 border border-white/5"
    >
      <button
        type="button"
        onClick={() => onUserClick(principal)}
        className="w-full"
      >
        <div className="h-44 bg-gradient-to-br from-pink-500/30 to-purple-600/30 relative">
          {profile?.avatar ? (
            <img
              src={profile.avatar.getDirectURL()}
              alt={profile.displayName}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center relative">
              {/* Story ring on avatar */}
              {hasStory && (
                <div
                  className="absolute inset-0 flex items-center justify-center"
                  style={{ pointerEvents: "none" }}
                >
                  <svg
                    width="72"
                    height="72"
                    className="absolute"
                    style={{ transform: "rotate(-90deg)" }}
                    aria-label="Story ring"
                    role="img"
                  >
                    <title>Story ring</title>
                    <circle
                      cx="36"
                      cy="36"
                      r="33"
                      fill="none"
                      stroke="url(#matchStoryGrad)"
                      strokeWidth="3"
                      strokeLinecap="round"
                      strokeDasharray="180 30"
                    />
                    <defs>
                      <linearGradient
                        id="matchStoryGrad"
                        x1="0%"
                        y1="0%"
                        x2="100%"
                        y2="100%"
                      >
                        <stop offset="0%" stopColor="#ec4899" />
                        <stop offset="100%" stopColor="#a855f7" />
                      </linearGradient>
                    </defs>
                  </svg>
                </div>
              )}
              <Avatar className="w-16 h-16">
                <AvatarFallback className="bg-gradient-to-br from-pink-500 to-purple-600 text-white font-bold text-xl">
                  {profile?.displayName?.[0]?.toUpperCase() || "?"}
                </AvatarFallback>
              </Avatar>
            </div>
          )}
          <div className="absolute bottom-0 left-0 right-0 p-2 bg-gradient-to-t from-black/80 to-transparent">
            <div className="flex items-center gap-1.5">
              {/* Online/offline bubble */}
              <span
                className="w-2.5 h-2.5 rounded-full shrink-0"
                style={{
                  background: online ? "#22c55e" : "#6b7280",
                  boxShadow: online ? "0 0 6px #22c55e" : "none",
                }}
              />
              <p className="text-white font-semibold text-sm truncate">
                {profile?.displayName || "..."}
              </p>
            </div>
            <p className="text-white/50 text-[11px] truncate">
              {profile?.location || ""}
            </p>
          </div>
          {/* Score badge */}
          <div className="absolute top-2 right-2">
            <ConnectionScore score={score} />
          </div>
          {/* Story ring indicator on photo */}
          {hasStory && profile?.avatar && (
            <div
              className="absolute top-0 left-0 w-full h-full pointer-events-none"
              style={{
                boxShadow:
                  "inset 0 0 0 3px transparent, inset 0 0 0 3px rgba(236,72,153,0.7)",
                borderRadius: "inherit",
              }}
            />
          )}
          {/* Streak badge */}
          <div
            className="absolute top-2 left-2 flex items-center gap-0.5 px-1.5 py-0.5 rounded-full"
            style={{ background: "rgba(0,0,0,0.6)" }}
          >
            <Flame className="w-3 h-3 text-orange-400" />
            <span className="text-orange-400 text-[10px] font-bold">
              {streak}
            </span>
          </div>
        </div>
      </button>

      {/* Info row */}
      <div className="px-2 pt-1.5 pb-0.5">
        {/* Relationship goal badge */}
        <span
          className="text-[10px] px-2 py-0.5 rounded-full font-medium"
          style={{ background: "rgba(168,85,247,0.15)", color: "#a855f7" }}
        >
          {relGoal}
        </span>
        {/* Mutual interests */}
        {mutualCount > 0 && (
          <span className="text-[10px] ml-1 text-white/40">
            {mutualCount} mutual
          </span>
        )}
      </div>

      {/* Action buttons */}
      <div className="p-2 flex gap-1">
        <Button
          data-ocid={`matches.secondary_button.${index + 1}`}
          size="sm"
          onClick={onMessageUser}
          className="flex-1 h-8 text-xs bg-gradient-to-r from-pink-500/20 to-purple-600/20 hover:from-pink-500/30 hover:to-purple-600/30 text-pink-300 border border-pink-500/20 rounded-xl"
        >
          <MessageCircle className="w-3 h-3 mr-1" /> Msg
        </Button>
        {/* Quick emoji reaction */}
        <button
          data-ocid={`matches.toggle.${index + 1}`}
          type="button"
          onClick={() => {
            // Write heart notification to match's localStorage
            const notifKey = `notifications_${principal.toString()}`;
            try {
              const existing = JSON.parse(
                localStorage.getItem(notifKey) || "[]",
              );
              existing.push({
                type: "heart",
                fromUserId: "me",
                fromName: "You",
                timestamp: Date.now(),
              });
              localStorage.setItem(notifKey, JSON.stringify(existing));
            } catch {}
            setHeartSent(true);
            setTimeout(() => setHeartSent(false), 2000);
            setShowEmojiPicker((s) => !s);
            setShowGiftPicker(false);
          }}
          className="w-8 h-8 rounded-xl flex items-center justify-center active:scale-90 transition-transform"
          style={{ background: "rgba(255,255,255,0.06)" }}
        >
          {heartSent ? (
            <span className="text-[10px] text-green-400 font-bold">Sent!</span>
          ) : (
            sentEmoji || <Heart className="w-3.5 h-3.5 text-pink-400" />
          )}
        </button>
        {/* Gift button */}
        <button
          data-ocid={`matches.open_modal_button.${index + 1}`}
          type="button"
          onClick={() => {
            setShowGiftPicker((s) => !s);
            setShowEmojiPicker(false);
          }}
          className="w-8 h-8 rounded-xl flex items-center justify-center active:scale-90 transition-transform"
          style={{ background: "rgba(255,255,255,0.06)" }}
        >
          <Gift className="w-3.5 h-3.5 text-yellow-400" />
        </button>
      </div>

      {/* Emoji picker */}
      {showEmojiPicker && (
        <div
          data-ocid={`matches.popover.${index + 1}`}
          className="absolute bottom-12 left-0 right-0 mx-2 flex justify-center gap-2 p-2 rounded-xl z-20"
          style={{
            background: "rgba(20,10,40,0.97)",
            border: "1px solid rgba(236,72,153,0.3)",
          }}
        >
          {QUICK_EMOJIS.map((emoji) => (
            <button
              key={emoji}
              type="button"
              className="text-xl active:scale-90 transition-transform"
              onClick={() => {
                setSentEmoji(emoji);
                setShowEmojiPicker(false);
                setTimeout(() => setSentEmoji(null), 3000);
              }}
            >
              {emoji}
            </button>
          ))}
        </div>
      )}

      {/* Gift picker */}
      {showGiftPicker && (
        <div
          data-ocid={`matches.sheet.${index + 1}`}
          className="absolute bottom-12 left-0 right-0 mx-2 flex justify-center gap-2 p-2 rounded-xl z-20"
          style={{
            background: "rgba(20,10,40,0.97)",
            border: "1px solid rgba(168,85,247,0.3)",
          }}
        >
          {GIFT_EMOJIS.map((emoji) => (
            <button
              key={emoji}
              type="button"
              className="text-xl active:scale-90 transition-transform"
              onClick={() => {
                setShowGiftPicker(false);
              }}
            >
              {emoji}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
