import type { Principal } from "@icp-sdk/core/principal";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import type {
  Message,
  Notification,
  PostDTO,
  Profile,
  Story,
} from "../backend";
import type { ExternalBlob } from "../backend";
import { useActor } from "./useActor";
import { useInternetIdentity } from "./useInternetIdentity";

export function useGetCallerProfile() {
  const { actor, isFetching: actorFetching } = useActor();
  const query = useQuery<Profile | null>({
    queryKey: ["callerProfile"],
    queryFn: async () => {
      if (!actor) throw new Error("Actor not available");
      return actor.getCallerUserProfile();
    },
    enabled: !!actor && !actorFetching,
    staleTime: 0,
    refetchOnMount: "always",
    refetchOnWindowFocus: true,
  });
  return {
    ...query,
    isLoading: actorFetching || query.isLoading,
    isFetched: !!actor && query.isFetched,
  };
}

export function useGetAllPosts() {
  const { actor, isFetching } = useActor();
  return useQuery<PostDTO[]>({
    queryKey: ["allPosts"],
    queryFn: async () => {
      if (!actor) return [];
      const posts = await actor.getAllPosts();
      return posts.sort((a, b) => Number(b.timestamp - a.timestamp));
    },
    enabled: !!actor && !isFetching,
  });
}

export function useGetAllProfiles() {
  const { actor, isFetching } = useActor();
  return useQuery<Array<[Principal, Profile]>>({
    queryKey: ["allProfiles"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAllProfiles();
    },
    enabled: !!actor && !isFetching,
    staleTime: 30_000,
    refetchOnWindowFocus: true,
    refetchOnMount: true,
  });
}

export function useGetUserProfile(principal: Principal | null) {
  const { actor, isFetching } = useActor();
  return useQuery<Profile | null>({
    queryKey: ["userProfile", principal?.toString()],
    queryFn: async () => {
      if (!actor || !principal) return null;
      return actor.getUserProfile(principal);
    },
    enabled: !!actor && !isFetching && !!principal,
  });
}

export function useGetPostsByUser(principal: Principal | null) {
  const { actor, isFetching } = useActor();
  return useQuery<PostDTO[]>({
    queryKey: ["postsByUser", principal?.toString()],
    queryFn: async () => {
      if (!actor || !principal) return [];
      const posts = await actor.getPostsByUser(principal);
      return posts.sort((a, b) => Number(b.timestamp - a.timestamp));
    },
    enabled: !!actor && !isFetching && !!principal,
  });
}

export function useGetFollowers(principal: Principal | null) {
  const { actor, isFetching } = useActor();
  return useQuery<Principal[]>({
    queryKey: ["followers", principal?.toString()],
    queryFn: async () => {
      if (!actor || !principal) return [];
      return actor.getFollowers(principal);
    },
    enabled: !!actor && !isFetching && !!principal,
  });
}

export function useGetFollowing(principal: Principal | null) {
  const { actor, isFetching } = useActor();
  return useQuery<Principal[]>({
    queryKey: ["following", principal?.toString()],
    queryFn: async () => {
      if (!actor || !principal) return [];
      return actor.getFollowing(principal);
    },
    enabled: !!actor && !isFetching && !!principal,
  });
}

export function useGetMessages(otherUser: Principal | null) {
  const { actor, isFetching } = useActor();
  return useQuery<Message[]>({
    queryKey: ["messages", otherUser?.toString()],
    queryFn: async () => {
      if (!actor || !otherUser) return [];
      const msgs = await actor.getMessages(otherUser);
      return msgs.sort((a, b) => Number(a.timestamp - b.timestamp));
    },
    enabled: !!actor && !isFetching && !!otherUser,
    refetchInterval: 2000,
    refetchOnWindowFocus: true,
    staleTime: 0,
  });
}

export function useGetStories(principal: Principal | null) {
  const { actor, isFetching } = useActor();
  return useQuery<Story[]>({
    queryKey: ["stories", principal?.toString()],
    queryFn: async () => {
      if (!actor || !principal) return [];
      return actor.getStories(principal);
    },
    enabled: !!actor && !isFetching && !!principal,
  });
}

export function useSearchUsers(term: string) {
  const { actor, isFetching } = useActor();
  return useQuery<Array<[Principal, Profile]>>({
    queryKey: ["searchUsers", term],
    queryFn: async () => {
      if (!actor || !term.trim()) return [];
      return actor.searchUsers(term);
    },
    enabled: !!actor && !isFetching && term.trim().length > 0,
  });
}

