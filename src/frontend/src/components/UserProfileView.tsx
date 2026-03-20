import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import type { Principal } from "@icp-sdk/core/principal";
import {
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  Crown,
  Gift,
  Grid,
  Loader2,
  MessageCircle,
  MoreVertical,
  Phone,
  UserCheck,
  UserPlus,
  Video,
  X,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useEffect, useState } from "react";
import { useActor } from "../hooks/useActor";
import { useCallSignal } from "../hooks/useCallSignal";
import { useInternetIdentity } from "../hooks/useInternetIdentity";
import {
  useBlockedUsers,
  useFollow,
  useGetFollowers,
  useGetFollowing,
  useGetPostsByUser,
  useGetUserProfile,
  useStarUser,
} from "../hooks/useQueries";
import CallScreen from "./CallScreen";
import FollowListSheet from "./FollowListSheet";
import GiftSheet from "./GiftSheet";
import IncomingCallOverlay from "./IncomingCallOverlay";
import OutgoingCallOverlay from "./OutgoingCallOverlay";
import ProfileBadges from "./ProfileBadges";
import { useProfileVisit } from "./ProfileVisitTracker";

interface Props {
  principal: Principal;
  onBack: () => void;
  onMessage?: () => void;
}

export default function UserProfileView({
  principal,
  onBack,
  onMessage,
}: Props) {
  const { identity } = useInternetIdentity();
  const myPrincipal = identity?.getPrincipal();

  const { data: profile, isLoading } = useGetUserProfile(principal);
  const { data: posts } = useGetPostsByUser(principal);
  const { data: followers } = useGetFollowers(principal);
  const { data: following } = useGetFollowing(principal);
  const followMutation = useFollow();
  const starUser = useStarUser();
  const { broadcastCall, broadcastCallViaBackend } = useCallSignal();
  const { actor } = useActor();

  const [callMode, setCallMode] = useState<"voice" | "video" | null>(null);
  const [outgoingCall, setOutgoingCall] = useState<"voice" | "video" | null>(
    null,
  );
  const [incomingCall, setIncomingCall] = useState<"voice" | "video" | null>(
    null,
  );
  const [giftOpen, setGiftOpen] = useState(false);
  const [carouselIdx, setCarouselIdx] = useState(0);
  const [lightboxIdx, setLightboxIdx] = useState<number | null>(null);
  const [starredAnim, setStarredAnim] = useState(false);
  const [thanksAnim, setThanksAnim] = useState(false);
  const [sentEmoji, setSentEmoji] = useState<string | null>(null);
  const [followSheet, setFollowSheet] = useState<
    "followers" | "following" | null
  >(null);
  const [showBlockMenu, setShowBlockMenu] = useState(false);
  const { blockUser } = useBlockedUsers();

  // Check premium status from localStorage
  const [isPremium, setIsPremium] = useState(false);
  useEffect(() => {
    try {
      const raw = localStorage.getItem("socialFusionPremium");
      if (raw) {
        const data = JSON.parse(raw);
        if (data.isPremium && data.expiry > Date.now()) setIsPremium(true);
      }
    } catch {}
  }, []);

  // Track profile visit
  useProfileVisit(
    principal.toString(),
    myPrincipal?.toString(),
    profile?.displayName ?? "Unknown",
    profile?.avatar?.getDirectURL(),
  );

  const isMe = myPrincipal?.toString() === principal.toString();
  const isFollowing =
    followers?.some((f) => f.toString() === myPrincipal?.toString()) ?? false;

  const carouselImages: string[] = [];
  if (profile?.avatar) carouselImages.push(profile.avatar.getDirectURL());
  if (posts) {
    for (const p of posts) {
      if (p.image) carouselImages.push(p.image.getDirectURL());
    }
  }
  const totalImages = Math.max(carouselImages.length, 1);

  const prevImage = () =>
    setCarouselIdx((i) => (i - 1 + totalImages) % totalImages);
  const nextImage = () => setCarouselIdx((i) => (i + 1) % totalImages);

  const handleFollow = async () => {
    try {
      await followMutation.mutateAsync({
        user: principal,
        following: isFollowing,
      });
    } catch {}
  };

  const [activeCallId, setActiveCallId] = useState<string | null>(null);

  const handleCallClick = (mode: "voice" | "video") => {
    setOutgoingCall(mode);
    if (myPrincipal) {
      const cid = broadcastCall(
        principal.toString(),
        mode,
        myPrincipal.toString(),
      );
      setActiveCallId(cid);
      broadcastCallViaBackend?.(principal, mode, myPrincipal.toString());
      const channel = new BroadcastChannel("social-fusion-calls");
      const timeout = setTimeout(() => {
        channel.close();
        setOutgoingCall(null);
      }, 45000);
      channel.onmessage = (evt: MessageEvent) => {
        const signal = evt.data;
        if (signal.callId === cid) {
          clearTimeout(timeout);
          channel.close();
          setOutgoingCall(null);
          if (signal.type === "accepted") {
            setCallMode(mode);
          }
        }
      };
    }
  };

  const handleStar = async () => {
    try {
      await starUser.mutateAsync(principal);
      setStarredAnim(true);
      setTimeout(() => setStarredAnim(false), 1500);
    } catch {}
  };

  const handleSpecialThanks = () => {
    setThanksAnim(true);
    setTimeout(() => setThanksAnim(false), 1500);
  };

  const handleEmojiReaction = (emoji: string) => {
    setSentEmoji(emoji);
    setTimeout(() => setSentEmoji(null), 1200);
  };

  if (callMode) {
    return (
      <CallScreen
        mode={callMode}
        callId={activeCallId ?? undefined}
        otherProfile={profile!}
        otherPrincipal={principal}
        actor={actor}
        onEnd={() => {
          setCallMode(null);
          setActiveCallId(null);
        }}
      />
    );
  }

  if (isLoading) {
    return (
      <div
        data-ocid="user_profile.loading_state"
        className="flex flex-col gap-4 p-4"
      >
        <Skeleton className="w-full h-72 rounded-2xl" />
        <Skeleton className="w-40 h-4" />
        <Skeleton className="w-60 h-3" />
      </div>
    );
  }

  if (!profile) {
    return (
      <div
        data-ocid="user_profile.error_state"
        className="flex flex-col items-center justify-center h-full gap-3"
      >
        <p className="text-muted-foreground">User not found</p>
        <Button onClick={onBack} variant="outline">
          Go back
        </Button>
      </div>
    );
  }

  return (
    <div
      data-ocid="user_profile.page"
      className="flex flex-col h-full bg-[#0a0a0f] overflow-y-auto pb-20"
    >
      {/* Back button */}
      <button
        type="button"
        data-ocid="user_profile.close_button"
        onClick={onBack}
        className="fixed top-3 left-3 z-30 w-9 h-9 rounded-full bg-black/50 backdrop-blur-sm flex items-center justify-center"
      >
        <ArrowLeft className="w-5 h-5 text-white" />
      </button>

      {/* Block/Report menu */}
      {!isMe && (
        <div className="fixed top-3 right-3 z-30">
          <button
            type="button"
            data-ocid="user_profile.open_modal_button"
            onClick={() => setShowBlockMenu((v) => !v)}
            className="w-9 h-9 rounded-full bg-black/50 backdrop-blur-sm flex items-center justify-center"
          >
            <MoreVertical className="w-5 h-5 text-white" />
          </button>
          {showBlockMenu && (
            <div
              className="absolute right-0 top-11 bg-[#1a1a2e] border border-white/10 rounded-xl shadow-2xl overflow-hidden min-w-[140px]"
              data-ocid="user_profile.dropdown_menu"
            >
              <button
                type="button"
                data-ocid="user_profile.delete_button"
                onClick={() => {
                  blockUser(principal.toString());
                  setShowBlockMenu(false);
                  onBack();
                }}
                className="w-full flex items-center gap-2 px-4 py-3 text-sm text-red-400 hover:bg-red-500/10 transition-colors"
              >
                🚫 Block User
              </button>
              <button
                type="button"
                data-ocid="user_profile.secondary_button"
                onClick={() => setShowBlockMenu(false)}
                className="w-full flex items-center gap-2 px-4 py-3 text-sm text-white/70 hover:bg-white/5 transition-colors"
              >
                ⚠️ Report
              </button>
            </div>
          )}
        </div>
      )}

      {/* Thoughts ticker */}
      {profile.thoughts && (
        <div
          className="relative overflow-hidden shrink-0"
          style={{
            background:
              "linear-gradient(90deg, rgba(236,72,153,0.15), rgba(168,85,247,0.15))",
            borderBottom: "1px solid rgba(236,72,153,0.2)",
          }}
        >
          <div className="flex items-center gap-2 py-2 px-4">
            <span className="text-pink-400 text-xs shrink-0">💭</span>
            <div className="overflow-hidden">
              <motion.p
                className="text-pink-300/80 text-xs font-medium whitespace-nowrap"
                animate={{ x: ["-0%", "-100%"] }}
                transition={{
                  duration: 12,
                  repeat: Number.POSITIVE_INFINITY,
                  ease: "linear",
                }}
              >
                {profile.thoughts} &nbsp;&nbsp;&nbsp; ✦ &nbsp;&nbsp;&nbsp;{" "}
                {profile.thoughts}
              </motion.p>
            </div>
          </div>
        </div>
      )}

      {/* Image Carousel */}
      <div className="relative w-full" style={{ aspectRatio: "4/5" }}>
        {carouselImages.length > 0 ? (
          <AnimatePresence mode="wait">
            <motion.img
              key={carouselIdx}
              src={carouselImages[carouselIdx]}
              alt={profile.displayName}
              className="absolute inset-0 w-full h-full object-cover"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
            />
          </AnimatePresence>
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-pink-900/60 to-purple-900/60 flex items-center justify-center">
            <Avatar className="w-32 h-32">
              <AvatarImage src="" />
              <AvatarFallback className="bg-gradient-to-br from-pink-500 to-purple-600 text-white text-5xl font-bold">
                {profile.displayName[0]?.toUpperCase()}
              </AvatarFallback>
            </Avatar>
          </div>
        )}

        <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-[#0a0a0f] to-transparent" />

        {totalImages > 1 && (
          <>
            <button
              type="button"
              data-ocid="user_profile.pagination_prev"
              onClick={prevImage}
              className="absolute left-3 top-1/2 -translate-y-1/2 z-10 w-9 h-9 rounded-full bg-black/50 backdrop-blur-sm flex items-center justify-center"
            >
              <ChevronLeft className="w-5 h-5 text-white" />
            </button>
            <button
              type="button"
              data-ocid="user_profile.pagination_next"
              onClick={nextImage}
              className="absolute right-3 top-1/2 -translate-y-1/2 z-10 w-9 h-9 rounded-full bg-black/50 backdrop-blur-sm flex items-center justify-center"
            >
              <ChevronRight className="w-5 h-5 text-white" />
            </button>
          </>
        )}

        {totalImages > 1 && (
          <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-1.5 z-10">
            {carouselImages.map((url, i) => (
              <button
                key={url}
                type="button"
                onClick={() => setCarouselIdx(i)}
                className={`rounded-full transition-all ${
                  i === carouselIdx
                    ? "w-5 h-1.5 bg-white"
                    : "w-1.5 h-1.5 bg-white/40"
                }`}
              />
            ))}
          </div>
        )}
      </div>

      {/* Profile content */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="px-4 -mt-4 relative z-10"
      >
        <div className="flex items-center gap-2 flex-wrap">
          <h2 className="text-2xl font-bold text-white">
            {profile.displayName}
          </h2>
          {isPremium && (
            <span
              className="flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold"
              style={{
                background: "linear-gradient(135deg, #78350f, #d97706)",
                color: "#fef3c7",
                boxShadow: "0 0 8px rgba(217,119,6,0.4)",
              }}
            >
              <Crown className="w-3 h-3" />
              Premium
            </span>
          )}
        </div>
        <ProfileBadges
          principalStr={principal.toString()}
          className="mt-1.5 mb-1"
        />
        {profile.location && (
          <p className="text-white/50 text-sm mt-0.5">📍 {profile.location}</p>
        )}
        {profile.bio && (
          <p className="text-white/70 text-sm mt-2 leading-relaxed">
            {profile.bio}
          </p>
        )}

        {/* Stats */}
        <div className="flex gap-0 mt-4 border border-white/10 rounded-2xl overflow-hidden">
          {[
            { label: "Posts", value: posts?.length ?? 0, onClick: undefined },
            {
              label: "Followers",
              value: followers?.length ?? 0,
              onClick: () => setFollowSheet("followers"),
            },
            {
              label: "Following",
              value: following?.length ?? 0,
              onClick: () => setFollowSheet("following"),
            },
          ].map(({ label, value, onClick }, i) => (
            <button
              key={label}
              type="button"
              onClick={onClick}
              disabled={!onClick}
              data-ocid={
                onClick
                  ? `user_profile.${label.toLowerCase()}_button`
                  : undefined
              }
              className={`flex-1 flex flex-col items-center py-3 ${
                i < 2 ? "border-r border-white/10" : ""
              } ${onClick ? "active:bg-white/5 transition-colors" : ""}`}
            >
              <span className="text-white font-bold text-lg">{value}</span>
              <span className="text-white/40 text-xs">{label}</span>
            </button>
          ))}
        </div>

        {/* Follow button */}
        {!isMe && (
          <Button
            data-ocid="user_profile.toggle"
            onClick={handleFollow}
            disabled={followMutation.isPending}
            className={`w-full h-11 mt-3 ${
              isFollowing
                ? "bg-muted text-foreground hover:bg-muted/80 border border-border"
                : "bg-gradient-to-r from-primary to-secondary text-white border-0"
            }`}
          >
            {followMutation.isPending ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : isFollowing ? (
              <>
                <UserCheck className="mr-2 w-4 h-4" />
                Following
              </>
            ) : (
              <>
                <UserPlus className="mr-2 w-4 h-4" />
                Follow
              </>
            )}
          </Button>
        )}

        {/* Action buttons */}
        {!isMe && (
          <div className="grid grid-cols-4 gap-2 mt-3">
            <button
              type="button"
              data-ocid="user_profile.secondary_button"
              onClick={() => onMessage?.()}
              className="flex flex-col items-center gap-1.5 bg-gradient-to-br from-purple-600 to-violet-700 rounded-xl py-3 px-1"
            >
              <MessageCircle className="w-5 h-5 text-white" />
              <span className="text-white text-[10px] font-semibold">
                Message
              </span>
            </button>
            <button
              type="button"
              data-ocid="user_profile.cancel_button"
              onClick={() => handleCallClick("voice")}
              className="flex flex-col items-center gap-1.5 bg-white/8 border border-white/10 rounded-xl py-3 px-1"
            >
              <Phone className="w-5 h-5 text-green-400" />
              <span className="text-white/70 text-[10px] font-semibold">
                Voice
              </span>
            </button>
            <button
              type="button"
              data-ocid="user_profile.edit_button"
              onClick={() => handleCallClick("video")}
              className="flex flex-col items-center gap-1.5 bg-white/8 border border-white/10 rounded-xl py-3 px-1"
            >
              <Video className="w-5 h-5 text-blue-400" />
              <span className="text-white/70 text-[10px] font-semibold">
                Video
              </span>
            </button>
            <button
              type="button"
              data-ocid="user_profile.save_button"
              onClick={() => setGiftOpen(true)}
              className="flex flex-col items-center gap-1.5 bg-gradient-to-br from-orange-500 to-red-600 rounded-xl py-3 px-1"
            >
              <Gift className="w-5 h-5 text-white" />
              <span className="text-white text-[10px] font-semibold">Gift</span>
            </button>
          </div>
        )}

        {/* Star & Emoji Reactions */}
        {!isMe && (
          <div className="mt-3 flex flex-col gap-2">
            <div className="flex gap-2">
              <button
                type="button"
                data-ocid="user_profile.primary_button"
                onClick={handleStar}
                disabled={starUser.isPending}
                className={`flex-1 flex items-center justify-center gap-1.5 h-10 rounded-full text-sm font-semibold transition-all active:scale-95 ${
                  starredAnim
                    ? "bg-yellow-500/30 text-yellow-300 scale-105"
                    : "bg-yellow-500/15 border border-yellow-500/30 text-yellow-400"
                }`}
              >
                {starredAnim ? "⭐ Starred!" : "⭐ Star"}
              </button>
              <button
                type="button"
                data-ocid="user_profile.toggle"
                onClick={handleSpecialThanks}
                className={`flex-1 flex items-center justify-center gap-1.5 h-10 rounded-full text-sm font-semibold transition-all active:scale-95 ${
                  thanksAnim
                    ? "bg-pink-500/30 text-pink-300 scale-105"
                    : "bg-pink-500/15 border border-pink-500/30 text-pink-400"
                }`}
              >
                {thanksAnim ? "🙏 Sent!" : "🙏 Special Thanks"}
              </button>
            </div>

            <div className="flex items-center gap-2 bg-white/5 rounded-2xl px-4 py-2.5 border border-white/5">
              <span className="text-white/30 text-xs shrink-0">React:</span>
              {["😍", "💖", "🙏", "✨", "👑"].map((emoji) => (
                <button
                  key={emoji}
                  type="button"
                  onClick={() => handleEmojiReaction(emoji)}
                  className={`text-xl transition-all active:scale-125 ${
                    sentEmoji === emoji ? "scale-125" : ""
                  }`}
                >
                  {emoji}
                </button>
              ))}
              <AnimatePresence>
                {sentEmoji && (
                  <motion.span
                    key={sentEmoji}
                    initial={{ opacity: 0, y: 0, scale: 0.5 }}
                    animate={{ opacity: 1, y: -20, scale: 1.5 }}
                    exit={{ opacity: 0 }}
                    className="absolute text-2xl pointer-events-none"
                  >
                    {sentEmoji}
                  </motion.span>
                )}
              </AnimatePresence>
            </div>
          </div>
        )}

        {/* Matrimonial Info Fields */}
        <MatrimonialFields profile={profile} />
      </motion.div>

      {/* Posts grid */}
      <div className="border-t border-white/5 mt-4">
        <div className="flex items-center gap-2 px-4 py-2">
          <Grid className="w-4 h-4 text-muted-foreground" />
          <span className="text-sm font-medium text-white/60">Posts</span>
        </div>
        {posts && posts.length > 0 ? (
          <div className="grid grid-cols-3 gap-0.5">
            {posts.map((post, i) => (
              <button
                key={post.id.toString()}
                type="button"
                data-ocid={`user_profile.item.${i + 1}`}
                onClick={() => setLightboxIdx(i)}
                className="aspect-square bg-muted overflow-hidden"
              >
                {post.image ? (
                  <img
                    src={post.image.getDirectURL()}
                    alt="Post"
                    className="w-full h-full object-cover"
                    loading="lazy"
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center p-2">
                    <p className="text-xs text-center line-clamp-3 text-foreground/80">
                      {post.content}
                    </p>
                  </div>
                )}
              </button>
            ))}
          </div>
        ) : (
          <div
            data-ocid="user_profile.empty_state"
            className="flex flex-col items-center justify-center py-10 gap-2"
          >
            <Grid className="w-8 h-8 text-muted-foreground" />
            <p className="text-sm text-muted-foreground">No posts yet</p>
          </div>
        )}
      </div>

      {/* Lightbox */}
      <AnimatePresence>
        {lightboxIdx !== null && posts && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black flex items-center justify-center"
          >
            <button
              type="button"
              onClick={() => setLightboxIdx(null)}
              className="absolute top-4 right-4 w-10 h-10 rounded-full bg-white/10 flex items-center justify-center z-10"
            >
              <X className="w-5 h-5 text-white" />
            </button>
            {lightboxIdx > 0 && (
              <button
                type="button"
                onClick={() => setLightboxIdx((i) => (i ?? 0) - 1)}
                className="absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/10 flex items-center justify-center z-10"
              >
                <ChevronLeft className="w-5 h-5 text-white" />
              </button>
            )}
            {lightboxIdx < posts.length - 1 && (
              <button
                type="button"
                onClick={() => setLightboxIdx((i) => (i ?? 0) + 1)}
                className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/10 flex items-center justify-center z-10"
              >
                <ChevronRight className="w-5 h-5 text-white" />
              </button>
            )}
            {posts[lightboxIdx]?.image && (
              <img
                src={posts[lightboxIdx].image!.getDirectURL()}
                alt="Post"
                className="max-w-full max-h-full object-contain"
              />
            )}
            {!posts[lightboxIdx]?.image && (
              <p className="text-white text-center px-8">
                {posts[lightboxIdx]?.content}
              </p>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {outgoingCall && (
          <OutgoingCallOverlay
            profile={profile}
            mode={outgoingCall}
            onCancel={() => setOutgoingCall(null)}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {incomingCall && (
          <IncomingCallOverlay
            profile={profile}
            mode={incomingCall}
            onAccept={() => {
              setIncomingCall(null);
              setCallMode(incomingCall);
            }}
            onReject={() => setIncomingCall(null)}
          />
        )}
      </AnimatePresence>

      <GiftSheet
        open={giftOpen}
        onClose={() => setGiftOpen(false)}
        recipientName={profile.displayName}
      />

      <AnimatePresence>
        {followSheet && (
          <FollowListSheet
            type={followSheet}
            principals={
              followSheet === "followers"
                ? (followers ?? [])
                : (following ?? [])
            }
            onClose={() => setFollowSheet(null)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

// ── Hobby floating bubbles ─────────────────────────────────────────────────
function FloatingHobbyBubbles({ hobbies }: { hobbies: string }) {
  const items = hobbies
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean)
    .slice(0, 8);

  if (items.length === 0) return null;

  const colors = [
    ["#10b981", "#06b6d4"],
    ["#ec4899", "#a855f7"],
    ["#f59e0b", "#ef4444"],
    ["#6366f1", "#8b5cf6"],
    ["#14b8a6", "#06b6d4"],
    ["#f97316", "#ec4899"],
    ["#84cc16", "#22c55e"],
    ["#a855f7", "#ec4899"],
  ];

  return (
    <div>
      <p className="text-white/40 text-xs mb-3">🎨 Hobbies</p>
      <div className="flex flex-wrap gap-2">
        {items.map((item, i) => (
          <motion.span
            key={item}
            className="px-3 py-1.5 rounded-full text-xs font-medium text-white shadow-sm cursor-default"
            style={{
              background: `linear-gradient(135deg, ${colors[i % colors.length][0]}, ${colors[i % colors.length][1]})`,
            }}
            animate={{
              y: [0, -4, 0],
            }}
            transition={{
              duration: 2.5 + ((i * 0.3) % 1.5),
              repeat: Number.POSITIVE_INFINITY,
              ease: "easeInOut",
              delay: (i * 0.4) % 2,
            }}
          >
            {item}
          </motion.span>
        ))}
      </div>
    </div>
  );
}

function MatrimonialFields({
  profile,
}: { profile: import("../backend").Profile }) {
  const sections = [
    {
      label: "Interests",
      icon: "✨",
      value: profile.interests,
      gradient: "from-pink-500 to-purple-600",
    },
    {
      label: "Favourite Movies",
      icon: "🎬",
      value: profile.favMovies,
      gradient: "from-orange-500 to-red-600",
    },
    {
      label: "Favourite Songs",
      icon: "🎵",
      value: profile.favSongs,
      gradient: "from-yellow-500 to-orange-500",
    },
    {
      label: "Education",
      icon: "🎓",
      value: profile.education,
      gradient: "from-blue-500 to-cyan-500",
    },
    {
      label: "Thoughts",
      icon: "💭",
      value: profile.thoughts,
      gradient: "from-violet-500 to-purple-600",
    },
  ].filter((s) => s.value?.trim());

  const hasHobbies = !!profile.hobbies?.trim();

  if (sections.length === 0 && !hasHobbies) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 0.2 }}
      className="mt-4 flex flex-col gap-4"
    >
      <h3 className="text-white/50 text-xs font-semibold uppercase tracking-widest">
        About
      </h3>

      {/* Floating hobby bubbles */}
      {hasHobbies && <FloatingHobbyBubbles hobbies={profile.hobbies} />}

      {sections.map((section) => {
        const items = section.value
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean);
        return (
          <motion.div
            key={section.label}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
          >
            <p className="text-white/40 text-xs mb-2">
              {section.icon} {section.label}
            </p>
            <div className="flex flex-wrap gap-2">
              {items.map((item) => (
                <span
                  key={item}
                  className={`bg-gradient-to-r ${section.gradient} text-white text-xs font-medium px-3 py-1.5 rounded-full shadow-sm`}
                >
                  {item}
                </span>
              ))}
            </div>
          </motion.div>
        );
      })}
    </motion.div>
  );
}
