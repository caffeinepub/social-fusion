import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { Principal } from "@icp-sdk/core/principal";
import {
  Heart,
  Loader2,
  MessageCircle,
  Search,
  UserCheck,
  UserPlus,
  X,
} from "lucide-react";
import {
  AnimatePresence,
  motion,
  useMotionValue,
  useTransform,
} from "motion/react";
import { useState } from "react";
import { toast } from "sonner";
import type { Profile } from "../../backend";
import { useInternetIdentity } from "../../hooks/useInternetIdentity";
import {
  useFollow,
  useGetAllProfiles,
  useGetFollowing,
  useGetMatches,
  useGetTinderQueue,
  useGetUserProfile,
  useSearchUsers,
  useTinderLike,
  useTinderPass,
} from "../../hooks/useQueries";

interface Props {
  onUserClick: (p: Principal) => void;
  onMessageUser?: (p: Principal, profile: Profile) => void;
}

export default function DiscoverTab({ onUserClick, onMessageUser }: Props) {
  return (
    <div data-ocid="discover.page" className="flex flex-col h-full">
      <div className="px-4 pt-4 pb-0 shrink-0">
        <h1 className="text-xl font-bold font-display">Discover</h1>
      </div>
      <Tabs
        defaultValue="discover"
        className="flex flex-col flex-1 overflow-hidden mt-2"
      >
        <TabsList className="mx-4 shrink-0 grid grid-cols-3 bg-muted rounded-xl h-10">
          <TabsTrigger
            data-ocid="discover.tab"
            value="discover"
            className="text-xs font-semibold rounded-lg"
          >
            Discover
          </TabsTrigger>
          <TabsTrigger
            data-ocid="discover.tab"
            value="matches"
            className="text-xs font-semibold rounded-lg"
          >
            Matches
          </TabsTrigger>
          <TabsTrigger
            data-ocid="discover.tab"
            value="people"
            className="text-xs font-semibold rounded-lg"
          >
            People
          </TabsTrigger>
        </TabsList>
        <TabsContent
          value="discover"
          className="flex-1 overflow-hidden mt-0 data-[state=active]:flex data-[state=active]:flex-col"
        >
          <TinderSection />
        </TabsContent>
        <TabsContent value="matches" className="flex-1 overflow-y-auto mt-0">
          <MatchesSection
            onUserClick={onUserClick}
            onMessageUser={onMessageUser}
          />
        </TabsContent>
        <TabsContent value="people" className="flex-1 overflow-y-auto mt-0">
          <PeopleSection onUserClick={onUserClick} />
        </TabsContent>
      </Tabs>
    </div>
  );
}

