import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import type { Principal } from "@icp-sdk/core/principal";
import { Heart, Search, Star, X, Zap } from "lucide-react";
import {
  AnimatePresence,
  motion,
  useMotionValue,
  useTransform,
} from "motion/react";
import { useEffect, useRef, useState } from "react";
import type { Profile } from "../../backend";
import {
  useGetTinderQueue,
  useTinderLike,
  useTinderPass,
} from "../../hooks/useQueries";
import LiveBroadcastScreen from "../LiveBroadcastScreen";
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

interface Props {
  onUserClick: (p: Principal) => void;
  onNotifOpen?: () => void;
}

export default function DiscoverTab({ onUserClick, onNotifOpen }: Props) {
  const [showLive, setShowLive] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const [storyCreatorOpen, setStoryCreatorOpen] = useState(false);
  const [boostActive, setBoostActive] = useState(false);
  const [boostCountdown, setBoostCountdown] = useState(0);
  const boostTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const handleBoost = () => {
    if (boostActive) return;
    setBoostActive(true);
    setBoostCountdown(30);
    boostTimerRef.current = setInterval(() => {
      setBoostCountdown((c) => {
        if (c <= 1) {
          clearInterval(boostTimerRef.current!);
          setBoostActive(false);
          return 0;
        }
        return c - 1;
      });
    }, 1000);
  };

  useEffect(() => {
    return () => {
      if (boostTimerRef.current) clearInterval(boostTimerRef.current);
    };
  }, []);

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
      {/* Inline Header with logo + search + heart */}
      <div
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
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setShowSearch(true)}
            className="w-9 h-9 rounded-full bg-white/10 flex items-center justify-center"
          >
            <Search className="w-4 h-4 text-white/70" />
          </button>
          <button
            type="button"
            onClick={() => onNotifOpen?.()}
            className="w-9 h-9 rounded-full bg-pink-500/15 flex items-center justify-center relative"
          >
            <Heart className="w-4 h-4 text-pink-400" />
          </button>
        </div>
      </div>

      {/* Header */}
      <div className="px-4 pt-3 pb-3 shrink-0">
        <div className="flex items-center justify-between">
          <div />
          <div className="flex items-center gap-2">
            {/* Boost button */}
            <button
              type="button"
              data-ocid="discover.toggle"
              onClick={handleBoost}
              className={`relative flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-full transition-all ${
                boostActive
                  ? "bg-gradient-to-r from-purple-600 to-blue-500 text-white shadow-lg shadow-purple-500/40 ring-2 ring-purple-400/50 animate-pulse"
                  : "bg-purple-600/20 border border-purple-500/40 text-purple-300"
              }`}
            >
              <Zap className="w-3 h-3" />
              {boostActive ? (
                <span className="tabular-nums">{boostCountdown}s</span>
              ) : (
                "Boost"
              )}
            </button>

            {/* LIVE button */}
            <button
              type="button"
              data-ocid="discover.primary_button"
              onClick={() => setShowLive(true)}
              className="flex items-center gap-1.5 bg-red-500/20 border border-red-500/40 text-red-400 text-xs font-bold px-3 py-1.5 rounded-full"
            >
              <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
              LIVE
            </button>

            <button
              type="button"
              data-ocid="discover.search_input"
              onClick={() => setShowSearch(true)}
              className="w-9 h-9 rounded-full bg-white/10 flex items-center justify-center"
            >
              <Search className="w-4 h-4 text-white/70" />
            </button>
          </div>
        </div>

        {/* Story row */}
        <div className="flex items-center gap-3 mt-3 overflow-x-auto no-scrollbar pb-1">
          <div className="flex flex-col items-center gap-1 shrink-0">
            <button
              type="button"
              data-ocid="discover.upload_button"
              onClick={() => setStoryCreatorOpen(true)}
              className="w-14 h-14 rounded-full border-2 border-dashed border-pink-500/50 flex items-center justify-center bg-pink-500/10 active:scale-95 transition-transform"
            >
              <span className="text-pink-400 text-2xl font-light leading-none">
                +
              </span>
            </button>
            <span className="text-white/50 text-[10px]">Your story</span>
          </div>
        </div>
      </div>

      {/* Swipe section */}
      <div className="flex-1 overflow-hidden">
        <TinderSection />
      </div>

      <StoryCreatorSheet
        open={storyCreatorOpen}
        onClose={() => setStoryCreatorOpen(false)}
      />
    </div>
  );
}

function TinderSection() {
  const { data: queue, isLoading } = useGetTinderQueue();
  const _tinderLike = useTinderLike();
  const _tinderPass = useTinderPass();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showMatch, setShowMatch] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const [lastMatchName, setLastMatchName] = useState("");

  const profiles = queue ?? [];
  const current = profiles[currentIndex];

  const handleLike = async () => {
    if (!current) return;
    try {
      await _tinderLike.mutateAsync(current.avatar as never);
      setLastMatchName(current.displayName);
      setShowMatch(true);
      setShowConfetti(true);
      setTimeout(() => setShowConfetti(false), 1600);
    } catch {}
    setCurrentIndex((i) => i + 1);
  };

  const handlePass = async () => {
    if (!current) return;
    try {
      await _tinderPass.mutateAsync(current.avatar as never);
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

  if (!current) {
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
            {/* Confetti */}
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

      <SwipeCard profile={current} onLike={handleLike} onPass={handlePass} />
    </div>
  );
}

function SwipeCard({
  profile,
  onLike,
  onPass,
}: { profile: Profile; onLike: () => void; onPass: () => void }) {
  const x = useMotionValue(0);
  const rotate = useTransform(x, [-150, 150], [-18, 18]);
  const opacity = useTransform(x, [-150, -80, 0, 80, 150], [0, 1, 1, 1, 0]);
  const likeOpacity = useTransform(x, [20, 80], [0, 1]);
  const nopeOpacity = useTransform(x, [-80, -20], [1, 0]);

  const handleDragEnd = (_: unknown, info: { offset: { x: number } }) => {
    if (info.offset.x > 100) onLike();
    else if (info.offset.x < -100) onPass();
  };

  const handleSuperlike = () => {
    onLike();
  };

  return (
    <div className="relative w-full flex flex-col items-center flex-1">
      <motion.div
        drag="x"
        dragConstraints={{ left: 0, right: 0 }}
        style={{ x, rotate, opacity }}
        onDragEnd={handleDragEnd}
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

          {/* Like/Nope overlays */}
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

          {/* Info gradient */}
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
        {/* Pass */}
        <button
          type="button"
          data-ocid="discover.delete_button"
          onClick={onPass}
          className="w-14 h-14 rounded-full bg-white/10 border border-white/20 flex items-center justify-center shadow-lg active:scale-95 transition-transform"
        >
          <X className="w-6 h-6 text-white" />
        </button>

        {/* Superlike (center-ish) */}
        <button
          type="button"
          data-ocid="discover.secondary_button"
          onClick={handleSuperlike}
          className="w-14 h-14 rounded-full bg-gradient-to-br from-yellow-400 to-orange-400 flex items-center justify-center shadow-lg shadow-yellow-400/30 active:scale-95 transition-transform"
        >
          <Star className="w-6 h-6 text-white fill-white" />
        </button>

        {/* Like */}
        <button
          type="button"
          data-ocid="discover.toggle"
          onClick={onLike}
          className="w-16 h-16 rounded-full bg-gradient-to-br from-pink-500 to-purple-600 flex items-center justify-center shadow-lg shadow-pink-500/30 active:scale-95 transition-transform"
        >
          <Heart className="w-7 h-7 text-white" />
        </button>
      </div>
    </div>
  );
}
