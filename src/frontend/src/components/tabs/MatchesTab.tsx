import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { Principal } from "@icp-sdk/core/principal";
import { Heart, MessageCircle, Sparkles } from "lucide-react";
import { usePrivacy } from "../../contexts/PrivacyContext";
import { useGetMatches, useGetUserProfile } from "../../hooks/useQueries";
import { ConnectionScore } from "../features/DiscoverFeatures";
import { ActivityFeedSection } from "../features/MatchFeatures";
import { BookmarksSection } from "../features/MatchFeatures";
import { CoupleGoalsFeed } from "../features/MatchFeatures";
import { EventInvitesSection } from "../features/MatchFeatures";

interface Props {
  onUserClick: (p: Principal) => void;
  onMessageUser: () => void;
}

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
      <div className="px-4 pt-6 pb-2 shrink-0">
        <h1 className="text-2xl font-bold font-display text-white">
          Your Matches
        </h1>
        <p className="text-white/40 text-sm mt-0.5">
          {count} mutual {count === 1 ? "match" : "matches"}
        </p>
      </div>

      <div className="flex-1 overflow-y-auto pb-20">
        <Tabs defaultValue="matches" className="w-full">
          <TabsList
            data-ocid="matches.tab"
            className="w-full bg-white/5 border-b border-white/5 rounded-none h-11 shrink-0"
          >
            <TabsTrigger
              value="matches"
              className="flex-1 gap-1 data-[state=active]:bg-transparent data-[state=active]:text-white data-[state=active]:border-b-2 data-[state=active]:border-pink-500 rounded-none text-white/40 text-xs"
            >
              <Heart className="w-3.5 h-3.5" /> Matches
            </TabsTrigger>
            <TabsTrigger
              value="events"
              className="flex-1 gap-1 data-[state=active]:bg-transparent data-[state=active]:text-white data-[state=active]:border-b-2 data-[state=active]:border-pink-500 rounded-none text-white/40 text-xs"
            >
              🎥 Events
            </TabsTrigger>
            <TabsTrigger
              value="couples"
              className="flex-1 gap-1 data-[state=active]:bg-transparent data-[state=active]:text-white data-[state=active]:border-b-2 data-[state=active]:border-pink-500 rounded-none text-white/40 text-xs"
            >
              💑 Couples
            </TabsTrigger>
            <TabsTrigger
              value="activity"
              className="flex-1 gap-1 data-[state=active]:bg-transparent data-[state=active]:text-white data-[state=active]:border-b-2 data-[state=active]:border-pink-500 rounded-none text-white/40 text-xs"
            >
              <Sparkles className="w-3.5 h-3.5" /> Activity
            </TabsTrigger>
            <TabsTrigger
              value="saved"
              className="flex-1 gap-1 data-[state=active]:bg-transparent data-[state=active]:text-white data-[state=active]:border-b-2 data-[state=active]:border-pink-500 rounded-none text-white/40 text-xs"
            >
              🔖 Saved
            </TabsTrigger>
          </TabsList>

          <TabsContent value="matches" className="mt-0">
            {isLoading ? (
              <div className="p-4 grid grid-cols-2 gap-3">
                {[1, 2, 3, 4].map((i) => (
                  <div
                    key={i}
                    data-ocid="matches.loading_state"
                    className="rounded-2xl overflow-hidden"
                  >
                    <Skeleton className="w-full h-48" />
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
                <div className="text-6xl">⭐</div>
                <p className="text-white/50 font-semibold text-lg">
                  No matches yet
                </p>
                <p className="text-white/30 text-sm">Keep exploring!</p>
              </div>
            )}
          </TabsContent>

          <TabsContent value="events" className="mt-0">
            <EventInvitesSection />
          </TabsContent>

          <TabsContent value="couples" className="mt-0">
            <CoupleGoalsFeed />
          </TabsContent>

          <TabsContent value="activity" className="mt-0">
            <ActivityFeedSection />
          </TabsContent>

          <TabsContent value="saved" className="mt-0">
            <BookmarksSection />
          </TabsContent>
        </Tabs>
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
  const score = Math.floor(50 + Math.random() * 50);

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
            <div className="w-full h-full flex items-center justify-center">
              <Avatar className="w-16 h-16">
                <AvatarFallback className="bg-gradient-to-br from-pink-500 to-purple-600 text-white font-bold text-xl">
                  {profile?.displayName?.[0]?.toUpperCase() || "?"}
                </AvatarFallback>
              </Avatar>
            </div>
          )}
          <div className="absolute bottom-0 left-0 right-0 p-2 bg-gradient-to-t from-black/80 to-transparent">
            <p className="text-white font-semibold text-sm truncate">
              {profile?.displayName || "Loading..."}
            </p>
          </div>
          {/* Connection score badge */}
          <div className="absolute top-2 right-2">
            <ConnectionScore score={score} />
          </div>
        </div>
      </button>
      <div className="p-2">
        <Button
          data-ocid={`matches.secondary_button.${index + 1}`}
          size="sm"
          onClick={onMessageUser}
          className="w-full h-8 text-xs bg-gradient-to-r from-pink-500/20 to-purple-600/20 hover:from-pink-500/30 hover:to-purple-600/30 text-pink-300 border border-pink-500/20 rounded-xl"
        >
          <MessageCircle className="w-3 h-3 mr-1" /> Message
        </Button>
      </div>
    </div>
  );
}