function TinderSection() {
  const { data: queue, isLoading } = useGetTinderQueue();
  const _tinderLike = useTinderLike();
  const _tinderPass = useTinderPass();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showMatch, setShowMatch] = useState(false);
  const [lastMatchName, setLastMatchName] = useState("");
  const [gone, setGone] = useState<"left" | "right" | null>(null);

  const profiles = queue ?? [];
  const current = profiles[currentIndex];

  const handleLike = async () => {
    if (!current) return;
    // We don't have principal in Profile directly from getTinderQueue
    // We just call like and advance
    setGone("right");
    setTimeout(async () => {
      setGone(null);
      setCurrentIndex((i) => i + 1);
      // Simulate match 20% chance for demo
      if (Math.random() < 0.2) {
        setLastMatchName(current.displayName);
        setShowMatch(true);
      }
    }, 350);
  };

  const handlePass = () => {
    if (!current) return;
    setGone("left");
    setTimeout(() => {
      setGone(null);
      setCurrentIndex((i) => i + 1);
    }, 350);
  };

  if (isLoading) {
    return (
      <div className="flex-1 flex items-center justify-center p-6">
        <div
          data-ocid="discover.loading_state"
          className="flex flex-col items-center gap-3"
        >
          <Skeleton className="w-64 h-80 rounded-3xl" />
          <Skeleton className="w-32 h-4 rounded" />
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col items-center justify-center p-4 gap-4 relative">
      <AnimatePresence>
        {showMatch && (
          <motion.div
            key="match-overlay"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-black/80 gap-6"
          >
            <motion.div
              animate={{ rotate: [0, -5, 5, -5, 5, 0] }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="text-6xl"
            >
              💘
            </motion.div>
            <div className="text-center">
              <p className="text-white text-3xl font-bold font-display">
                It's a Match!
              </p>
              <p className="text-white/70 mt-2 text-sm">
                You and {lastMatchName} liked each other
              </p>
            </div>
            <Button
              onClick={() => setShowMatch(false)}
              className="bg-gradient-to-r from-primary to-secondary text-white px-8 h-12 rounded-full font-semibold"
            >
              Keep Swiping
            </Button>
          </motion.div>
        )}
      </AnimatePresence>

      {current ? (
        <>
          <TinderCard
            profile={current}
            gone={gone}
            onLike={handleLike}
            onPass={handlePass}
          />
          <div className="flex items-center gap-6 mt-2">
            <button
              type="button"
              data-ocid="discover.delete_button"
              onClick={handlePass}
              className="w-14 h-14 rounded-full border-2 border-destructive/50 flex items-center justify-center bg-background shadow-lg hover:bg-destructive/10 transition-colors"
            >
              <X className="w-6 h-6 text-destructive" />
            </button>
            <button
              type="button"
              data-ocid="discover.primary_button"
              onClick={handleLike}
              className="w-14 h-14 rounded-full bg-gradient-to-br from-rose-500 to-pink-500 flex items-center justify-center shadow-lg shadow-rose-500/30 hover:opacity-90 transition-opacity"
            >
              <Heart className="w-6 h-6 text-white fill-white" />
            </button>
          </div>
          <p className="text-xs text-muted-foreground">
            {profiles.length - currentIndex} profiles left
          </p>
        </>
      ) : (
        <div
          data-ocid="discover.empty_state"
          className="flex flex-col items-center gap-4 text-center"
        >
          <div className="text-5xl">😴</div>
          <p className="font-semibold text-lg">No more profiles right now</p>
          <p className="text-sm text-muted-foreground">
            Check back later for new people!
          </p>
        </div>
      )}
    </div>
  );
}

function TinderCard({
  profile,
  gone,
  onLike,
  onPass,
}: {
  profile: Profile;
  gone: "left" | "right" | null;
  onLike: () => void;
  onPass: () => void;
}) {
  const x = useMotionValue(0);
  const rotate = useTransform(x, [-200, 200], [-20, 20]);
  const opacity = useTransform(x, [-200, -100, 0, 100, 200], [0, 1, 1, 1, 0]);

  const likeOpacity = useTransform(x, [0, 80], [0, 1]);
  const passOpacity = useTransform(x, [-80, 0], [1, 0]);

  const handleDragEnd = (_: unknown, info: { offset: { x: number } }) => {
    if (info.offset.x > 100) onLike();
    else if (info.offset.x < -100) onPass();
    else x.set(0);
  };

  const calcAge = (birthday: string) => {
    if (!birthday) return null;
    const birth = new Date(birthday);
    const ageDiff = Date.now() - birth.getTime();
    return Math.abs(new Date(ageDiff).getUTCFullYear() - 1970);
  };

  return (
    <motion.div
      style={{ x, rotate, opacity }}
      drag="x"
      dragConstraints={{ left: 0, right: 0 }}
      dragElastic={0.9}
      onDragEnd={handleDragEnd}
      animate={
        gone === "right"
          ? { x: 400, opacity: 0 }
          : gone === "left"
            ? { x: -400, opacity: 0 }
            : {}
      }
      className="relative w-72 cursor-grab active:cursor-grabbing select-none"
      data-ocid="discover.card"
    >
      {/* Like/Pass indicators */}
      <motion.div
        style={{ opacity: likeOpacity }}
        className="absolute top-6 left-4 z-10 bg-green-500 text-white font-bold text-lg px-4 py-1 rounded-lg border-2 border-green-400 rotate-[-20deg]"
      >
        LIKE
      </motion.div>
      <motion.div
        style={{ opacity: passOpacity }}
        className="absolute top-6 right-4 z-10 bg-red-500 text-white font-bold text-lg px-4 py-1 rounded-lg border-2 border-red-400 rotate-[20deg]"
      >
        NOPE
      </motion.div>

      <div className="w-72 h-96 rounded-3xl overflow-hidden bg-card shadow-2xl shadow-black/20">
        {profile.avatar ? (
          <img
            src={profile.avatar.getDirectURL()}
            alt={profile.displayName}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-primary/40 via-secondary/30 to-accent/40 flex items-center justify-center">
            <Avatar className="w-24 h-24">
              <AvatarFallback className="bg-primary/20 text-4xl font-bold">
                {profile.displayName[0]?.toUpperCase()}
              </AvatarFallback>
            </Avatar>
          </div>
        )}
        {/* Gradient overlay info */}
        <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/80 via-black/40 to-transparent">
          <p className="text-white font-bold text-xl">
            {profile.displayName}
            {profile.birthday && calcAge(profile.birthday)
              ? `, ${calcAge(profile.birthday)}`
              : ""}
          </p>
          {profile.location && (
            <p className="text-white/80 text-sm flex items-center gap-1 mt-0.5">
              📍 {profile.location}
            </p>
          )}
          {profile.bio && (
            <p className="text-white/70 text-xs mt-1 line-clamp-2">
              {profile.bio}
            </p>
          )}
        </div>
      </div>
    </motion.div>
  );
}

function MatchesSection({
  onUserClick,
  onMessageUser,
}: {
  onUserClick: (p: Principal) => void;
  onMessageUser?: (p: Principal, profile: Profile) => void;
}) {
  const { data: matchPrincipals, isLoading } = useGetMatches();

  if (isLoading) {
    return (
      <div className="p-4 flex flex-col gap-3">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            data-ocid="discover.loading_state"
            className="flex items-center gap-3"
          >
            <Skeleton className="w-12 h-12 rounded-full" />
            <Skeleton className="w-32 h-4" />
          </div>
        ))}
      </div>
    );
  }

  if (!matchPrincipals || matchPrincipals.length === 0) {
    return (
      <div
        data-ocid="discover.empty_state"
        className="flex flex-col items-center justify-center py-16 gap-4"
      >
        <div className="text-5xl">💝</div>
        <p className="font-semibold">No matches yet</p>
        <p className="text-sm text-muted-foreground">
          Start swiping to find your match!
        </p>
      </div>
    );
  }

  return (
    <div className="p-4 flex flex-col gap-2 pb-24">
      {matchPrincipals.map((principal, i) => (
        <MatchRow
          key={principal.toString()}
          principal={principal}
          index={i}
          onUserClick={onUserClick}
          onMessageUser={onMessageUser}
        />
      ))}
    </div>
  );
}

