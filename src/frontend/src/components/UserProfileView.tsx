import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import type { Principal } from "@icp-sdk/core/principal";
import {
  ArrowLeft,
  Gift,
  Grid,
  Loader2,
  MessageCircle,
  Phone,
  UserCheck,
  UserPlus,
  Video,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { useInternetIdentity } from "../hooks/useInternetIdentity";
import {
  useFollow,
  useGetFollowers,
  useGetFollowing,
  useGetPostsByUser,
  useGetUserProfile,
} from "../hooks/useQueries";
import CallScreen from "./CallScreen";
import GiftSheet from "./GiftSheet";

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

  const [callMode, setCallMode] = useState<"voice" | "video" | null>(null);
  const [giftOpen, setGiftOpen] = useState(false);

  const isMe = myPrincipal?.toString() === principal.toString();
  const isFollowing =
    followers?.some((f) => f.toString() === myPrincipal?.toString()) ?? false;

  const handleFollow = async () => {
    try {
      await followMutation.mutateAsync({
        user: principal,
        following: isFollowing,
      });
      toast.success(isFollowing ? "Unfollowed" : "Following!");
    } catch {
      toast.error("Action failed");
    }
  };

  if (callMode) {
    return (
      <CallScreen
        mode={callMode}
        otherProfile={profile!}
        onEnd={() => setCallMode(null)}
      />
    );
  }

  if (isLoading) {
    return (
      <div
        data-ocid="user_profile.loading_state"
        className="flex flex-col gap-4 p-4"
      >
        <Skeleton className="w-full h-36 rounded-2xl" />
        <Skeleton className="w-20 h-20 rounded-full" />
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
      className="flex flex-col h-full bg-[#0a0a0f]"
    >
      {/* Header */}
      <div className="flex items-center gap-3 px-3 py-3 border-b border-white/5 shrink-0 absolute top-0 left-0 right-0 z-10 bg-transparent">
        <button
          type="button"
          data-ocid="user_profile.close_button"
          onClick={onBack}
          className="w-8 h-8 rounded-full bg-black/40 backdrop-blur-sm flex items-center justify-center"
        >
          <ArrowLeft className="w-4 h-4 text-white" />
        </button>
        <p className="font-semibold text-white drop-shadow">
          {profile.displayName}
        </p>
      </div>

      <div className="flex-1 overflow-y-auto pb-20">
        {/* Cover photo */}
        <div
          className="relative h-40 shrink-0"
          style={{
            background:
              "linear-gradient(135deg, #2d0050 0%, #0a0a0f 50%, #3d0000 100%)",
          }}
        >
          <div
            className="absolute inset-0 opacity-40"
            style={{
              backgroundImage:
                "radial-gradient(circle at 30% 40%, #ff0080 0%, transparent 50%), radial-gradient(circle at 70% 60%, #7c3aed 0%, transparent 50%)",
            }}
          />
        </div>

        <div className="px-4 -mt-12 relative">
          {/* Avatar */}
          <Avatar className="w-24 h-24 ring-4 ring-[#0a0a0f] shadow-xl">
            {profile.avatar && (
              <AvatarImage src={profile.avatar.getDirectURL()} />
            )}
            <AvatarFallback className="bg-gradient-to-br from-pink-500 to-purple-600 text-white text-3xl font-bold">
              {profile.displayName[0]?.toUpperCase()}
            </AvatarFallback>
          </Avatar>

          <div className="mt-3">
            <h2 className="text-xl font-bold text-white">
              {profile.displayName}
            </h2>
            {profile.location && (
              <p className="text-white/40 text-sm mt-0.5">
                📍 {profile.location}
              </p>
            )}
            {profile.bio && (
              <p className="text-white/60 text-sm mt-1">{profile.bio}</p>
            )}
          </div>

          {/* Stats */}
          <div className="flex gap-0 mt-4 border border-white/10 rounded-2xl overflow-hidden">
            {[
              { label: "Posts", value: posts?.length ?? 0 },
              { label: "Followers", value: followers?.length ?? 0 },
              { label: "Following", value: following?.length ?? 0 },
            ].map(({ label, value }, i) => (
              <div
                key={label}
                className={`flex-1 flex flex-col items-center py-3 ${
                  i < 2 ? "border-r border-white/10" : ""
                }`}
              >
                <span className="text-white font-bold text-lg">{value}</span>
                <span className="text-white/40 text-xs">{label}</span>
              </div>
            ))}
          </div>

          {/* Follow button */}
          {!isMe && (
            <Button
              data-ocid="user_profile.toggle"
              onClick={handleFollow}
              disabled={followMutation.isPending}
              className={`w-full h-10 mt-3 ${
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

          {/* Action buttons row */}
          {!isMe && (
            <div className="grid grid-cols-4 gap-2 mt-3">
              <button
                type="button"
                data-ocid="user_profile.secondary_button"
                onClick={() => {
                  if (onMessage) onMessage();
                  else toast.success("Opening chat...");
                }}
                className="flex flex-col items-center gap-1.5 bg-gradient-to-br from-purple-600 to-violet-700 rounded-xl py-2.5 px-1"
              >
                <MessageCircle className="w-5 h-5 text-white" />
                <span className="text-white text-[10px] font-semibold">
                  Message
                </span>
              </button>
              <button
                type="button"
                data-ocid="user_profile.cancel_button"
                onClick={() => setCallMode("voice")}
                className="flex flex-col items-center gap-1.5 bg-white/8 border border-white/10 rounded-xl py-2.5 px-1"
              >
                <Phone className="w-5 h-5 text-white" />
                <span className="text-white/70 text-[10px] font-semibold">
                  Voice
                </span>
              </button>
              <button
                type="button"
                data-ocid="user_profile.edit_button"
                onClick={() => setCallMode("video")}
                className="flex flex-col items-center gap-1.5 bg-white/8 border border-white/10 rounded-xl py-2.5 px-1"
              >
                <Video className="w-5 h-5 text-white" />
                <span className="text-white/70 text-[10px] font-semibold">
                  Video
                </span>
              </button>
              <button
                type="button"
                data-ocid="user_profile.save_button"
                onClick={() => setGiftOpen(true)}
                className="flex flex-col items-center gap-1.5 bg-gradient-to-br from-orange-500 to-red-600 rounded-xl py-2.5 px-1"
              >
                <Gift className="w-5 h-5 text-white" />
                <span className="text-white text-[10px] font-semibold">
                  Gift
                </span>
              </button>
            </div>
          )}
        </div>

        {/* Posts */}
        <div className="border-t border-white/5 mt-4">
          <div className="flex items-center gap-2 px-4 py-2">
            <Grid className="w-4 h-4 text-muted-foreground" />
            <span className="text-sm font-medium text-white/60">Posts</span>
          </div>
          {posts && posts.length > 0 ? (
            <div className="grid grid-cols-3 gap-0.5">
              {posts.map((post, i) => (
                <div
                  key={post.id.toString()}
                  data-ocid={`user_profile.item.${i + 1}`}
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
                </div>
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
      </div>

      <GiftSheet
        open={giftOpen}
        onClose={() => setGiftOpen(false)}
        recipientName={profile.displayName}
      />
    </div>
  );
}