// Notifications
export function useGetNotifications() {
  const { actor, isFetching } = useActor();
  return useQuery<Notification[]>({
    queryKey: ["notifications"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getNotifications();
    },
    enabled: !!actor && !isFetching,
    refetchInterval: 10000,
    refetchOnWindowFocus: true,
    staleTime: 0,
  });
}

export function useGetUnreadNotificationCount() {
  const { actor, isFetching } = useActor();
  return useQuery<bigint>({
    queryKey: ["notificationCount"],
    queryFn: async () => {
      if (!actor) return 0n;
      return actor.getUnreadNotificationCount();
    },
    enabled: !!actor && !isFetching,
    refetchInterval: 10000,
  });
}

export function useMarkNotificationsRead() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      if (!actor) throw new Error("Actor not available");
      await actor.markNotificationsRead();
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["notifications"] });
      qc.invalidateQueries({ queryKey: ["notificationCount"] });
    },
  });
}

// Tinder queue returns Profile[] (no principals from backend)
export function useGetTinderQueue() {
  const { actor, isFetching } = useActor();
  return useQuery<Profile[]>({
    queryKey: ["tinderQueue"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getTinderQueue();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useGetMatches() {
  const { actor, isFetching } = useActor();
  return useQuery<Principal[]>({
    queryKey: ["matches"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getMatches();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useTinderLike() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (user: Principal) => {
      if (!actor) throw new Error("Actor not available");
      await actor.tinderLike(user);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["tinderQueue"] });
      qc.invalidateQueries({ queryKey: ["matches"] });
    },
  });
}

export function useTinderPass() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (user: Principal) => {
      if (!actor) throw new Error("Actor not available");
      await actor.tinderPass(user);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["tinderQueue"] });
    },
  });
}

// Friends
export function useGetFriends() {
  const { actor, isFetching } = useActor();
  return useQuery<Principal[]>({
    queryKey: ["friends"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getFriends();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useAcceptRequest() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (user: Principal) => {
      if (!actor) throw new Error("Actor not available");
      await actor.acceptRequest(user);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["matches"] });
      qc.invalidateQueries({ queryKey: ["friends"] });
      qc.invalidateQueries({ queryKey: ["allProfiles"] });
    },
  });
}

export function useStarUser() {
  const { actor } = useActor();
  return useMutation({
    mutationFn: async (user: Principal) => {
      if (!actor) throw new Error("Actor not available");
      await actor.starUser(user);
    },
  });
}

export function useGetStoryHighlights(principal: Principal | null) {
  const { actor, isFetching } = useActor();
  return useQuery<Story[]>({
    queryKey: ["storyHighlights", principal?.toString()],
    queryFn: async () => {
      if (!actor || !principal) return [];
      return actor.getStoryHighlights(principal);
    },
    enabled: !!actor && !isFetching && !!principal,
  });
}

export function useSaveStoryToHighlight() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (storyIndex: bigint) => {
      if (!actor) throw new Error("Actor not available");
      await actor.saveStoryToHighlight(storyIndex);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["storyHighlights"] });
    },
  });
}

// Mutations
export function useLikePost() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({
      postId,
      liked,
    }: { postId: bigint; liked: boolean }) => {
      if (!actor) throw new Error("Actor not available");
      if (liked) await actor.unlikePost(postId);
      else await actor.likePost(postId);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["allPosts"] }),
  });
}

export function useCommentOnPost() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({
      postId,
      content,
    }: { postId: bigint; content: string }) => {
      if (!actor) throw new Error("Actor not available");
      await actor.commentOnPost(postId, content);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["allPosts"] }),
  });
}

export function useCreatePost() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({
      content,
      image,
    }: { content: string; image: ExternalBlob | null }) => {
      if (!actor) throw new Error("Actor not available");
      await actor.createPost(content, image);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["allPosts"] }),
  });
}

export function useCreateStory() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({
      content,
      image,
    }: { content: string; image: ExternalBlob | null }) => {
      if (!actor) throw new Error("Actor not available");
      await actor.createStory(content, image);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["stories"] }),
  });
}

