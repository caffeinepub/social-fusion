import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import type { Principal } from "@icp-sdk/core/principal";
import { Bell, Heart, Mic, Search, Star, Video, X, Zap } from "lucide-react";
import {
  AnimatePresence,
  motion,
  useMotionValue,
  useTransform,
} from "motion/react";
import { useEffect, useRef, useState } from "react";
import type { Profile, Story } from "../../backend";
import { usePrivacy } from "../../contexts/PrivacyContext";
import { useInternetIdentity } from "../../hooks/useInternetIdentity";
import {
  useBlockedUsers,
  useGetAllProfiles,
  useGetCallerProfile,
  useGetStories,
  useGetTinderQueue,
  useStarUser,
  useTinderLike,
  useTinderPass,
} from "../../hooks/useQueries";
import CompatibilityRing from "../CompatibilityRing";
import LiveBroadcastScreen from "../LiveBroadcastScreen";
import LiveScreen from "../LiveScreen";
import ProfileBadges from "../ProfileBadges";
import QuickMatchBar from "../QuickMatchBar";
import SearchScreen from "../SearchScreen";
import SpotlightSection from "../SpotlightSection";
import StoryCreatorSheet from "../StoryCreatorSheet";
import StoryViewer from "../StoryViewer";
import {
  HeartBurst,
  MutualInterestsBadge,
  NearbyUsersSection,
  SafeReportButton,
  ShakeToMatchButton,
  SuperLikeButton,
} from "../features/DiscoverFeatures";
import { BookmarkToggleButton } from "../features/MatchFeatures";

const CONFETTI_PIECES = Array.from({ length: 20 }, (_, i) => ({
  id: `piece-${i}`,
  color: ["#ff0080", "#7c3aed", "#fbbf24", "#06b6d4", "#f97316", "#10b981"][
    i % 6
  ],
  index: i,
}));

function ConfettiPiece({ color, index }: { color: string; index: number }) {
  const angle = (index / 20) * 360;
  const distance = 80 + Math.random() * 80;
  const tx = Math.cos((angle * Math.PI) / 180) * distance;
  const ty = Math.sin((angle * Math.PI) / 180) * distance;
  const size = 6 + Math.floor(Math.random() * 6);

  return (
    <motion.div
      className="absolute rounded-sm pointer-events-none"
      style={{
        width: size,
        height: size,
        background: color,
        top: "50%",
        left: "50%",
        marginTop: -size / 2,
        marginLeft: -size / 2,
      }}
      initial={{ x: 0, y: 0, opacity: 1, rotate: 0 }}
      animate={{ x: tx, y: ty, opacity: 0, rotate: angle * 2 }}
      transition={{ duration: 1.5, ease: "easeOut" }}
    />
  );
}

function StoryRing({ count, size = 56 }: { count: number; size?: number }) {
  const r = (size - 4) / 2;
  const circumference = 2 * Math.PI * r;
  const gap = count > 1 ? 3 : 0;
  const segmentLength = (circumference - gap * count) / count;
  return (
    <svg
      width={size}
      height={size}
      className="absolute inset-0"
      aria-label="Story ring"
      role="img"
      style={{ transform: "rotate(-90deg)" }}
    >
      {Array.from({ length: count }).map((_, i) => {
        const offset = i * (segmentLength + gap);
        return (
          <circle
            key={`seg-${offset.toFixed(2)}`}
            cx={size / 2}
            cy={size / 2}
            r={r}
            fill="none"
            stroke="url(#storyGrad)"
            strokeWidth={2.5}
            strokeDasharray={`${segmentLength} ${circumference - segmentLength}`}
            strokeDashoffset={-offset}
            strokeLinecap="round"
          />
        );
      })}
      <defs>
        <linearGradient id="storyGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#ec4899" />
          <stop offset="100%" stopColor="#a855f7" />
        </linearGradient>
      </defs>
    </svg>
  );
}

const playLikeSound = () => {
  try {
    const ctx = new (
      window.AudioContext || (window as any).webkitAudioContext
    )();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.frequency.value = 880;
    gain.gain.setValueAtTime(0.3, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.3);
    osc.start();
    osc.stop(ctx.currentTime + 0.3);
  } catch {}
};

// ── Recommendation scoring ──────────────────────────────────────────────────
function scoreProfile(
  profile: Profile,
  myProfile: Profile | null | undefined,
  _myPrincipal: Principal | null | undefined,
  principalStr: string,
): number {
  let score = 0;
  if (!myProfile) return score;
  // Opposite gender preference: +30
  const myGender = myProfile.gender?.toLowerCase() ?? "";
  const theirGender = profile.gender?.toLowerCase() ?? "";
  if (
    myGender &&
    theirGender &&
    ((myGender === "male" && theirGender === "female") ||
      (myGender === "female" && theirGender === "male"))
  ) {
    score += 30;
  }
  // Same city/location: +20
  const myLoc = myProfile.location?.toLowerCase() ?? "";
  const theirLoc = profile.location?.toLowerCase() ?? "";
  if (
    myLoc &&
    theirLoc &&
    (myLoc.includes(theirLoc) || theirLoc.includes(myLoc))
  ) {
    score += 20;
  }
  // Shared interests count × 5 (max 25): up to +25
  const myInterests = myProfile.interests
    ? myProfile.interests.split(",").map((s) => s.trim().toLowerCase())
    : [];
  const theirInterests = profile.interests
    ? profile.interests.split(",").map((s) => s.trim().toLowerCase())
    : [];
  const interestOverlap = myInterests.filter((i) => theirInterests.includes(i));
  score += Math.min(interestOverlap.length * 5, 25);
  // Qualification/education match: +10
  if (
    myProfile.education &&
    profile.education &&
    myProfile.education.trim() &&
    profile.education.trim() &&
    myProfile.education
      .toLowerCase()
      .includes(profile.education.toLowerCase().split(" ")[0])
  ) {
    score += 10;
  }
  // Has profile views (avatar present as proxy): +5
  if (profile.avatar) score += 5;
  // Shared hobbies bonus
  const myHobbies = myProfile.hobbies
    ? myProfile.hobbies.split(",").map((s) => s.trim().toLowerCase())
    : [];
  const theirHobbies = profile.hobbies
    ? profile.hobbies.split(",").map((s) => s.trim().toLowerCase())
    : [];
  const hobbyOverlap = myHobbies.filter((h) => theirHobbies.includes(h));
  score += Math.min(hobbyOverlap.length * 3, 10);
  // Tiebreaker
  score += (principalStr.charCodeAt(0) % 3) * 0.01;
  return score;
}

