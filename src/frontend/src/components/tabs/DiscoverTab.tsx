import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import type { Principal } from "@icp-sdk/core/principal";
import { Heart, Search, Star, X } from "lucide-react";
import {
  AnimatePresence,
  motion,
  useMotionValue,
  useTransform,
} from "motion/react";
import { useRef, useState } from "react";
import type { Profile } from "../../backend";
import { useInternetIdentity } from "../../hooks/useInternetIdentity";
import {
  useBlockedUsers,
  useGetAllProfiles,
  useGetCallerProfile,
  useGetStories,
  useGetTinderQueue,
  useTinderLike,
  useTinderPass,
} from "../../hooks/useQueries";
import LiveBroadcastScreen from "../LiveBroadcastScreen";
import ProfileBadges from "../ProfileBadges";
import SearchScreen from "../SearchScreen";
import StoryCreatorSheet from "../StoryCreatorSheet";

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

function StoryRingAvatar({
  principal,
  profile,
  onClick,
}: {
  principal: Principal;
  profile: Profile;
  onClick?: () => void;
}) {
  const { data: stories } = useGetStories(principal);
  const count = stories?.length ?? 0;
  if (count === 0) return null;
  return (
    <button
      type="button"
      onClick={onClick}
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

interface Props {
  onUserClick: (p: Principal) => void;
  onNotifOpen?: () => void;
}

export default function DiscoverTab({ onUserClick, onNotifOpen }: Props) {
  const [showLive, setShowLive] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const [storyCreatorOpen, setStoryCreatorOpen] = useState(false);
  const { identity } = useInternetIdentity();
  const myPrincipal = identity?.getPrincipal() ?? null;
  const { data: callerProfile } = useGetCallerProfile();
  const { data: myStories } = useGetStories(myPrincipal);
  const { data: allProfiles } = useGetAllProfiles();

  const myStoryCount = myStories?.length ?? 0;

  // Other users with stories (up to 6)
  const otherUsersWithStories =
    allProfiles
      ?.filter(([p]) => p.toString() !== myPrincipal?.toString())
      .slice(0, 6) ?? [];

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
      className="flex flex-col h-full bg-[#0a0a0f]"
    >
      {/* Single-row header */}
      <div
        className="shrink-0 flex items-center justify-between px-4 bg-[#0a0a0f] border-b border-white/5"
        style={{ height: 56 }}
      >
        <span className="discover-title text-2xl font-bold tracking-tight select-none">
          Discover
        </span>
        <div className="flex items-center gap-2">
          <button
            type="button"
            data-ocid="discover.search_input"
            onClick={() => setShowSearch(true)}
            className="w-9 h-9 rounded-full bg-white/8 border border-white/10 flex items-center justify-center active:scale-95 transition-transform"
          >
            <Search className="w-4 h-4 text-white/70" />
          </button>
          <button
            type="button"
            data-ocid="discover.primary_button"
            onClick={() => setShowLive(true)}
            className="flex items-center gap-1.5 bg-red-500/20 border border-red-500/50 text-red-400 text-xs font-bold px-3 py-1.5 rounded-full active:scale-95 transition-transform"
          >
            <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
            LIVE
          </button>
          <button
            type="button"
            data-ocid="discover.toggle"
            onClick={() => onNotifOpen?.()}
            className="w-9 h-9 rounded-full bg-pink-500/15 border border-pink-500/20 flex items-center justify-center active:scale-95 transition-transform relative"
          >
            <Heart className="w-4 h-4 text-pink-400" />
            <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-pink-500" />
          </button>
        </div>
      </div>

      {/* Story row */}
      <div className="px-4 pt-3 pb-2 shrink-0">
        <div className="flex items-center gap-3 overflow-x-auto no-scrollbar pb-1">
          {/* My story / add story button */}
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
                          {callerProfile?.displayName?.[0]?.toUpperCase() ??
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

          {/* Other users' stories */}
          {otherUsersWithStories.map(([p, prof]) => (
            <StoryRingAvatar
              key={p.toString()}
              principal={p}
              profile={prof}
              onClick={() => onUserClick(p)}
            />
          ))}
        </div>
      </div>

      {/* Daily Picks section */}
      {(() => {
        const pickProfiles = (allProfiles ?? [])
          .filter(([p]) => p.toString() !== myPrincipal?.toString())
          .slice(0, 3);
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
            <div className="flex gap-3 overflow-x-auto no-scrollbar pb-1">
              {pickProfiles.map(([principal, prof]) => {
                const matchScore =
                  (principal.toString().charCodeAt(2) % 40) + 60;
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
                      {matchScore}% Match
                    </p>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                      }}
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

      {/* Swipe section */}
      <div className="flex-1 overflow-hidden">
        <TinderSection onUserClick={onUserClick} onLikeSound={playLikeSound} />
      </div>

      <StoryCreatorSheet
        open={storyCreatorOpen}
        onClose={() => setStoryCreatorOpen(false)}
      />
    </div>
  );
}

function TinderSection({
  onUserClick,
  onLikeSound,
}: { onUserClick: (p: Principal) => void; onLikeSound: () => void }) {
  const { data: queue, isLoading } = useGetTinderQueue();
  const { data: allProfiles } = useGetAllProfiles();
  const { identity } = useInternetIdentity();
  const myPrincipal = identity?.getPrincipal();
  const { blockedSet } = useBlockedUsers();
  const _tinderLike = useTinderLike();
  const _tinderPass = useTinderPass();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showMatch, setShowMatch] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const [lastMatchName, setLastMatchName] = useState("");

  // Use queue profiles if available, otherwise fall back to allProfiles excluding self
  const profiles =
    queue && queue.length > 0
      ? queue
      : (allProfiles
          ?.filter(
            ([p]) =>
              p.toString() !== myPrincipal?.toString() &&
              !blockedSet.has(p.toString()),
          )
          .map(([, prof]) => prof) ?? []);
  const currentProfile = profiles[currentIndex] ?? null;

  // Find principal for current profile from allProfiles
  const currentPrincipal =
    allProfiles?.find(
      ([, prof]) => prof.displayName === currentProfile?.displayName,
    )?.[0] ?? null;

  const handleLike = async () => {
    if (!currentProfile) return;
    onLikeSound();
    try {
      if (currentPrincipal) await _tinderLike.mutateAsync(currentPrincipal);
      setLastMatchName(currentProfile.displayName);
      setShowMatch(true);
      setShowConfetti(true);
      setTimeout(() => setShowConfetti(false), 1600);
    } catch {}
    setCurrentIndex((i) => i + 1);
  };

  const handlePass = async () => {
    if (!currentProfile) return;
    try {
      if (currentPrincipal) await _tinderPass.mutateAsync(currentPrincipal);
    } catch {}
    setCurrentIndex((i) => i + 1);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div
          data-ocid="discover.loading_state"
          className="w-full max-w-xs mx-4"
        >
          <Skeleton className="w-full aspect-[3/4] rounded-3xl" />
        </div>
      </div>
    );
  }

  if (!currentProfile) {
    return (
      <div
        data-ocid="discover.empty_state"
        className="flex flex-col items-center justify-center h-full gap-4 px-8 text-center"
      >
        <div className="text-6xl">🌟</div>
        <p className="text-white/70 font-bold text-xl">
          You&apos;re all caught up!
        </p>
        <p className="text-white/40 text-sm">Check back later for new people</p>
      </div>
    );
  }

  return (
    <div className="relative flex flex-col items-center h-full px-4 pb-4">
      <AnimatePresence>
        {showMatch && (
          <motion.div
            key="match-banner"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            className="absolute inset-0 z-30 flex items-center justify-center bg-black/70 rounded-3xl overflow-hidden"
          >
            {showConfetti &&
              CONFETTI_PIECES.map((piece) => (
                <ConfettiPiece
                  key={piece.id}
                  color={piece.color}
                  index={piece.index}
                />
              ))}
            <div className="flex flex-col items-center gap-4 p-6 relative z-10">
              <p className="text-5xl">💕</p>
              <p className="text-white font-bold text-2xl">
                It&apos;s a Match!
              </p>
              <p className="text-white/60">
                You and {lastMatchName} liked each other
              </p>
              <Button
                onClick={() => setShowMatch(false)}
                className="bg-gradient-to-r from-pink-500 to-purple-600 border-0 text-white"
              >
                Keep Swiping
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <SwipeCard
        profile={currentProfile}
        onLike={handleLike}
        onPass={handlePass}
        onTap={() => currentPrincipal && onUserClick(currentPrincipal)}
      />
    </div>
  );
}

function SwipeCard({
  profile,
  onLike,
  onPass,
  onTap,
}: {
  profile: Profile;
  onLike: () => void;
  onPass: () => void;
  onTap: () => void;
}) {
  const x = useMotionValue(0);
  const rotate = useTransform(x, [-150, 150], [-18, 18]);
  const opacity = useTransform(x, [-150, -80, 0, 80, 150], [0, 1, 1, 1, 0]);
  const likeOpacity = useTransform(x, [20, 80], [0, 1]);
  const nopeOpacity = useTransform(x, [-80, -20], [1, 0]);
  const isDragging = useRef(false);

  const handleDragStart = () => {
    isDragging.current = true;
  };
  const handleDragEnd = (_: unknown, info: { offset: { x: number } }) => {
    setTimeout(() => {
      isDragging.current = false;
    }, 50);
    if (info.offset.x > 100) onLike();
    else if (info.offset.x < -100) onPass();
  };

  const handleCardTap = () => {
    if (!isDragging.current) onTap();
  };

  const handleSuperlike = (e: React.MouseEvent) => {
    e.stopPropagation();
    onLike();
  };

  const handlePassClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onPass();
  };

  const handleLikeClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onLike();
  };

  return (
    <div className="relative w-full flex flex-col items-center flex-1">
      <motion.div
        drag="x"
        dragConstraints={{ left: 0, right: 0 }}
        style={{ x, rotate, opacity }}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
        onClick={handleCardTap}
        className="w-full cursor-grab active:cursor-grabbing"
        data-ocid="discover.card"
      >
        <div className="relative w-full aspect-[3/4] rounded-3xl overflow-hidden bg-gradient-to-br from-pink-900/40 to-purple-900/40 shadow-2xl">
          {profile.avatar ? (
            <img
              src={profile.avatar.getDirectURL()}
              alt={profile.displayName}
              className="absolute inset-0 w-full h-full object-cover"
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-8xl">👤</span>
            </div>
          )}

          <motion.div
            style={{ opacity: likeOpacity }}
            className="absolute top-8 left-6 rotate-[-15deg] border-4 border-green-400 rounded-lg px-3 py-1"
          >
            <span className="text-green-400 font-black text-2xl">LIKE</span>
          </motion.div>
          <motion.div
            style={{ opacity: nopeOpacity }}
            className="absolute top-8 right-6 rotate-[15deg] border-4 border-red-400 rounded-lg px-3 py-1"
          >
            <span className="text-red-400 font-black text-2xl">NOPE</span>
          </motion.div>

          <div className="absolute top-3 right-3 bg-black/40 backdrop-blur-sm rounded-full px-2 py-1">
            <span className="text-white/60 text-[10px]">Tap for profile</span>
          </div>

          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent p-4">
            <h3 className="text-white font-bold text-xl">
              {profile.displayName}
            </h3>
            {profile.location && (
              <p className="text-white/60 text-sm">📍 {profile.location}</p>
            )}
            {profile.bio && (
              <p className="text-white/70 text-sm mt-1 line-clamp-2">
                {profile.bio}
              </p>
            )}
          </div>
        </div>
      </motion.div>

      {/* Action buttons */}
      <div className="flex items-center gap-5 mt-4">
        <button
          type="button"
          data-ocid="discover.delete_button"
          onClick={handlePassClick}
          className="w-14 h-14 rounded-full bg-white/10 border border-white/20 flex items-center justify-center shadow-lg active:scale-95 transition-transform"
        >
          <X className="w-6 h-6 text-white" />
        </button>
        <button
          type="button"
          data-ocid="discover.secondary_button"
          onClick={handleSuperlike}
          className="w-14 h-14 rounded-full bg-gradient-to-br from-yellow-400 to-orange-400 flex items-center justify-center shadow-lg shadow-yellow-400/30 active:scale-95 transition-transform"
        >
          <Star className="w-6 h-6 text-white fill-white" />
        </button>
        <button
          type="button"
          data-ocid="discover.toggle"
          onClick={handleLikeClick}
          className="w-16 h-16 rounded-full bg-gradient-to-br from-pink-500 to-purple-600 flex items-center justify-center shadow-lg shadow-pink-500/30 active:scale-95 transition-transform"
        >
          <Heart className="w-7 h-7 text-white" />
        </button>
      </div>
    </div>
  );
}