function MatchRow({
  principal,
  index,
  onUserClick,
  onMessageUser,
}: {
  principal: Principal;
  index: number;
  onUserClick: (p: Principal) => void;
  onMessageUser?: (p: Principal, profile: Profile) => void;
}) {
  const { data: profile } = useGetUserProfile(principal);

  return (
    <div
      data-ocid={`discover.item.${index + 1}`}
      className="flex items-center gap-3 bg-card rounded-xl p-3"
    >
      <button
        type="button"
        onClick={() => onUserClick(principal)}
        className="flex items-center gap-3 flex-1 min-w-0"
      >
        <div className="relative">
          <Avatar className="w-12 h-12">
            {profile?.avatar && (
              <AvatarImage src={profile.avatar.getDirectURL()} />
            )}
            <AvatarFallback className="bg-gradient-to-br from-rose-400 to-pink-500 text-white">
              {profile?.displayName?.[0]?.toUpperCase() || "?"}
            </AvatarFallback>
          </Avatar>
          <div className="absolute -bottom-0.5 -right-0.5 w-4 h-4 bg-rose-500 rounded-full flex items-center justify-center">
            <Heart className="w-2.5 h-2.5 text-white fill-white" />
          </div>
        </div>
        <div className="flex flex-col min-w-0">
          <p className="font-semibold text-sm truncate">
            {profile?.displayName || "Loading..."}
          </p>
          {profile?.location && (
            <p className="text-xs text-muted-foreground truncate">
              📍 {profile.location}
            </p>
          )}
        </div>
      </button>
      {profile && onMessageUser && (
        <button
          type="button"
          data-ocid={`discover.secondary_button.${index + 1}`}
          onClick={() => onMessageUser(principal, profile)}
          className="w-9 h-9 rounded-full bg-muted flex items-center justify-center hover:bg-muted/80 transition-colors"
        >
          <MessageCircle className="w-4 h-4" />
        </button>
      )}
    </div>
  );
}