function getMatchPercent(
  profile: Profile,
  myProfile: Profile | null | undefined,
  principalStr: string,
): number {
  const maxScore = 90; // 30+20+25+10+5
  const raw = scoreProfile(profile, myProfile, null, principalStr);
  return Math.min(100, Math.round((raw / maxScore) * 100));
}

const CARD_GRADIENTS = [
  "linear-gradient(135deg, #3d1a5e, #1a3d5e)",
  "linear-gradient(135deg, #5e1a3d, #3d1a0a)",
  "linear-gradient(135deg, #1a3d1a, #1a2e3d)",
];

interface Props {
  onUserClick: (p: Principal) => void;
  onNotifOpen?: () => void;
  onStoryOpen?: () => void;
  onStoryClose?: () => void;
  onLiveOpen?: () => void;
  onLiveClose?: () => void;
}

interface StoryViewState {
  stories: Story[];
  principal: Principal;
  profile: Profile;
}

export default function DiscoverTab({
  onUserClick,
  onNotifOpen,
  onStoryOpen,
  onStoryClose,
  onLiveOpen,
  onLiveClose,
}: Props) {
  const [showLive, setShowLive] = useState(false);
  const [liveScreenOpen, setLiveScreenOpen] = useState(false);
  const [liveMode, setLiveMode] = useState<"audio" | "video">("video");
  const [showLivePicker, setShowLivePicker] = useState(false);
  const [showSearchBar, setShowSearchBar] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [showSearch, setShowSearch] = useState(false);
  const [storyCreatorOpen, setStoryCreatorOpen] = useState(false);
  const [storyView, setStoryView] = useState<StoryViewState | null>(null);
  const { identity } = useInternetIdentity();
  const myPrincipal = identity?.getPrincipal() ?? null;
  const { data: callerProfile } = useGetCallerProfile();
  const { data: myStories } = useGetStories(myPrincipal);
  const { data: allProfiles } = useGetAllProfiles();
  const [_shakeName, _setShakeName] = useState<string | null>(null);
  const [showWhoLiked, setShowWhoLiked] = useState(false);

  const myStoryCount = myStories?.length ?? 0;

  const otherUsersWithStories =
    allProfiles?.filter(([p]) => p.toString() !== myPrincipal?.toString()) ??
    [];

  const picksScrollRef = useRef<HTMLDivElement>(null);

  // Auto-scroll Today's Picks
  useEffect(() => {
    const el = picksScrollRef.current;
    if (!el) return;
    const interval = setInterval(() => {
      const maxScroll = el.scrollWidth - el.clientWidth;
      if (maxScroll <= 0) return;
      if (el.scrollLeft >= maxScroll - 5) {
        el.scrollTo({ left: 0, behavior: "smooth" });
      } else {
        el.scrollBy({ left: 140, behavior: "smooth" });
      }
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  const openStory = (
    stories: Story[],
    principal: Principal,
    profile: Profile,
  ) => {
    setStoryView({ stories, principal, profile });
    onStoryOpen?.();
  };

  const closeStory = () => {
    setStoryView(null);
    onStoryClose?.();
  };

  // Show LiveScreen overlay when liveScreenOpen
  if (liveScreenOpen) {
    return (
      <LiveScreen
        mode={liveMode}
        isHost={true}
        onEnd={() => {
          setLiveScreenOpen(false);
          onLiveClose?.();
        }}
        onClose={() => {
          setLiveScreenOpen(false);
          onLiveClose?.();
        }}
      />
    );
  }

  if (showLive) {
    return <LiveBroadcastScreen onBack={() => setShowLive(false)} />;
  }

  if (showSearch) {
    return (
      <SearchScreen
        onBack={() => setShowSearch(false)}
        onProfileClick={(p) => {
          setShowSearch(false);
          onUserClick(p);
        }}
      />
    );
  }

  return (
    <div
      data-ocid="discover.page"
      className="flex flex-col h-full overflow-y-auto pb-4"
      style={{
        background: "var(--sf-bg, #0a0a0f)",
        scrollbarWidth: "none",
        msOverflowStyle: "none",
      }}
    >
      {/* Top Header Bar - Discover + search icon + heart + bell */}
      <div
        className="shrink-0 flex flex-col"
        style={{
          background: "rgba(10,10,15,0.97)",
          borderBottom: "1px solid rgba(255,255,255,0.05)",
        }}
      >
        <div
          className="flex items-center justify-between px-4"
          style={{ height: 52 }}
        >
          {/* Left: Discover text */}
          <h1
            className="text-xl font-bold"
            style={{
              background: "linear-gradient(90deg, #ec4899, #a855f7)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
            }}
          >
            Discover
          </h1>
          {/* Right: icons row */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              data-ocid="discover.search_input"
              onClick={() => setShowSearchBar((s) => !s)}
              className="w-9 h-9 rounded-full bg-white/5 flex items-center justify-center active:scale-90 transition-transform"
            >
              <Search className="w-4.5 h-4.5 text-white/80" />
            </button>
            <button
              type="button"
              data-ocid="discover.toggle"
              onClick={() => setShowWhoLiked(true)}
              className="w-9 h-9 rounded-full bg-white/5 flex items-center justify-center active:scale-90 transition-transform relative"
            >
              <Heart
                className="w-4.5 h-4.5 text-pink-400"
                fill="currentColor"
              />
            </button>
            <button
              type="button"
              data-ocid="discover.toggle"
              onClick={() => onNotifOpen?.()}
              className="w-9 h-9 rounded-full bg-white/5 flex items-center justify-center active:scale-90 transition-transform relative"
            >
              <Bell className="w-4.5 h-4.5 text-white/70" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-pink-500 rounded-full" />
            </button>
          </div>
        </div>
        {/* Expandable search bar with filter */}
        {showSearchBar && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="flex items-center gap-2 px-3 pb-2 overflow-hidden"
          >
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-white/40 pointer-events-none" />
              <input
                type="text"
                data-ocid="discover.search_input"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search people..."
                className="w-full pl-8 pr-3 py-1.5 rounded-full bg-white/10 text-white text-sm placeholder:text-white/40 outline-none border border-white/10 focus:border-pink-500/50 transition-colors"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery("")}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2"
                >
                  <X className="w-3.5 h-3.5 text-white/40" />
                </button>
              )}
            </div>
            {/* Filter icon */}
            <button
              type="button"
              data-ocid="discover.toggle"
              onClick={() => setShowSearch(true)}
              className="w-9 h-9 shrink-0 rounded-full bg-white/10 flex items-center justify-center"
            >
              <Zap className="w-4 h-4 text-pink-400" />
            </button>
          </motion.div>
        )}
      </div>

      {/* Live mode picker sheet */}
      {showLivePicker && (
        <div
          className="fixed inset-0 z-50 flex items-end"
          style={{ background: "rgba(0,0,0,0.7)" }}
          onClick={() => setShowLivePicker(false)}
          onKeyDown={(e) => {
            if (e.key === "Escape") setShowLivePicker(false);
          }}
        >
          <div
            className="w-full rounded-t-3xl p-6"
            style={{
              background: "#1a0a2e",
              border: "1px solid rgba(236,72,153,0.2)",
            }}
            onClick={(e) => e.stopPropagation()}
            onKeyDown={(e) => e.stopPropagation()}
          >
            <h3 className="text-white font-bold text-lg mb-4 text-center">
              Go Live
            </h3>
            <div className="grid grid-cols-2 gap-4 mb-4">
              <button
                type="button"
                data-ocid="live.secondary_button"
                onClick={() => {
                  setLiveMode("audio");
                  setShowLivePicker(false);
                  setLiveScreenOpen(true);
                  onLiveOpen?.();
                }}
                className="flex flex-col items-center gap-3 p-5 rounded-2xl active:scale-95 transition-transform"
                style={{
                  background: "rgba(255,255,255,0.05)",
                  border: "1px solid rgba(236,72,153,0.3)",
                }}
              >
                <Mic className="w-10 h-10 text-pink-400" />
                <span className="text-white font-semibold">Audio Live</span>
                <span className="text-white/40 text-xs text-center">
                  Share your voice with followers
                </span>
              </button>
              <button
                type="button"
                data-ocid="live.primary_button"
                onClick={() => {
                  setLiveMode("video");
                  setShowLivePicker(false);
                  setLiveScreenOpen(true);
                  onLiveOpen?.();
                }}
                className="flex flex-col items-center gap-3 p-5 rounded-2xl active:scale-95 transition-transform"
                style={{
                  background: "rgba(255,255,255,0.05)",
                  border: "1px solid rgba(168,85,247,0.3)",
                }}
              >
                <Video className="w-10 h-10 text-purple-400" />
                <span className="text-white font-semibold">Video Live</span>
                <span className="text-white/40 text-xs text-center">
                  Go live with your camera
                </span>
              </button>
            </div>
            <button
              data-ocid="live.cancel_button"
              type="button"
              onClick={() => setShowLivePicker(false)}
              className="w-full py-3 text-white/50 text-sm"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Story row */}
      <div className="px-4 pt-3 pb-2 shrink-0">
        <div className="flex items-center gap-3 overflow-x-auto no-scrollbar pb-1">
          <div className="flex flex-col items-center gap-1 shrink-0">
            <button
              type="button"
              data-ocid="discover.upload_button"
              onClick={() => setStoryCreatorOpen(true)}
              className="relative w-14 h-14 rounded-full active:scale-95 transition-transform"
            >
              {myStoryCount > 0 ? (
                <>
                  <StoryRing count={myStoryCount} size={56} />
                  <div className="absolute inset-[3px] rounded-full overflow-hidden">
                    {callerProfile?.avatar ? (
                      <img
                        src={callerProfile.avatar.getDirectURL()}
                        alt="My story"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full rounded-full bg-gradient-to-br from-pink-500 to-purple-600 flex items-center justify-center">
                        <span className="text-white text-xl font-bold">
                          {callerProfile?.displayName?.[0]?.toUpperCase() ||
                            "+"}
                        </span>
                      </div>
                    )}
                  </div>
                  <div className="absolute -bottom-0.5 -right-0.5 w-5 h-5 rounded-full bg-pink-500 border-2 border-[#0a0a0f] flex items-center justify-center">
                    <span className="text-white text-xs font-bold leading-none">
                      +
                    </span>
                  </div>
                </>
              ) : (
                <div className="w-14 h-14 rounded-full border-2 border-dashed border-pink-500/50 flex items-center justify-center bg-pink-500/10">
                  <span className="text-pink-400 text-2xl font-light leading-none">
                    +
                  </span>
                </div>
              )}
            </button>
            <span className="text-white/50 text-[10px]">
              {myStoryCount > 0 ? "Your story" : "Add story"}
            </span>
          </div>

          {otherUsersWithStories.map(([p, prof]) => (
            <StoryRingAvatarWithStories
              key={p.toString()}
              principal={p}
              profile={prof}
              onOpenStory={(stories) => openStory(stories, p, prof)}
              onUserClick={() => onUserClick(p)}
            />
          ))}
        </div>
      </div>

      {/* SpotlightSection removed from Discover - shown in Requests only */}
      {/* Main Tinder Swipe section */}
      <div className="shrink-0">
        <TinderSection
          onUserClick={onUserClick}
          onLikeSound={playLikeSound}
          searchQuery={searchQuery}
        />
        {/* Quick Send Reactions */}
      </div>

      {/* Today's Picks - Tinder-style single card */}
      <TodaysPicksCard
        profiles={(allProfiles ?? [])
          .filter(([p]) => p.toString() !== myPrincipal?.toString())
          .slice(0, 5)}
        callerProfile={callerProfile ?? undefined}
        onUserClick={onUserClick}
      />

      {/* You May Like - horizontal scroll */}
      <YouMayLikeSection
        profiles={(allProfiles ?? [])
          .filter(([p]) => p.toString() !== myPrincipal?.toString())
          .slice(0, 12)}
        callerProfile={callerProfile ?? undefined}
        onUserClick={onUserClick}
      />

      <StoryCreatorSheet
        open={storyCreatorOpen}
        onClose={() => setStoryCreatorOpen(false)}
      />

      {/* Story Viewer */}
      <AnimatePresence>
        {/* Who Liked You Panel */}
        {showWhoLiked && (
          <div className="fixed inset-0 z-50 flex items-end">
            <button
              type="button"
              aria-label="Close who liked panel"
              className="absolute inset-0 w-full h-full bg-transparent border-0"
              onClick={() => setShowWhoLiked(false)}
              onKeyDown={(e) => e.key === "Escape" && setShowWhoLiked(false)}
            />
            <div
              className="relative w-full rounded-t-3xl p-5 pb-10"
              style={{
                background: "#13131f",
                borderTop: "1px solid rgba(255,255,255,0.1)",
              }}
            >
              <div className="flex justify-center mb-3">
                <div className="w-10 h-1 rounded-full bg-white/20" />
              </div>
              <div className="flex items-center gap-2 mb-4">
                <Heart className="w-5 h-5 text-pink-400 fill-pink-400" />
                <h3 className="text-white font-bold text-lg">Who Liked You</h3>
                <span className="ml-auto text-pink-400/60 text-xs">
                  {allProfiles?.length ?? 0} people
                </span>
              </div>
              <div className="flex gap-4 overflow-x-auto no-scrollbar pb-2">
                {(allProfiles ?? [])
                  .filter(([p]) => p.toString() !== myPrincipal?.toString())
                  .map(([p, prof]) => (
                    <button
                      key={p.toString()}
                      type="button"
                      onClick={() => {
                        setShowWhoLiked(false);
                        onUserClick(p);
                      }}
                      className="shrink-0 flex flex-col items-center gap-2"
                    >
                      <div className="relative w-16 h-16 rounded-full overflow-hidden border-2 border-pink-500/50">
                        {prof.avatar ? (
                          <img
                            src={prof.avatar.getDirectURL()}
                            alt={prof.displayName}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full bg-gradient-to-br from-pink-500 to-purple-600 flex items-center justify-center text-white font-bold">
                            {prof.displayName[0]?.toUpperCase()}
                          </div>
                        )}
                        <div className="absolute inset-0 flex items-center justify-center bg-pink-500/20">
                          <Heart className="w-5 h-5 text-pink-400 fill-pink-400" />
                        </div>
                      </div>
                      <span className="text-white/70 text-xs w-16 text-center truncate">
                        {prof.displayName}
                      </span>
                    </button>
                  ))}
              </div>
            </div>
          </div>
        )}
        {storyView && (
          <StoryViewer
            stories={storyView.stories}
            author={storyView.principal}
            profile={storyView.profile}
            onClose={closeStory}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

// Story ring avatar that fetches stories and opens viewer on click
function StoryRingAvatarWithStories({
  principal,
  profile,
  onOpenStory,
  onUserClick,
}: {
  principal: Principal;
  profile: Profile;
  onOpenStory: (stories: Story[]) => void;
  onUserClick: () => void;
}) {
  const { data: stories } = useGetStories(principal);
  const count = stories?.length ?? 0;
  const handleClick = () => {
    if (stories && stories.length > 0) {
      onOpenStory(stories);
    } else {
      onUserClick();
    }
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      className="flex flex-col items-center gap-1 shrink-0 active:scale-95 transition-transform"
    >
      <div className="relative w-14 h-14">
        <StoryRing count={count} size={56} />
        <div className="absolute inset-[3px] rounded-full overflow-hidden">
          {profile.avatar ? (
            <img
              src={profile.avatar.getDirectURL()}
              alt={profile.displayName}
              className="w-full h-full object-cover"
            />
          ) : (
            <Avatar className="w-full h-full">
              <AvatarFallback className="bg-gradient-to-br from-pink-500 to-purple-600 text-white text-sm font-bold">
                {profile.displayName[0]?.toUpperCase()}
              </AvatarFallback>
            </Avatar>
          )}
        </div>
      </div>
      <span className="text-white/50 text-[10px] w-14 text-center truncate">
        {profile.displayName}
      </span>
    </button>
  );
}

function _OtherProfilesRow({
  profiles,
  onUserClick,
  searchQuery = "",
}: {
  profiles: [Principal, Profile][];
  onUserClick: (p: Principal) => void;
  searchQuery?: string;
}) {
  const filtered = searchQuery
    ? profiles.filter(
        ([, p]) =>
          p.displayName.toLowerCase().includes(searchQuery.toLowerCase()) ||
          p.location?.toLowerCase().includes(searchQuery.toLowerCase()),
      )
    : profiles;
  if (filtered.length === 0) return null;
  return (
    <div className="shrink-0 pb-1">
      <div className="px-4 py-1.5 flex items-center justify-between">
        <span className="text-white/60 text-xs font-semibold uppercase tracking-wider">
          {searchQuery ? "Search Results" : "You May Like"}
        </span>
        <span className="text-pink-400 text-xs">{filtered.length} people</span>
      </div>
      <div className="flex gap-2.5 px-4 overflow-x-auto no-scrollbar pb-1">
        {filtered.map(([principal, profile]) => (
          <button
            key={principal.toString()}
            type="button"
            data-ocid="discover.button"
            onClick={() => onUserClick(principal)}
            className="shrink-0 relative flex flex-col items-center rounded-2xl overflow-hidden active:scale-95 transition-transform"
            style={{
              width: 110,
              minHeight: 148,
              background: "rgba(255,255,255,0.05)",
              border: "1px solid rgba(255,255,255,0.08)",
            }}
          >
            <div className="w-full h-20 relative overflow-hidden">
              {profile.avatar ? (
                <img
                  src={profile.avatar.getDirectURL()}
                  alt={profile.displayName}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-pink-500/50 to-purple-600/50 flex items-center justify-center">
                  <span className="text-white text-2xl font-bold">
                    {profile.displayName[0]?.toUpperCase()}
                  </span>
                </div>
              )}
            </div>
            <div className="p-1.5 w-full">
              <p className="text-white text-xs font-semibold truncate">
                {profile.displayName}
              </p>
              {profile.location && (
                <p className="text-white/40 text-[10px] truncate">
                  📍 {profile.location}
                </p>
              )}
            </div>
            <div className="absolute top-1.5 right-1.5 flex gap-1">
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                }}
                className="w-6 h-6 rounded-full bg-black/40 backdrop-blur-sm flex items-center justify-center"
              >
                <Heart className="w-3 h-3 text-pink-400" />
              </button>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}

// ── Auto-sliding carousel for profile card ───────────────────────────────────
function ProfileCardCarousel({
  prof,
  principalStr,
}: { prof: Profile; principalStr: string }) {
  const slides = [
    { type: "avatar" as const },
    { type: "info" as const },
    { type: "interests" as const },
  ];
  const [slideIdx, setSlideIdx] = useState(0);

  useEffect(() => {
    const t = setInterval(() => {
      setSlideIdx((i) => (i + 1) % slides.length);
    }, 2500);
    return () => clearInterval(t);
  }, [slides.length]);

  const interests =
    prof.interests
      ?.split(",")
      .map((s) => s.trim())
      .filter(Boolean)
      .slice(0, 4) ?? [];

  return (
    <div className="relative overflow-hidden" style={{ height: 280 }}>
      <AnimatePresence mode="wait">
        {slideIdx === 0 && (
          <motion.div
            key="slide-avatar"
            className="absolute inset-0"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
          >
            {prof.avatar ? (
              <img
                src={prof.avatar.getDirectURL()}
                alt={prof.displayName}
                className="w-full h-full object-cover"
              />
            ) : (
              <div
                className="w-full h-full flex items-center justify-center"
                style={{
                  background:
                    CARD_GRADIENTS[
                      Number.parseInt(principalStr.slice(-1), 16) %
                        CARD_GRADIENTS.length
                    ],
                }}
              >
                <span className="text-7xl font-black text-white/30">
                  {prof.displayName[0]?.toUpperCase()}
                </span>
              </div>
            )}
          </motion.div>
        )}
        {slideIdx === 1 && (
          <motion.div
            key="slide-info"
            className="absolute inset-0 flex flex-col items-center justify-center gap-3 px-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
            style={{
              background: "linear-gradient(135deg, #1e0a3e 0%, #0a1e3e 100%)",
            }}
          >
            <div
              className="w-20 h-20 rounded-full overflow-hidden border-4 shadow-lg"
              style={{ borderColor: "rgba(236,72,153,0.6)" }}
            >
              {prof.avatar ? (
                <img
                  src={prof.avatar.getDirectURL()}
                  alt=""
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-pink-500 to-purple-600 flex items-center justify-center">
                  <span className="text-white text-2xl font-bold">
                    {prof.displayName[0]?.toUpperCase()}
                  </span>
                </div>
              )}
            </div>
            {prof.location && (
              <p className="text-white/80 text-sm text-center">
                📍 {prof.location}
              </p>
            )}
            {prof.bio && (
              <p className="text-white/60 text-sm text-center line-clamp-3">
                {prof.bio}
              </p>
            )}
          </motion.div>
        )}
        {slideIdx === 2 && (
          <motion.div
            key="slide-interests"
            className="absolute inset-0 flex flex-col items-center justify-center gap-4 px-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
            style={{
              background: "linear-gradient(135deg, #0a2e1e 0%, #1e0a2e 100%)",
            }}
          >
            <p className="text-white/60 text-xs uppercase tracking-widest">
              Interests
            </p>
            {interests.length > 0 ? (
              <div className="flex flex-wrap gap-2 justify-center">
                {interests.map((interest) => (
                  <span
                    key={interest}
                    className="px-3 py-1.5 rounded-full text-white text-xs font-medium"
                    style={{
                      background: "linear-gradient(135deg, #ec4899, #a855f7)",
                    }}
                  >
                    {interest}
                  </span>
                ))}
              </div>
            ) : (
              <span className="text-4xl">✨</span>
            )}
            {prof.thoughts && (
              <p className="text-white/50 text-xs text-center italic line-clamp-2">
                💭 {prof.thoughts}
              </p>
            )}
          </motion.div>
        )}
      </AnimatePresence>
      {/* Dot indicators */}
      <div className="absolute bottom-2 left-0 right-0 flex justify-center gap-1.5 z-10">
        {slides.map((slide, i) => (
          <button
            key={slide.type}
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setSlideIdx(i);
            }}
            className="transition-all rounded-full"
            style={{
              width: i === slideIdx ? 16 : 6,
              height: 6,
              background:
                i === slideIdx
                  ? "linear-gradient(90deg, #ec4899, #a855f7)"
                  : "rgba(255,255,255,0.3)",
            }}
          />
        ))}
      </div>
    </div>
  );
}

function TodaysPicksCard({
  profiles,
  callerProfile,
  onUserClick,
}: {
  profiles: [import("@icp-sdk/core/principal").Principal, Profile][];
  callerProfile: Profile | undefined;
  onUserClick: (p: import("@icp-sdk/core/principal").Principal) => void;
}) {
  const [pickIdx, setPickIdx] = useState(0);

  // Auto-advance every 5 seconds
  useEffect(() => {
    if (profiles.length === 0) return;
    const t = setInterval(
      () => setPickIdx((i) => (i + 1) % profiles.length),
      5000,
    );
    return () => clearInterval(t);
  }, [profiles.length]);

  if (profiles.length === 0) return null;

  const [principal, prof] = profiles[pickIdx] ?? profiles[0];
  const matchPct = getMatchPercent(prof, callerProfile, principal.toString());

  return (
    <div className="shrink-0 px-4 pb-3">
      <p
        className="text-sm font-bold mb-2"
        style={{
          background: "linear-gradient(90deg, #ec4899, #a855f7)",
          WebkitBackgroundClip: "text",
          WebkitTextFillColor: "transparent",
        }}
      >
        Today&apos;s Picks ✨
      </p>
      <motion.div
        key={principal.toString()}
        className="relative rounded-3xl overflow-hidden cursor-pointer"
        style={{ height: 320 }}
        onClick={() => onUserClick(principal)}
        whileTap={{ scale: 0.98 }}
        transition={{ type: "spring", stiffness: 400, damping: 25 }}
      >
        {/* Cover photo */}
        {prof.avatar ? (
          <img
            src={prof.avatar.getDirectURL()}
            alt={prof.displayName}
            className="w-full h-full object-cover"
          />
        ) : (
          <div
            className="w-full h-full"
            style={{ background: "linear-gradient(135deg, #ec4899, #a855f7)" }}
          />
        )}
        {/* Deep scrim gradient */}
        <div
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(to top, rgba(0,0,0,0.88) 0%, rgba(0,0,0,0.3) 45%, transparent 70%)",
          }}
        />
        {/* Top row: View Profile chip */}
        <button
          type="button"
          data-ocid="discover.button"
          onClick={(e) => {
            e.stopPropagation();
            onUserClick(principal);
          }}
          className="absolute top-3 left-3 flex items-center gap-1 px-3 py-1.5 rounded-full text-[11px] font-semibold text-white backdrop-blur-md active:scale-95 transition-transform"
          style={{
            background: "rgba(255,255,255,0.15)",
            border: "1px solid rgba(255,255,255,0.25)",
          }}
        >
          <span className="w-1.5 h-1.5 rounded-full bg-green-400 inline-block" />
          View Profile
        </button>
        {/* Info overlay */}
        <div className="absolute bottom-[72px] left-0 right-0 px-5">
          <p className="text-white font-bold text-2xl leading-tight tracking-tight">
            {prof.displayName}
          </p>
          {prof.location && (
            <p className="text-white/60 text-sm mt-0.5">📍 {prof.location}</p>
          )}
          <span
            className="inline-flex items-center gap-1 mt-2 px-3 py-1 rounded-full text-xs font-bold text-white"
            style={{
              background:
                "linear-gradient(135deg, rgba(236,72,153,0.9), rgba(168,85,247,0.9))",
              backdropFilter: "blur(8px)",
            }}
          >
            ✨ {matchPct}% Match
          </span>
        </div>
        {/* Bottom action row — Tinder-style */}
        <div
          className="absolute bottom-0 left-0 right-0 flex items-center justify-center gap-8 px-6 pb-4 pt-2"
          style={{
            background: "linear-gradient(to top, rgba(0,0,0,0.5), transparent)",
          }}
          onClick={(e) => e.stopPropagation()}
          onKeyDown={(e) => e.stopPropagation()}
          role="presentation"
        >
          <button
            type="button"
            data-ocid="discover.delete_button"
            onClick={(e) => {
              e.stopPropagation();
              setPickIdx((i) => (i + 1) % profiles.length);
            }}
            className="w-14 h-14 rounded-full flex items-center justify-center shadow-xl active:scale-90 transition-transform"
            style={{
              background: "rgba(255,255,255,0.12)",
              border: "2px solid rgba(255,255,255,0.25)",
              backdropFilter: "blur(12px)",
            }}
          >
            <X className="w-6 h-6 text-white" />
          </button>
          <button
            type="button"
            data-ocid="discover.primary_button"
            onClick={(e) => {
              e.stopPropagation();
              onUserClick(principal);
              setPickIdx((i) => (i + 1) % profiles.length);
            }}
            className="w-16 h-16 rounded-full flex items-center justify-center shadow-xl shadow-pink-500/40 active:scale-90 transition-transform"
            style={{ background: "linear-gradient(135deg, #ec4899, #a855f7)" }}
          >
            <Heart className="w-7 h-7 text-white" fill="white" />
          </button>
          <button
            type="button"
            data-ocid="discover.secondary_button"
            onClick={(e) => {
              e.stopPropagation();
              setPickIdx((i) => (i + 1) % profiles.length);
            }}
            className="w-14 h-14 rounded-full flex items-center justify-center shadow-xl active:scale-90 transition-transform"
            style={{
              background: "rgba(255,255,255,0.08)",
              border: "2px solid rgba(255,255,255,0.15)",
              backdropFilter: "blur(12px)",
            }}
          >
            <Star className="w-6 h-6 text-yellow-400" />
          </button>
        </div>
        {/* Dot indicators */}
        <div className="absolute top-3 right-3 flex gap-1">
          {profiles.map(([p], i) => (
            <button
              key={p.toString()}
              type="button"
              onClick={() => setPickIdx(i)}
              className="rounded-full transition-all"
              style={{
                width: i === pickIdx ? 16 : 6,
                height: 6,
                background: i === pickIdx ? "#ec4899" : "rgba(255,255,255,0.4)",
              }}
            />
          ))}
        </div>
      </motion.div>
    </div>
  );
}

function YouMayLikeSection({
  profiles,
  callerProfile,
  onUserClick,
}: {
  profiles: [import("@icp-sdk/core/principal").Principal, Profile][];
  callerProfile: Profile | undefined;
  onUserClick: (p: import("@icp-sdk/core/principal").Principal) => void;
}) {
  if (profiles.length === 0) return null;
  return (
    <div className="shrink-0 pb-6">
      <div className="px-4 py-1.5 flex items-center justify-between">
        <p
          className="text-sm font-bold"
          style={{
            background: "linear-gradient(90deg, #ec4899, #a855f7)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
          }}
        >
          You May Like ✨
        </p>
        <span className="text-pink-400 text-xs">{profiles.length} people</span>
      </div>
      <div className="flex gap-3 px-4 overflow-x-auto no-scrollbar pb-1">
        {profiles.map(([principal, prof]) => {
          const matchPct = getMatchPercent(
            prof,
            callerProfile,
            principal.toString(),
          );
          return (
            <button
              key={principal.toString()}
              type="button"
              data-ocid="discover.button"
              onClick={() => onUserClick(principal)}
              className="shrink-0 flex flex-col items-center gap-1.5 active:scale-95 transition-transform"
              style={{ width: 72 }}
            >
              <div className="relative">
                <div
                  className="w-14 h-14 rounded-full overflow-hidden"
                  style={{ border: "2px solid rgba(236,72,153,0.5)" }}
                >
                  {prof.avatar ? (
                    <img
                      src={prof.avatar.getDirectURL()}
                      alt={prof.displayName}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-pink-500 to-purple-600 flex items-center justify-center text-white text-xl font-bold">
                      {prof.displayName[0]?.toUpperCase()}
                    </div>
                  )}
                </div>
                <button
                  type="button"
                  onClick={(e) => e.stopPropagation()}
                  className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full flex items-center justify-center"
                  style={{
                    background: "linear-gradient(135deg, #ec4899, #a855f7)",
                  }}
                >
                  <Heart className="w-2.5 h-2.5 text-white" fill="white" />
                </button>
              </div>
              <p className="text-white/70 text-[10px] truncate w-full text-center">
                {prof.displayName}
              </p>
              <p className="text-pink-400 text-[9px] font-bold">{matchPct}%</p>
            </button>
          );
        })}
      </div>
    </div>
  );
}

function TinderSection({
  onUserClick,
  onLikeSound,
  searchQuery = "",
}: {
  onUserClick: (p: Principal) => void;
  onLikeSound: () => void;
  searchQuery?: string;
}) {
  const { data: queue, isLoading } = useGetTinderQueue();
  const { data: allProfiles } = useGetAllProfiles();
  const { data: callerProfile } = useGetCallerProfile();
  const { identity } = useInternetIdentity();
  const myPrincipal = identity?.getPrincipal();
  const { blockedSet } = useBlockedUsers();
  const { isPrivate } = usePrivacy();
  const _tinderLike = useTinderLike();
  const _tinderPass = useTinderPass();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showMatch, setShowMatch] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const [lastMatchName, setLastMatchName] = useState("");
  const [sentReaction, setSentReaction] = useState<string | null>(null);
  const [heartBurst, setHeartBurst] = useState(false);
  const [_superLiked, _setSuperLiked] = useState(false);
  let lastTapTime = 0;
  const handleDoubleTap = () => {
    const now = Date.now();
    if (now - lastTapTime < 300) {
      setHeartBurst(true);
      handleLike();
    }
    lastTapTime = now;
  };

  type ProfileEntry = {
    prof: Profile;
    principalStr: string;
    principal: Principal;
  };

  const profilesWithPrincipal: ProfileEntry[] = (() => {
    if (queue && queue.length > 0) {
      return queue
        .filter((_q, i) => {
          const entry = allProfiles?.[i];
          if (!entry) return true;
          return !isPrivate(entry[0].toString());
        })
        .map((prof: Profile, i: number) => ({
          prof,
          principalStr: allProfiles?.[i]?.[0]?.toString() ?? String(i),
          principal: (allProfiles?.[i]?.[0] ?? null) as Principal,
        }));
    }
    return (
      allProfiles
        ?.filter(
          ([p]) =>
            p.toString() !== myPrincipal?.toString() &&
            !blockedSet.has(p.toString()) &&
            !isPrivate(p.toString()),
        )
        .map(([p, prof]) => ({
          prof,
          principalStr: p.toString(),
          principal: p,
        })) ?? []
    );
  })();

  const sortedProfiles = [...profilesWithPrincipal]
    .filter((entry) =>
      searchQuery
        ? entry.prof.displayName
            .toLowerCase()
            .includes(searchQuery.toLowerCase()) ||
          entry.prof.location?.toLowerCase().includes(searchQuery.toLowerCase())
        : true,
    )
    .sort(
      (a, b) =>
        scoreProfile(b.prof, callerProfile, myPrincipal, b.principalStr) -
        scoreProfile(a.prof, callerProfile, myPrincipal, a.principalStr),
    );

  const current = sortedProfiles[currentIndex] ?? null;

  const handleLike = async () => {
    if (!current?.principal) return;
    onLikeSound();
    try {
      await _tinderLike.mutateAsync(current.principal);
    } catch {}
    setShowMatch(true);
    setShowConfetti(true);
    setLastMatchName(current.prof.displayName);
    setTimeout(() => {
      setShowMatch(false);
      setShowConfetti(false);
      setCurrentIndex((i) => i + 1);
    }, 2000);
  };

  const handlePass = async () => {
    if (!current?.principal) return;
    try {
      await _tinderPass.mutateAsync(current.principal);
    } catch {}
    setCurrentIndex((i) => i + 1);
  };

  const x = useMotionValue(0);
  const rotate = useTransform(x, [-150, 150], [-18, 18]);
  const likeOpacity = useTransform(x, [20, 100], [0, 1]);
  const passOpacity = useTransform(x, [-100, -20], [1, 0]);

  const handleDragEnd = (_: any, info: { offset: { x: number } }) => {
    if (info.offset.x > 100) {
      handleLike();
    } else if (info.offset.x < -100) {
      handlePass();
    } else {
      x.set(0);
    }
  };

  const useStarUserMutation = useStarUser();

  const handleStar = async () => {
    if (!current?.principal) return;
    try {
      await useStarUserMutation.mutateAsync(current.principal);
    } catch {}
  };

  const _handleCardReaction = (emoji: string) => {
    setSentReaction(emoji);
    setTimeout(() => setSentReaction(null), 1500);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="flex flex-col items-center gap-3">
          <Skeleton className="w-64 h-80 rounded-3xl" />
        </div>
      </div>
    );
  }

  if (!current) {
    return null;
  }

  const { prof, principalStr } = current;
  const matchPct = getMatchPercent(prof, callerProfile, principalStr);

  return (
    <div className="relative flex flex-col items-center justify-center h-full gap-3 px-4">
      {/* Confetti */}
      <AnimatePresence>
        {showConfetti && (
          <div className="absolute inset-0 pointer-events-none z-30 flex items-center justify-center">
            {CONFETTI_PIECES.map(({ id, color, index }) => (
              <ConfettiPiece key={id} color={color} index={index} />
            ))}
          </div>
        )}
      </AnimatePresence>

      {/* Match banner */}
      <AnimatePresence>
        {showMatch && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: -20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: -20 }}
            className="absolute top-4 left-0 right-0 flex justify-center z-30"
          >
            <div
              className="px-6 py-3 rounded-2xl text-white font-bold text-lg shadow-2xl"
              style={{
                background: "linear-gradient(135deg, #ec4899, #a855f7)",
              }}
            >
              ❤️ You liked {lastMatchName}!
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Reaction sent animation */}
      <AnimatePresence>
        {sentReaction && (
          <motion.div
            key={sentReaction}
            className="absolute top-1/3 left-0 right-0 flex justify-center z-30 pointer-events-none"
            initial={{ opacity: 1, scale: 0.5, y: 0 }}
            animate={{ opacity: 0, scale: 2, y: -60 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.8 }}
          >
            <span className="text-4xl">{sentReaction}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Card */}
      <motion.div
        key={principalStr}
        drag="x"
        dragConstraints={{ left: 0, right: 0 }}
        style={{ x, rotate }}
        onDragEnd={handleDragEnd}
        onClick={() => {
          handleDoubleTap();
          if (Date.now() - lastTapTime > 300) onUserClick(current.principal);
        }}
        className="relative w-full max-w-xs cursor-pointer"
        whileTap={{ scale: 0.98 }}
      >
        {heartBurst && <HeartBurst onDone={() => setHeartBurst(false)} />}
        {/* New badge */}
        <div className="absolute top-3 left-3 z-20 pointer-events-none">
          <span
            className="px-2 py-0.5 rounded-full text-[10px] font-bold text-white"
            style={{ background: "linear-gradient(135deg, #10b981, #059669)" }}
          >
            ● New
          </span>
        </div>
        {/* Like/Pass overlays */}
        <motion.div
          style={{ opacity: likeOpacity }}
          className="absolute top-8 left-4 z-10 px-3 py-1 bg-green-500/90 text-white font-black text-2xl rounded-xl border-4 border-green-400 rotate-[-12deg] pointer-events-none"
        >
          LIKE
        </motion.div>
        <motion.div
          style={{ opacity: passOpacity }}
          className="absolute top-8 right-4 z-10 px-3 py-1 bg-red-500/90 text-white font-black text-2xl rounded-xl border-4 border-red-400 rotate-[12deg] pointer-events-none"
        >
          PASS
        </motion.div>

        <div
          className="rounded-3xl overflow-hidden shadow-2xl"
          style={{
            background: "linear-gradient(135deg, #1a0a2e, #0a1a2e)",
            boxShadow:
              "0 20px 60px rgba(236,72,153,0.2), 0 0 0 1px rgba(255,255,255,0.05)",
          }}
        >
          {/* Auto-sliding carousel */}
          <ProfileCardCarousel prof={prof} principalStr={principalStr} />

          <div className="p-3">
            <div className="flex items-center justify-between mb-0.5">
              <h3 className="text-white font-bold text-lg">
                {prof.displayName}
              </h3>
              <div className="flex items-center gap-1.5">
                {matchPct > 0 && <CompatibilityRing pct={matchPct} size={40} />}
                <ProfileBadges principalStr={current.principalStr} />
              </div>
            </div>
            {prof.location && (
              <p className="text-white/40 text-xs">📍 {prof.location}</p>
            )}
          </div>
        </div>
      </motion.div>

      {/* Quick Match Actions Bar */}
      <QuickMatchBar
        onPass={handlePass}
        onUndo={() => setCurrentIndex((i) => Math.max(0, i - 1))}
        onSuperLike={async () => {
          handleLike();
        }}
        onBoost={() => {}}
      />
      {/* Action buttons (legacy) - hidden */}
      <div className="hidden flex items-center gap-4">
        <button
          type="button"
          data-ocid="discover.delete_button"
          onClick={(e) => {
            e.stopPropagation();
            handlePass();
          }}
          className="w-14 h-14 rounded-full bg-white/5 border border-white/10 flex items-center justify-center active:scale-90 transition-transform"
        >
          <X className="w-6 h-6 text-white/60" />
        </button>
        <button
          type="button"
          data-ocid="discover.toggle"
          onClick={(e) => {
            e.stopPropagation();
            handleStar();
          }}
          className="w-12 h-12 rounded-full flex items-center justify-center active:scale-90 transition-transform"
          style={{ background: "linear-gradient(135deg, #fbbf24, #f59e0b)" }}
        >
          <Star className="w-5 h-5 text-white fill-white" />
        </button>
        <button
          type="button"
          data-ocid="discover.primary_button"
          onClick={(e) => {
            e.stopPropagation();
            handleLike();
          }}
          className="w-14 h-14 rounded-full flex items-center justify-center active:scale-90 transition-transform"
          style={{ background: "linear-gradient(135deg, #ec4899, #a855f7)" }}
        >
          <Heart className="w-6 h-6 text-white fill-white" />
        </button>
      </div>
    </div>
  );
}
