import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import type { Principal } from "@icp-sdk/core/principal";
import { Bell, Sparkles } from "lucide-react";
import { useState } from "react";
import type { Profile, Story } from "../../backend";
import { useInternetIdentity } from "../../hooks/useInternetIdentity";
import {
  useGetAllPosts,
  useGetAllProfiles,
  useGetStories,
  useGetUnreadNotificationCount,
} from "../../hooks/useQueries";
import NotificationsPanel from "../NotificationsPanel";
import PostCard from "../PostCard";
import StoryViewer from "../StoryViewer";

interface Props {
  onUserClick: (p: Principal) => void;
}

function StoryBubble({
  profile,
  onClick,
}: {
  profile: Profile | undefined;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      data-ocid="stories.item.1"
      onClick={onClick}
      className="flex flex-col items-center gap-1.5 shrink-0"
    >
      <div className="story-ring w-14 h-14 rounded-full">
        <div className="w-full h-full bg-card rounded-full p-0.5">
          <Avatar className="w-full h-full">
            {profile?.avatar && (
              <AvatarImage src={profile.avatar.getDirectURL()} />
            )}
            <AvatarFallback className="bg-muted text-sm">
              {profile?.displayName?.[0]?.toUpperCase() || "?"}
            </AvatarFallback>
          </Avatar>
        </div>
      </div>
      <span className="text-[10px] text-muted-foreground max-w-[56px] truncate">
        {profile?.displayName || "User"}
      </span>
    </button>
  );
}

export default function HomeTab({ onUserClick }: Props) {
  const { identity } = useInternetIdentity();
  const { data: posts, isLoading: postsLoading } = useGetAllPosts();
  const { data: profiles } = useGetAllProfiles();
  const { data: unreadCount } = useGetUnreadNotificationCount();
  const [viewingStory, setViewingStory] = useState<{
    stories: Story[];
    author: Principal;
  } | null>(null);
  const [notifOpen, setNotifOpen] = useState(false);

  const profilesMap = new Map<string, Profile>();
  if (profiles) {
    for (const [p, prof] of profiles) {
      profilesMap.set(p.toString(), prof);
    }
  }

  const myPrincipal = identity?.getPrincipal() ?? null;
  const hasUnread = unreadCount !== undefined && unreadCount > 0n;

  return (
    <div data-ocid="home.page" className="flex flex-col h-full">
      {/* Header with bell */}
      <div className="flex items-center justify-between px-4 pt-4 pb-2 shrink-0">
        <h1 className="text-xl font-bold font-display bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
          Social Fusion
        </h1>
        <button
          type="button"
          data-ocid="home.open_modal_button"
          onClick={() => setNotifOpen(true)}
          className="relative w-9 h-9 rounded-full bg-muted flex items-center justify-center hover:bg-muted/80 transition-colors"
        >
          <Bell className="w-5 h-5" />
          {hasUnread && (
            <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-destructive" />
          )}
        </button>
      </div>

      {/* Stories row */}
      <div className="shrink-0 px-3 py-2 border-b border-border">
        <div className="flex items-center gap-3 overflow-x-auto scrollbar-none pb-1">
          {profiles && profiles.length > 0 ? (
            profiles.map(([principal, profile]) => (
              <StoryBubbleWrapper
                key={principal.toString()}
                principal={principal}
                profile={profile}
                onView={(stories) =>
                  setViewingStory({ stories, author: principal })
                }
              />
            ))
          ) : (
            <div className="flex items-center gap-2 text-muted-foreground text-sm py-2">
              <Sparkles className="w-4 h-4" />
              <span>No stories yet</span>
            </div>
          )}
        </div>
      </div>

      {/* Feed */}
      <ScrollArea className="flex-1">
        <div className="flex flex-col gap-3 p-3 pb-20">
          {postsLoading ? (
            ["s1", "s2", "s3"].map((sk) => (
              <div
                key={sk}
                data-ocid="feed.loading_state"
                className="bg-card rounded-2xl p-3 flex flex-col gap-3"
              >
                <div className="flex items-center gap-3">
                  <Skeleton className="w-9 h-9 rounded-full" />
                  <div className="flex flex-col gap-1.5">
                    <Skeleton className="w-24 h-3" />
                    <Skeleton className="w-16 h-2" />
                  </div>
                </div>
                <Skeleton className="w-full h-48 rounded-xl" />
              </div>
            ))
          ) : posts && posts.length > 0 ? (
            posts.map((post, i) => (
              <div
                key={post.id.toString()}
                data-ocid={`feed.post.item.${i + 1}`}
              >
                <PostCard
                  post={post}
                  myPrincipal={myPrincipal}
                  profiles={profilesMap}
                  onUserClick={onUserClick}
                />
              </div>
            ))
          ) : (
            <div
              data-ocid="feed.empty_state"
              className="flex flex-col items-center justify-center py-16 text-center gap-3"
            >
              <div className="w-16 h-16 rounded-2xl bg-muted flex items-center justify-center">
                <Sparkles className="w-8 h-8 text-muted-foreground" />
              </div>
              <p className="text-muted-foreground">
                No posts yet. Be the first!
              </p>
            </div>
          )}
        </div>
      </ScrollArea>

      {/* Notifications panel */}
      <NotificationsPanel
        open={notifOpen}
        onClose={() => setNotifOpen(false)}
      />

      {/* Story viewer */}
      {viewingStory && (
        <StoryViewer
          stories={viewingStory.stories}
          author={viewingStory.author}
          profile={profilesMap.get(viewingStory.author.toString())}
          onClose={() => setViewingStory(null)}
        />
      )}
    </div>
  );
}

function StoryBubbleWrapper({
  principal,
  profile,
  onView,
}: {
  principal: Principal;
  profile: Profile;
  onView: (stories: Story[]) => void;
}) {
  const { data: stories } = useGetStories(principal);
  if (!stories || stories.length === 0) return null;
  return <StoryBubble profile={profile} onClick={() => onView(stories)} />;
}