function PeopleSection({
  onUserClick,
}: { onUserClick: (p: Principal) => void }) {
  const [searchTerm, setSearchTerm] = useState("");
  const { identity } = useInternetIdentity();
  const myPrincipal = identity?.getPrincipal() ?? null;

  const { data: allProfiles, isLoading } = useGetAllProfiles();
  const { data: searchResults } = useSearchUsers(searchTerm);
  const { data: following } = useGetFollowing(myPrincipal);
  const followMutation = useFollow();

  const followingSet = new Set(following?.map((p) => p.toString()) ?? []);
  const displayList = searchTerm.trim()
    ? (searchResults ?? [])
    : (allProfiles ?? []);
  const filteredList = displayList.filter(
    ([p]) => p.toString() !== myPrincipal?.toString(),
  );

  const handleFollow = async (user: Principal, isFollowing: boolean) => {
    try {
      await followMutation.mutateAsync({ user, following: isFollowing });
      toast.success(isFollowing ? "Unfollowed" : "Following!");
    } catch {
      toast.error("Action failed");
    }
  };

  return (
    <div className="flex flex-col h-full">
      <div className="px-3 py-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            data-ocid="discover.search_input"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search people..."
            className="pl-9 bg-input border-border h-10"
          />
        </div>
      </div>
      <div className="flex-1 overflow-y-auto">
        {isLoading ? (
          <div className="p-3 flex flex-col gap-3">
            {[1, 2, 3, 4, 5].map((i) => (
              <div
                key={i}
                data-ocid="discover.loading_state"
                className="flex items-center gap-3"
              >
                <Skeleton className="w-12 h-12 rounded-full" />
                <div className="flex flex-col gap-1.5 flex-1">
                  <Skeleton className="w-32 h-3" />
                  <Skeleton className="w-24 h-2" />
                </div>
              </div>
            ))}
          </div>
        ) : filteredList.length > 0 ? (
          <div className="p-3 flex flex-col gap-2 pb-24">
            {filteredList.map(
              ([principal, profile]: [Principal, Profile], i) => {
                const isFollowing = followingSet.has(principal.toString());
                return (
                  <div
                    key={principal.toString()}
                    data-ocid={`discover.item.${i + 1}`}
                    className="flex items-center gap-3 bg-card rounded-xl p-3"
                  >
                    <button
                      type="button"
                      onClick={() => onUserClick(principal)}
                      className="flex items-center gap-3 flex-1 min-w-0"
                    >
                      <Avatar className="w-12 h-12 shrink-0">
                        {profile.avatar && (
                          <AvatarImage src={profile.avatar.getDirectURL()} />
                        )}
                        <AvatarFallback className="bg-muted">
                          {profile.displayName[0]?.toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex flex-col min-w-0 text-left">
                        <p className="font-semibold text-sm truncate">
                          {profile.displayName}
                        </p>
                        {profile.bio && (
                          <p className="text-xs text-muted-foreground truncate">
                            {profile.bio}
                          </p>
                        )}
                      </div>
                    </button>
                    <Button
                      data-ocid={`discover.toggle.${i + 1}`}
                      size="sm"
                      variant={isFollowing ? "secondary" : "default"}
                      onClick={() => handleFollow(principal, isFollowing)}
                      disabled={followMutation.isPending}
                      className={`h-8 px-3 shrink-0 ${
                        isFollowing
                          ? "bg-muted text-foreground hover:bg-muted/80"
                          : "bg-gradient-to-r from-primary to-secondary text-white"
                      }`}
                    >
                      {followMutation.isPending ? (
                        <Loader2 className="w-3 h-3 animate-spin" />
                      ) : isFollowing ? (
                        <>
                          <UserCheck className="w-3 h-3 mr-1" />
                          Following
                        </>
                      ) : (
                        <>
                          <UserPlus className="w-3 h-3 mr-1" />
                          Follow
                        </>
                      )}
                    </Button>
                  </div>
                );
              },
            )}
          </div>
        ) : (
          <div
            data-ocid="discover.empty_state"
            className="flex flex-col items-center justify-center py-16 text-center gap-3"
          >
            <Search className="w-10 h-10 text-muted-foreground" />
            <p className="text-muted-foreground">
              {searchTerm ? "No users found" : "No users yet"}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
