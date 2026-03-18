import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import type { Principal } from "@icp-sdk/core/principal";
import { Bell, Heart, Search, Star, X, Zap } from "lucide-react";
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

const QUICK_REACTIONS = [
  { emoji: "⭐", label: "Star" },
  { emoji: "❤️", label: "Heart" },
  { emoji: "💋", label: "Kiss" },
  { emoji: "🥺", label: "Miss you" },
  { emoji: "🙏", label: "Thanks" },
  { emoji: "🔗", label: "Link" },
];

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
}: Props) {
  const [showLive, setShowLive] = useState(false);
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

  const myStoryCount = myStories?.length ?? 0;

  const otherUsersWithStories =
    allProfiles
      ?.filter(([p]) => p.toString() !== myPrincipal?.toString())
      .slice(0, 6) ?? [];

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
      className="flex flex-col h-full"
      style={{ background: "var(--sf-bg, #0a0a0f)" }}
    >
      {/* Top Header Bar */}
      <div
        className="shrink-0 flex items-center gap-2 px-3"
        style={{
          height: 52,
          background: "rgba(10,10,15,0.97)",
          borderBottom: "1px solid rgba(255,255,255,0.05)",
        }}
      >
        {/* Left: Discover text */}
        <span
          className="text-lg font-black tracking-tight shrink-0"
          style={{
            background:
              "linear-gradient(90deg, #ec4899 0%, #a855f7 50%, #ec4899 100%)",
            backgroundSize: "200%",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            animation: "gradientMove 3s linear infinite",
          }}
        >
          Discover
        </span>
        {/* Center: Live search input */}
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
        {/* Right: Notification bell */}
        <button
          type="button"
          data-ocid="discover.toggle"
          onClick={() => onNotifOpen?.()}
          className="w-9 h-9 shrink-0 rounded-full bg-white/5 flex items-center justify-center active:scale-90 transition-transform relative"
        >
          <Bell className="w-4 h-4 text-white/70" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-pink-500 rounded-full" />
        </button>
      </div>

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

      {/* Daily Picks section */}
      {(() => {
        const { isPrivate } = { isPrivate: (_s: string) => false };
        void isPrivate;
        const pickProfiles = (allProfiles ?? [])
          .filter(([p]) => p.toString() !== myPrincipal?.toString())
          .slice(0, 5);
        if (pickProfiles.length === 0) return null;
        return (
          <div className="px-4 pb-3 shrink-0">
            <p
              className="text-sm font-bold mb-2"
              style={{
                background: "linear-gradient(90deg, #ec4899, #a855f7, #ec4899)",
                backgroundSize: "200%",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}
            >
              Today&apos;s Picks ✨
            </p>
            <div
              ref={picksScrollRef}
              className="flex gap-3 overflow-x-auto no-scrollbar pb-1"
            >
              {pickProfiles.map(([principal, prof]) => {
                const matchPct = getMatchPercent(
                  prof,
                  callerProfile,
                  principal.toString(),
                );
                return (
                  <button
                    key={principal.toString()}
                    type="button"
                    onClick={() => onUserClick(principal)}
                    className="shrink-0 flex flex-col items-center gap-1.5 rounded-2xl p-3 active:scale-95 transition-transform"
                    style={{
                      width: 130,
                      background: "rgba(255,255,255,0.04)",
                      boxShadow:
                        "0 0 0 1.5px rgba(236,72,153,0.3), 0 4px 16px rgba(168,85,247,0.12)",
                    }}
                  >
                    <div className="w-12 h-12 rounded-full overflow-hidden bg-gradient-to-br from-pink-500 to-purple-600">
                      {prof.avatar ? (
                        <img
                          src={prof.avatar.getDirectURL()}
                          alt={prof.displayName}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-white font-bold text-lg">
                          {prof.displayName[0]?.toUpperCase()}
                        </div>
                      )}
                    </div>
                    <p className="text-white text-xs font-semibold truncate w-full text-center">
                      {prof.displayName}
                    </p>
                    <p
                      className="text-xs font-bold"
                      style={{ color: "#f472b6" }}
                    >
                      {matchPct}% Match
                    </p>
                    <button
                      type="button"
                      onClick={(e) => e.stopPropagation()}
                      className="w-7 h-7 rounded-full flex items-center justify-center active:scale-90 transition-transform"
                      style={{
                        background: "linear-gradient(135deg, #ec4899, #a855f7)",
                      }}
                    >
                      <Heart className="w-3.5 h-3.5 text-white" />
                    </button>
                  </button>
                );
              })}
            </div>
          </div>
        );
      })()}

      <SpotlightSection
        profiles={allProfiles ?? []}
        onUserClick={onUserClick}
      />
      {/* Swipe section + Quick Reactions */}
      <div className="flex-1 overflow-hidden flex flex-col">
        <div className="flex-1 overflow-hidden">
          <TinderSection
            onUserClick={onUserClick}
            onLikeSound={playLikeSound}
            searchQuery={searchQuery}
          />
        </div>

        {/* Quick Send Reactions */}
        <QuickReactionRow />
      </div>

      {/* Other Profiles - horizontal scroll */}
      <OtherProfilesRow
        profiles={(allProfiles ?? [])
          .filter(([p]) => p.toString() !== myPrincipal?.toString())
          .slice(0, 12)}
        onUserClick={onUserClick}
        searchQuery={searchQuery}
      />

      <StoryCreatorSheet
        open={storyCreatorOpen}
        onClose={() => setStoryCreatorOpen(false)}
      />

      {/* Story Viewer */}
      <AnimatePresence>
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
  if (count === 0) return null;

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

function OtherProfilesRow({
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

function QuickReactionRow() {
  const [sentIdx, setSentIdx] = useState<number | null>(null);

  const handleSend = (idx: number) => {
    setSentIdx(idx);
    setTimeout(() => setSentIdx(null), 1500);
  };

  return (
    <div className="px-3 pb-3 shrink-0">
      <div className="flex gap-2 overflow-x-auto no-scrollbar py-1">
        {QUICK_REACTIONS.map((r, i) => (
          <button
            key={r.label}
            type="button"
            data-ocid="discover.button"
            onClick={() => handleSend(i)}
            className="shrink-0 flex items-center gap-1.5 px-3 py-2 rounded-full text-white text-sm font-semibold active:scale-95 transition-all"
            style={{
              background:
                sentIdx === i
                  ? "linear-gradient(135deg, #10b981, #059669)"
                  : "linear-gradient(135deg, rgba(236,72,153,0.3), rgba(168,85,247,0.3))",
              border: "1px solid rgba(236,72,153,0.3)",
            }}
          >
            <span className="text-base">{r.emoji}</span>
            <span className="text-xs">
              {sentIdx === i ? "Sent! ✓" : r.label}
            </span>
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
  const [_superLiked, setSuperLiked] = useState(false);
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

  const handleCardReaction = (emoji: string) => {
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
    return (
      <div className="flex flex-col items-center justify-center h-full gap-4 px-6">
        <div
          className="w-20 h-20 rounded-full flex items-center justify-center"
          style={{
            background: "linear-gradient(135deg, #ec4899, #a855f7)",
          }}
        >
          <Heart className="w-10 h-10 text-white" />
        </div>
        <div className="text-center">
          <p className="text-white font-bold text-lg">
            You&apos;re all caught up!
          </p>
          <p className="text-white/40 text-sm mt-1">
            Check back soon for new profiles
          </p>
        </div>
        <Button
          onClick={() => setCurrentIndex(0)}
          className="rounded-full px-6"
          style={{ background: "linear-gradient(135deg, #ec4899, #a855f7)" }}
        >
          Restart
        </Button>
      </div>
    );
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
            <div className="flex items-center gap-1.5 mt-1 flex-wrap">
              <MutualInterestsBadge
                myInterests={callerProfile?.interests}
                theirInterests={prof.interests}
              />
              <BookmarkToggleButton
                id={principalStr}
                name={prof.displayName ?? ""}
                type="profile"
              />
              <SafeReportButton userName={prof.displayName ?? "User"} />
              <SuperLikeButton
                onSuperLike={() => {
                  setSuperLiked(true);
                  handleLike();
                }}
              />
            </div>
          </div>

          {/* Per-card quick reactions */}
          {/* biome-ignore lint/a11y/useKeyWithClickEvents: stop propagation wrapper */}
          <div
            className="px-3 pb-3 flex gap-1.5 overflow-x-auto no-scrollbar"
            onClick={(e) => e.stopPropagation()}
          >
            {QUICK_REACTIONS.map((r) => (
              <button
                key={r.label}
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  handleCardReaction(r.emoji);
                }}
                className="shrink-0 flex items-center gap-1 px-2 py-1 rounded-full text-white text-xs active:scale-90 transition-transform"
                style={{
                  background: "rgba(255,255,255,0.08)",
                  border: "1px solid rgba(255,255,255,0.1)",
                }}
              >
                <span>{r.emoji}</span>
                <span className="text-[10px] opacity-70">{r.label}</span>
              </button>
            ))}
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
