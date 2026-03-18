import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export class ExternalBlob {
    getBytes(): Promise<Uint8Array<ArrayBuffer>>;
    getDirectURL(): string;
    static fromURL(url: string): ExternalBlob;
    static fromBytes(blob: Uint8Array<ArrayBuffer>): ExternalBlob;
    withUploadProgress(onProgress: (percentage: number) => void): ExternalBlob;
}
export interface PostDTO {
    id: bigint;
    content: string;
    author: Principal;
    likes: Array<Principal>;
    timestamp: Time;
    image?: ExternalBlob;
    comments: Array<Comment>;
}
export type Time = bigint;
export interface Comment {
    id: bigint;
    content: string;
    author: Principal;
    timestamp: Time;
}
export interface Story {
    content: string;
    author: Principal;
    timestamp: Time;
    image?: ExternalBlob;
}
export interface Notification {
    id: bigint;
    kind: string;
    read: boolean;
    timestamp: Time;
    fromUser: Principal;
    targetId: bigint;
}
export interface Message {
    to: Principal;
    content: string;
    from: Principal;
    timestamp: Time;
}
export interface Profile {
    bio: string;
    displayName: string;
    interests: string;
    education: string;
    website: string;
    coverPhoto?: ExternalBlob;
    birthday: string;
    gender: string;
    favSongs: string;
    thoughts: string;
    favMovies: string;
    location: string;
    hobbies: string;
    avatar?: ExternalBlob;
    relationshipStatus: string;
}
export enum UserRole {
    admin = "admin",
    user = "user",
    guest = "guest"
}
export interface backendInterface {
    acceptRequest(user: Principal): Promise<void>;
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    commentOnPost(postId: bigint, content: string): Promise<void>;
    createPost(content: string, image: ExternalBlob | null): Promise<void>;
    createProfile(profile: Profile): Promise<void>;
    createStory(content: string, image: ExternalBlob | null): Promise<void>;
    follow(user: Principal): Promise<void>;
    getAllPosts(): Promise<Array<PostDTO>>;
    getAllProfiles(): Promise<Array<[Principal, Profile]>>;
    getCallerUserProfile(): Promise<Profile | null>;
    getCallerUserRole(): Promise<UserRole>;
    getFollowers(user: Principal): Promise<Array<Principal>>;
    getFollowing(user: Principal): Promise<Array<Principal>>;
    getFriends(): Promise<Array<Principal>>;
    getMatches(): Promise<Array<Principal>>;
    getMessages(user: Principal): Promise<Array<Message>>;
    getNotifications(): Promise<Array<Notification>>;
    getPostsByUser(user: Principal): Promise<Array<PostDTO>>;
    getProfile(user: Principal): Promise<Profile>;
    getStarsReceived(): Promise<bigint>;
    getStories(user: Principal): Promise<Array<Story>>;
    getStoryHighlights(user: Principal): Promise<Array<Story>>;
    getTinderQueue(): Promise<Array<[Principal, Profile]>>;
    getUnreadNotificationCount(): Promise<bigint>;
    getUserProfile(user: Principal): Promise<Profile | null>;
    isCallerAdmin(): Promise<boolean>;
    likePost(postId: bigint): Promise<void>;
    markNotificationsRead(): Promise<void>;
    saveCallerUserProfile(profile: Profile): Promise<void>;
    saveStoryToHighlight(storyIndex: bigint): Promise<void>;
    searchUsers(term: string): Promise<Array<[Principal, Profile]>>;
    sendMessage(to: Principal, content: string): Promise<void>;
    starUser(user: Principal): Promise<void>;
    tinderLike(user: Principal): Promise<void>;
    tinderPass(user: Principal): Promise<void>;
    unfollow(user: Principal): Promise<void>;
    unlikePost(postId: bigint): Promise<void>;
    updateProfile(profile: Profile): Promise<void>;
}
