import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import type { Principal } from "@icp-sdk/core/principal";
import { ArrowLeft, Grid, Loader2, UserCheck, UserPlus } from "lucide-react";
import { toast } from "sonner";
import { useInternetIdentity } from "../hooks/useInternetIdentity";
import {
  useFollow,
  useGetFollowers,
  useGetFollowing,
  useGetPostsByUser,
  useGetUserProfile,
} from "../hooks/useQueries";

interface Props {
  principal: Principal;
  onBack: () => void;
}

export default function UserProfileView({ principal, onBack }: Props) {
  const { identity } = useInternetIdentity();
  const myPrincipal = identity?.getPrincipal();

  const { data: profile, isLoading } = useGetUserProfile(principal);
  const { data: posts } = useGetPostsByUser(principal);
  const { data: followers } = useGetFollowers(principal);
  const { data: following } = useGetFollowing(principal);
  const followMutation = useFollow();

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

  if (isLoading) {
    return (
      <div
        data-ocid="user_profile.loading_state"
        className="flex flex-col gap-4 p-4"
      >
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
    <div data-ocid="user_profile.page" className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center gap-3 px-3 py-3 border-b border-border shrink-0">
        <button
          type="button"
          data-ocid="user_profile.close_button"
          onClick={onBack}
          className="w-8 h-8 rounded-full bg-muted flex items-center justify-center"
        >
          <ArrowLeft className="w-4 h-4" />
        </button>
        <p className="font-semibold">{profile.displayName}</p>
      </div>

      <div className="flex-1 overflow-y-auto pb-20">
        <div className="p-4 flex flex-col gap-4">
          <div className="flex items-center gap-4">
            <Avatar className="w-20 h-20">
              {profile.avatar && (
                <AvatarImage src={profile.avatar.getDirectURL()} />
              )}
              <AvatarFallback className="bg-muted text-2xl">
                {profile.displayName[0]?.toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div className="flex flex-col gap-1">
              <p className="font-bold text-lg">{profile.displayName}</p>
              {profile.bio && (
                <p className="text-sm text-muted-foreground">{profile.bio}</p>
              )}
            </div>
          </div>

          {/* Stats */}
          <div className="flex gap-3">
            {[
              { label: "Posts", value: posts?.length ?? 0 },
              { label: "Followers", value: followers?.length ?? 0 },
              { label: "Following", value: following?.length ?? 0 },
            ].map(({ label, value }) => (
              <div
                key={label}
                className="flex flex-col items-center flex-1 bg-muted rounded-xl p-2.5"
              >
                <span className="font-bold text-lg">{value}</span>
                <span className="text-xs text-muted-foreground">{label}</span>
              </div>
            ))}
          </div>

          {/* Follow button */}
          {!isMe && (
            <Button
              data-ocid="user_profile.toggle"
              onClick={handleFollow}
              disabled={followMutation.isPending}
              className={`h-10 ${
                isFollowing
                  ? "bg-muted text-foreground hover:bg-muted/80 border border-border"
                  : "bg-gradient-to-r from-primary to-secondary text-white"
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
        </div>

        {/* Posts */}
        <div className="border-t border-border">
          <div className="flex items-center gap-2 px-4 py-2">
            <Grid className="w-4 h-4 text-muted-foreground" />
            <span className="text-sm font-medium">Posts</span>
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
    </div>
  );
}