export function useFollow() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({
      user,
      following,
    }: { user: Principal; following: boolean }) => {
      if (!actor) throw new Error("Actor not available");
      if (following) await actor.unfollow(user);
      else await actor.follow(user);
    },
    onSuccess: (_data, variables) => {
      qc.invalidateQueries({ queryKey: ["following"] });
      qc.invalidateQueries({
        queryKey: ["followers", variables.user.toString()],
      });
    },
  });
}

export function useSendMessage() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ to, content }: { to: Principal; content: string }) => {
      if (!actor) throw new Error("Actor not available");
      await actor.sendMessage(to, content);
    },
    onSuccess: (_data, variables) =>
      qc.invalidateQueries({ queryKey: ["messages", variables.to.toString()] }),
  });
}

export function useCreateProfile() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (profile: Profile) => {
      if (!actor) throw new Error("Actor not available");
      await actor.createProfile(profile);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["callerProfile"] }),
  });
}

export function useUpdateProfile() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (profile: Profile) => {
      if (!actor) throw new Error("Actor not available");
      await actor.updateProfile(profile);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["callerProfile"] }),
  });
}

export function useFormatTimestamp() {
  return (timestamp: bigint) => {
    const ms = Number(timestamp / 1_000_000n);
    const now = Date.now();
    const diff = now - ms;
    if (diff < 60_000) return "just now";
    if (diff < 3_600_000) return `${Math.floor(diff / 60_000)}m ago`;
    if (diff < 86_400_000) return `${Math.floor(diff / 3_600_000)}h ago`;
    return new Date(ms).toLocaleDateString();
  };
}

export function useGetCallerProfileForAuth() {
  const { identity } = useInternetIdentity();
  const { actor, isFetching: actorFetching } = useActor();
  const query = useQuery<Profile | null>({
    queryKey: ["callerProfile"],
    queryFn: async () => {
      if (!actor) throw new Error("Actor not available");
      return actor.getCallerUserProfile();
    },
    enabled: !!actor && !actorFetching && !!identity,
    refetchOnWindowFocus: true,
  });
  return {
    ...query,
    isLoading: actorFetching || query.isLoading,
    isFetched: !!actor && query.isFetched,
  };
}

export function usePrefetchAll() {
  const { actor, isFetching } = useActor();
  const qc = useQueryClient();
  useEffect(() => {
    if (!actor || isFetching) return;
    // Fetch all key data in parallel immediately
    const opts = { staleTime: 0 };
    Promise.all([
      qc.fetchQuery({
        queryKey: ["tinderQueue"],
        queryFn: () => actor.getTinderQueue(),
        ...opts,
      }),
      qc.fetchQuery({
        queryKey: ["allProfiles"],
        queryFn: () => actor.getAllProfiles(),
        ...opts,
      }),
      qc.fetchQuery({
        queryKey: ["notifications"],
        queryFn: () => actor.getNotifications(),
        ...opts,
      }),
      qc.fetchQuery({
        queryKey: ["matches"],
        queryFn: () => actor.getMatches(),
        ...opts,
      }),
      qc.fetchQuery({
        queryKey: ["notificationCount"],
        queryFn: () => actor.getUnreadNotificationCount(),
        ...opts,
      }),
      qc.fetchQuery({
        queryKey: ["friends"],
        queryFn: () => actor.getFriends(),
        ...opts,
      }),
      qc.fetchQuery({
        queryKey: ["callerProfile"],
        queryFn: () => actor.getCallerUserProfile(),
        ...opts,
      }),
    ]).catch(() => {
      /* silent: individual query hooks will show errors */
    });
  }, [actor, isFetching, qc]);
}

// ─── Blocked Users (localStorage-backed) ─────────────────────────────────────
const BLOCKED_KEY = "blocked_users";

export function useBlockedUsers() {
  const [blockedSet, setBlockedSet] = useState<Set<string>>(() => {
    try {
      const raw = localStorage.getItem(BLOCKED_KEY);
      if (raw) return new Set<string>(JSON.parse(raw));
    } catch {}
    return new Set<string>();
  });

  const persist = (next: Set<string>) => {
    try {
      localStorage.setItem(BLOCKED_KEY, JSON.stringify([...next]));
    } catch {}
    setBlockedSet(new Set(next));
  };

  const blockUser = (p: string) => {
    const next = new Set(blockedSet);
    next.add(p);
    persist(next);
  };

  const unblockUser = (p: string) => {
    const next = new Set(blockedSet);
    next.delete(p);
    persist(next);
  };

  return { blockedSet, blockUser, unblockUser };
}
