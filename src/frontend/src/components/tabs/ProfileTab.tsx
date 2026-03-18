import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { useQueryClient } from "@tanstack/react-query";
import {
  Camera,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Edit2,
  Gift,
  Grid,
  Loader2,
  LogOut,
  Play,
  Plus,
  Share2,
  Shield,
  Sparkles,
  Video,
  X,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useEffect, useRef, useState } from "react";
import { ExternalBlob } from "../../backend";
import type { Profile } from "../../backend";
import { useInternetIdentity } from "../../hooks/useInternetIdentity";
import {
  useGetCallerProfile,
  useGetFollowers,
  useGetFollowing,
  useGetPostsByUser,
  useGetStories,
  useGetStoryHighlights,
  useSaveStoryToHighlight,
  useUpdateProfile,
} from "../../hooks/useQueries";
import FollowListSheet from "../FollowListSheet";
import GiftSheet from "../GiftSheet";

const MOODS = ["😊", "🎉", "❤️", "🔥", "😴"];

const REEL_PLACEHOLDERS = [
  { id: "r1", gradient: "from-pink-900/60 to-purple-900/60" },
  { id: "r2", gradient: "from-blue-900/60 to-cyan-900/60" },
  { id: "r3", gradient: "from-orange-900/60 to-red-900/60" },
  { id: "r4", gradient: "from-green-900/60 to-teal-900/60" },
];

function calcProfileStrength(profile: Profile | undefined): number {
  if (!profile) return 0;
  let pct = 0;
  if (profile.displayName) pct += 20;
  if (profile.bio) pct += 20;
  if (profile.location) pct += 15;
  if (profile.website) pct += 10;
  if (profile.birthday) pct += 15;
  if (profile.gender) pct += 10;
  if (profile.avatar) pct += 10;
  return pct;
}

export default function ProfileTab() {
  const { identity, clear } = useInternetIdentity();
  const qc = useQueryClient();
  const myPrincipal = identity?.getPrincipal() ?? null;

  const { data: profile, isLoading: profileLoading } = useGetCallerProfile();
  const { data: posts } = useGetPostsByUser(myPrincipal);
  const { data: followers } = useGetFollowers(myPrincipal);
  const { data: following } = useGetFollowing(myPrincipal);
  const [privacyOpen, setPrivacyOpen] = useState(false);
  const [giftOpen, setGiftOpen] = useState(false);
  const [followSheet, setFollowSheet] = useState<
    "followers" | "following" | null
  >(null);
  const [selectedMood, setSelectedMood] = useState<string | null>(null);
  const [profileStrength, setProfileStrength] = useState(0);
  const [lightboxIdx, setLightboxIdx] = useState<number | null>(null);

  // Privacy toggles
  const [isPublic, setIsPublic] = useState(true);
  const [showOnlineStatus, setShowOnlineStatus] = useState(true);
  const [readReceipts, setReadReceipts] = useState(true);

  useEffect(() => {
    const strength = calcProfileStrength(profile ?? undefined);
    // Animate with small delay
    const t = setTimeout(() => setProfileStrength(strength), 300);
    return () => clearTimeout(t);
  }, [profile]);

  const handleLogout = async () => {
    await clear();
    qc.clear();
  };

  if (profileLoading) {
    return (
      <div
        data-ocid="profile.loading_state"
        className="p-4 flex flex-col gap-4 bg-[#0a0a0f] h-full"
      >
        <Skeleton className="w-full h-40 rounded-2xl" />
        <div className="flex items-center gap-4">
          <Skeleton className="w-20 h-20 rounded-full" />
          <div className="flex flex-col gap-2">
            <Skeleton className="w-32 h-4" />
            <Skeleton className="w-48 h-3" />
          </div>
        </div>
      </div>
    );
  }

  const calcAge = (birthday: string) => {
    if (!birthday) return null;
    const birth = new Date(birthday);
    const ageDiff = Date.now() - birth.getTime();
    return Math.abs(new Date(ageDiff).getUTCFullYear() - 1970);
  };

  const age = profile?.birthday ? calcAge(profile.birthday) : null;

  const handleMoodToggle = (mood: string) => {
    setSelectedMood((m) => (m === mood ? null : mood));
  };

  return (
    <div
      data-ocid="profile.page"
      className="flex flex-col h-full bg-[#0a0a0f] overflow-y-auto pb-20"
    >
      {/* Gradient header */}
      <div className="relative h-48 bg-gradient-to-br from-[#3d0000] via-[#2d0050] to-[#1a0030] shrink-0 overflow-hidden">
        {profile?.coverPhoto && (
          <img
            src={profile.coverPhoto.getDirectURL()}
            alt="Cover"
            className="absolute inset-0 w-full h-full object-cover"
          />
        )}
        <div
          className="absolute inset-0 opacity-20"
          style={{
            backgroundImage:
              "radial-gradient(circle at 20% 50%, #ff0080 0%, transparent 50%), radial-gradient(circle at 80% 20%, #7c3aed 0%, transparent 50%)",
          }}
        />
        {/* Cover photo upload button overlay */}
        <label className="absolute top-3 left-3 cursor-pointer">
          <div className="flex items-center gap-1.5 bg-black/40 backdrop-blur-sm px-2.5 py-1.5 rounded-full text-xs text-white/70 hover:text-white transition-colors">
            <Camera className="w-3 h-3" />
            Cover
          </div>
          <input type="file" accept="image/*" className="hidden" />
        </label>

        {/* Top action icons */}
        <div className="absolute top-4 right-4 flex gap-2">
          <button
            type="button"
            onClick={() => setPrivacyOpen(!privacyOpen)}
            className="w-9 h-9 rounded-full bg-black/30 backdrop-blur-sm flex items-center justify-center"
          >
            <Share2 className="w-4 h-4 text-white/80" />
          </button>
          <button
            type="button"
            data-ocid="profile.delete_button"
            onClick={handleLogout}
            className="w-9 h-9 rounded-full bg-black/30 backdrop-blur-sm flex items-center justify-center"
          >
            <LogOut className="w-4 h-4 text-white/80" />
          </button>
        </div>

        {/* Avatar overlapping */}
        <div className="absolute -bottom-10 left-4 flex items-end gap-3 z-20">
          <div className="relative z-20">
            <Avatar className="w-20 h-20 ring-4 ring-[#0a0a0f]">
              {profile?.avatar && (
                <AvatarImage src={profile.avatar.getDirectURL()} />
              )}
              <AvatarFallback className="bg-gradient-to-br from-pink-500 to-purple-600 text-white text-2xl font-bold">
                {profile?.displayName?.[0]?.toUpperCase() ?? "?"}
              </AvatarFallback>
            </Avatar>
            {/* Mood badge */}
            {selectedMood && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="absolute -top-1 -right-1 w-7 h-7 rounded-full bg-[#0a0a0f] border-2 border-pink-500 flex items-center justify-center text-sm"
              >
                {selectedMood}
              </motion.div>
            )}
          </div>
        </div>

        {/* Edit button */}
        <div className="absolute bottom-3 right-4">
          <EditProfileDialog profile={profile ?? null} />
        </div>
      </div>

      <div className="px-4 pt-12 shrink-0">
        {/* Name & info */}
        <div className="mt-3">
          <h2 className="text-xl font-bold text-white font-display">
            {profile?.displayName || "Your Name"}
            {age ? (
              <span className="text-white/50 font-normal text-base ml-2">
                {age}
              </span>
            ) : null}
          </h2>
          {profile?.location && (
            <p className="text-white/40 text-sm mt-0.5">
              📍 {profile.location}
            </p>
          )}
          {profile?.bio && (
            <p className="text-white/60 text-sm mt-1">{profile.bio}</p>
          )}
        </div>

        {/* Extended profile info display */}
        <ExtendedProfileInfo profile={profile ?? null} />

        {/* Mood picker */}
        <div className="flex items-center gap-2 mt-3">
          <span className="text-white/30 text-xs">Mood:</span>
          {MOODS.map((mood) => (
            <button
              key={mood}
              type="button"
              data-ocid="profile.toggle"
              onClick={() => handleMoodToggle(mood)}
              className={`w-9 h-9 rounded-full flex items-center justify-center text-lg transition-all active:scale-90 ${
                selectedMood === mood
                  ? "bg-pink-500/30 ring-2 ring-pink-500/60 scale-110"
                  : "bg-white/5 hover:bg-white/10"
              }`}
            >
              {mood}
            </button>
          ))}
        </div>

        {/* Stats */}
        <div className="flex gap-0 mt-4 border border-white/10 rounded-2xl overflow-hidden">
          {[
            { label: "Posts", value: posts?.length ?? 0, clickable: false },
            {
              label: "Followers",
              value: followers?.length ?? 0,
              clickable: true,
            },
            {
              label: "Following",
              value: following?.length ?? 0,
              clickable: true,
            },
          ].map(({ label, value, clickable }, i) => (
            <button
              key={label}
              type="button"
              disabled={!clickable}
              data-ocid={
                clickable ? `profile.${label.toLowerCase()}_button` : undefined
              }
              onClick={() =>
                clickable &&
                setFollowSheet(
                  label === "Followers" ? "followers" : "following",
                )
              }
              className={`flex-1 flex flex-col items-center py-3 ${
                i < 2 ? "border-r border-white/10" : ""
              } ${clickable ? "active:bg-white/5 transition-colors" : ""}`}
            >
              <span className="text-white font-bold text-lg">{value}</span>
              <span className="text-white/40 text-xs">{label}</span>
            </button>
          ))}
        </div>

        {/* Profile Strength meter */}
        <div className="mt-4 bg-white/5 border border-white/10 rounded-2xl p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-white/60 text-xs font-semibold">
              Profile Strength
            </span>
            <span
              className="text-xs font-bold"
              style={{
                background: "linear-gradient(to right, #ec4899, #a855f7)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}
            >
              {profileStrength}% Complete
            </span>
          </div>
          <div className="relative w-full h-2 bg-white/10 rounded-full overflow-hidden">
            <motion.div
              className="absolute inset-y-0 left-0 rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${profileStrength}%` }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              style={{
                background: "linear-gradient(to right, #ec4899, #a855f7)",
              }}
            />
          </div>
          {profileStrength < 100 && (
            <p className="text-white/30 text-[10px] mt-1.5">
              Complete your profile to get 3x more matches
            </p>
          )}
        </div>

        {/* Story Highlights */}
        <StoryHighlightsSection myPrincipal={myPrincipal} />

        {/* Action buttons row */}
        <div className="flex gap-2 mt-4">
          <button
            type="button"
            data-ocid="profile.primary_button"
            className="flex-1 flex items-center justify-center gap-1.5 h-10 rounded-full bg-gradient-to-r from-red-500 to-rose-600 text-white text-sm font-semibold shadow-lg shadow-red-500/20"
          >
            <span className="w-2 h-2 rounded-full bg-white animate-pulse" />
            Go Live
          </button>
          <button
            type="button"
            data-ocid="profile.secondary_button"
            className="flex-1 flex items-center justify-center gap-1.5 h-10 rounded-full bg-gradient-to-r from-purple-600 to-violet-600 text-white text-sm font-semibold shadow-lg shadow-purple-500/20"
          >
            <Sparkles className="w-3.5 h-3.5" />
            Suggestions
          </button>
          <button
            type="button"
            data-ocid="profile.toggle"
            onClick={() => setGiftOpen(true)}
            className="flex-1 flex items-center justify-center gap-1.5 h-10 rounded-full bg-gradient-to-r from-red-400 to-orange-500 text-white text-sm font-semibold shadow-lg shadow-red-400/20"
          >
            <Gift className="w-3.5 h-3.5" />
            Gifts
          </button>
        </div>
      </div>

      {/* Privacy & Membership card */}
      <div className="px-4 mt-4 shrink-0">
        <button
          type="button"
          data-ocid="profile.panel"
          onClick={() => setPrivacyOpen(!privacyOpen)}
          className="w-full flex items-center gap-3 bg-white/5 border border-white/10 rounded-2xl p-4"
        >
          <div className="w-9 h-9 rounded-full bg-purple-600/20 flex items-center justify-center shrink-0">
            <Shield className="w-4 h-4 text-purple-400" />
          </div>
          <div className="flex-1 text-left">
            <p className="text-white font-semibold text-sm">
              Privacy &amp; Membership
            </p>
            <p className="text-white/40 text-xs">
              Manage your account settings
            </p>
          </div>
          <ChevronDown
            className={`w-4 h-4 text-white/40 transition-transform duration-200 ${
              privacyOpen ? "rotate-180" : ""
            }`}
          />
        </button>

        {privacyOpen && (
          <div className="bg-white/3 border border-white/8 rounded-2xl mt-1 overflow-hidden">
            <div className="flex items-center justify-between px-4 py-3 border-b border-white/5">
              <div className="flex flex-col">
                <p className="text-white/80 text-sm font-medium">
                  Profile Visibility
                </p>
                <p className="text-white/30 text-xs">
                  {isPublic ? "Public" : "Private"}
                </p>
              </div>
              <Switch
                data-ocid="profile.switch"
                checked={isPublic}
                onCheckedChange={setIsPublic}
              />
            </div>
            <div className="flex items-center justify-between px-4 py-3 border-b border-white/5">
              <div className="flex flex-col">
                <p className="text-white/80 text-sm font-medium">
                  Show Online Status
                </p>
                <p className="text-white/30 text-xs">
                  {showOnlineStatus ? "Visible to others" : "Hidden"}
                </p>
              </div>
              <Switch
                data-ocid="profile.switch"
                checked={showOnlineStatus}
                onCheckedChange={setShowOnlineStatus}
              />
            </div>
            <div className="flex items-center justify-between px-4 py-3">
              <div className="flex flex-col">
                <p className="text-white/80 text-sm font-medium">
                  Read Receipts
                </p>
                <p className="text-white/30 text-xs">
                  {readReceipts ? "Enabled" : "Disabled"}
                </p>
              </div>
              <Switch
                data-ocid="profile.switch"
                checked={readReceipts}
                onCheckedChange={setReadReceipts}
              />
            </div>
          </div>
        )}
      </div>

      {/* Posts / Reels tab toggle */}
      <div className="border-t border-white/5 mt-6">
        <Tabs defaultValue="posts" className="w-full">
          <TabsList
            data-ocid="profile.tab"
            className="w-full bg-white/5 border-b border-white/5 rounded-none h-11"
          >
            <TabsTrigger
              value="posts"
              className="flex-1 gap-1.5 data-[state=active]:bg-transparent data-[state=active]:text-white data-[state=active]:border-b-2 data-[state=active]:border-pink-500 rounded-none text-white/40"
            >
              <Grid className="w-4 h-4" />
              Posts
            </TabsTrigger>
            <TabsTrigger
              value="reels"
              className="flex-1 gap-1.5 data-[state=active]:bg-transparent data-[state=active]:text-white data-[state=active]:border-b-2 data-[state=active]:border-pink-500 rounded-none text-white/40"
            >
              <Video className="w-4 h-4" />
              Reels
            </TabsTrigger>
          </TabsList>

          <TabsContent value="posts" className="mt-0">
            {posts && posts.length > 0 ? (
              <div className="grid grid-cols-3 gap-0.5">
                {posts.map((post, i) => (
                  <button
                    key={post.id.toString()}
                    type="button"
                    data-ocid={`profile.item.${i + 1}`}
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
                      <div className="w-full h-full bg-gradient-to-br from-pink-900/30 to-purple-900/30 flex items-center justify-center p-2">
                        <p className="text-xs text-center line-clamp-3 text-white/60">
                          {post.content}
                        </p>
                      </div>
                    )}
                  </button>
                ))}
              </div>
            ) : (
              <div
                data-ocid="profile.empty_state"
                className="flex flex-col items-center justify-center py-10 gap-2"
              >
                <Grid className="w-8 h-8 text-white/20" />
                <p className="text-sm text-white/30">No posts yet</p>
              </div>
            )}
          </TabsContent>

          <TabsContent value="reels" className="mt-0">
            <div className="grid grid-cols-3 gap-0.5">
              {REEL_PLACEHOLDERS.map((reel, i) => (
                <div
                  key={reel.id}
                  data-ocid={`profile.item.${i + 1}`}
                  className={`aspect-square bg-gradient-to-br ${reel.gradient} overflow-hidden relative flex items-center justify-center`}
                >
                  <div className="w-9 h-9 rounded-full bg-black/40 backdrop-blur-sm flex items-center justify-center">
                    <Play className="w-4 h-4 text-white fill-white ml-0.5" />
                  </div>
                </div>
              ))}
            </div>
          </TabsContent>
        </Tabs>
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
                onClick={() => setLightboxIdx((i) => Math.max(0, (i ?? 0) - 1))}
                className="absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/10 flex items-center justify-center z-10"
              >
                <ChevronLeft className="w-5 h-5 text-white" />
              </button>
            )}
            {lightboxIdx < posts.length - 1 && (
              <button
                type="button"
                onClick={() =>
                  setLightboxIdx((i) =>
                    Math.min(posts.length - 1, (i ?? 0) + 1),
                  )
                }
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

      <GiftSheet
        open={giftOpen}
        onClose={() => setGiftOpen(false)}
        recipientName={profile?.displayName ?? "yourself"}
      />

      {/* Follow/Followers sheet */}
      <AnimatePresence>
        {followSheet && myPrincipal && (
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

function EditProfileDialog({ profile }: { profile: Profile | null }) {
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({
    displayName: profile?.displayName || "",
    bio: profile?.bio || "",
    location: profile?.location || "",
    website: profile?.website || "",
    birthday: profile?.birthday || "",
    gender: profile?.gender || "",
    relationshipStatus: profile?.relationshipStatus || "",
  });
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [_coverFile, setCoverFile] = useState<File | null>(null);
  const [coverPreview, setCoverPreview] = useState<string>("");
  const [imageError, setImageError] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const coverInputRef = useRef<HTMLInputElement>(null);
  const updateProfile = useUpdateProfile();
  const [extForm, setExtForm] = useState({
    interests: profile?.interests || "",
    hobbies: profile?.hobbies || "",
    favMovies: profile?.favMovies || "",
    favSongs: profile?.favSongs || "",
    education: profile?.education || "",
    thoughts: profile?.thoughts || "",
  });

  // Sync form fields whenever the dialog opens or profile data arrives
  useEffect(() => {
    if (open && profile) {
      setForm({
        displayName: profile.displayName || "",
        bio: profile.bio || "",
        location: profile.location || "",
        website: profile.website || "",
        birthday: profile.birthday || "",
        gender: profile.gender || "",
        relationshipStatus: profile.relationshipStatus || "",
      });
      setExtForm({
        interests: profile.interests || "",
        hobbies: profile.hobbies || "",
        favMovies: profile.favMovies || "",
        favSongs: profile.favSongs || "",
        education: profile.education || "",
        thoughts: profile.thoughts || "",
      });
    }
  }, [open, profile]);

  const handleAddCover = (files: FileList | null) => {
    if (!files || files.length === 0) return;
    const file = files[0];
    setCoverFile(file);
    setCoverPreview(URL.createObjectURL(file));
  };

  const handleAddImages = (files: FileList | null) => {
    if (!files) return;
    const newFiles = Array.from(files);
    setImageFiles((prev) => [...prev, ...newFiles]);
    setImageError("");
  };

  const handleRemoveImage = (idx: number) => {
    setImageFiles((prev) => prev.filter((_, i) => i !== idx));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (imageFiles.length > 0 && imageFiles.length < 3) {
      setImageError("Please add at least 3 photos");
      return;
    }
    try {
      let avatarBlob: ExternalBlob | undefined;
      if (imageFiles.length > 0) {
        const bytes = new Uint8Array(await imageFiles[0].arrayBuffer());
        avatarBlob = ExternalBlob.fromBytes(bytes);
      }
      let coverBlob: ExternalBlob | undefined;
      if (_coverFile) {
        const bytes = new Uint8Array(await _coverFile.arrayBuffer());
        coverBlob = ExternalBlob.fromBytes(bytes);
      }
      await updateProfile.mutateAsync({
        ...form,
        interests: extForm.interests,
        hobbies: extForm.hobbies,
        favMovies: extForm.favMovies,
        favSongs: extForm.favSongs,
        education: extForm.education,
        thoughts: extForm.thoughts,
        avatar: avatarBlob ?? profile?.avatar ?? undefined,
        coverPhoto: coverBlob ?? profile?.coverPhoto ?? undefined,
      } as Profile);
      setOpen(false);
    } catch {}
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <button
          type="button"
          data-ocid="profile.edit_button"
          className="w-9 h-9 rounded-full bg-white/10 flex items-center justify-center"
        >
          <Edit2 className="w-4 h-4 text-white/70" />
        </button>
      </DialogTrigger>
      <DialogContent className="bg-[#1a1a2e] border-white/10 text-white max-w-sm mx-auto max-h-[90dvh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-white">Edit Profile</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          {/* Cover/background image upload */}
          <div className="flex flex-col gap-2">
            <Label className="text-white/60 text-xs">
              Cover / Background Image
            </Label>
            <button
              type="button"
              onClick={() => coverInputRef.current?.click()}
              className="relative w-full h-28 rounded-xl overflow-hidden border-2 border-dashed border-white/20 bg-gradient-to-br from-[#2d0050] to-[#1a0030] flex items-center justify-center cursor-pointer hover:border-pink-500/50 transition-colors"
            >
              {coverPreview ? (
                <img
                  src={coverPreview}
                  alt="cover"
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="flex flex-col items-center gap-1">
                  <Camera className="w-6 h-6 text-white/30" />
                  <span className="text-white/30 text-xs">
                    Upload cover photo
                  </span>
                </div>
              )}
            </button>
            <input
              ref={coverInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => handleAddCover(e.target.files)}
            />
          </div>

          {/* Multi-image upload section */}
          <div className="flex flex-col gap-2">
            <Label className="text-white/60 text-xs">
              Photos (min 3, up to 7)
            </Label>
            <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar">
              {imageFiles.map((file, idx) => (
                <div
                  key={file.name}
                  data-ocid={`profile.item.${idx + 1}`}
                  className="relative shrink-0 w-20 h-20 rounded-xl overflow-hidden border border-white/20"
                >
                  <img
                    src={URL.createObjectURL(file)}
                    alt={`Upload ${idx + 1}`}
                    className="w-full h-full object-cover"
                  />
                  <button
                    type="button"
                    onClick={() => handleRemoveImage(idx)}
                    className="absolute top-1 right-1 w-5 h-5 rounded-full bg-black/70 flex items-center justify-center"
                  >
                    <X className="w-3 h-3 text-white" />
                  </button>
                  {idx === 0 && (
                    <div className="absolute bottom-0 left-0 right-0 bg-pink-500/80 text-white text-[9px] text-center py-0.5 font-semibold">
                      Main
                    </div>
                  )}
                </div>
              ))}
              {imageFiles.length === 0 && profile?.avatar && (
                <div className="shrink-0 w-20 h-20 rounded-xl overflow-hidden border border-white/20 relative">
                  <img
                    src={profile.avatar.getDirectURL()}
                    alt="current avatar"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute bottom-0 left-0 right-0 bg-pink-500/80 text-white text-[9px] text-center py-0.5 font-semibold">
                    Main
                  </div>
                </div>
              )}
              <button
                type="button"
                data-ocid="profile.upload_button"
                onClick={() => fileInputRef.current?.click()}
                className="shrink-0 w-20 h-20 rounded-xl border-2 border-dashed border-white/20 flex flex-col items-center justify-center bg-white/5 hover:bg-white/10 transition-colors"
              >
                <Plus className="w-5 h-5 text-white/40" />
                <span className="text-white/30 text-[10px] mt-1">Add</span>
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                multiple
                className="hidden"
                onChange={(e) => handleAddImages(e.target.files)}
              />
            </div>
            {imageError && (
              <p
                data-ocid="profile.error_state"
                className="text-red-400 text-xs"
              >
                {imageError}
              </p>
            )}
            <p className="text-white/30 text-xs">
              First photo becomes your profile picture
            </p>
          </div>

          <div className="flex flex-col gap-1">
            <Label className="text-white/60 text-xs">Display Name</Label>
            <Input
              data-ocid="profile.input"
              value={form.displayName}
              onChange={(e) =>
                setForm((f) => ({ ...f, displayName: e.target.value }))
              }
              className="bg-white/5 border-white/10 text-white"
            />
          </div>
          <div className="flex flex-col gap-1">
            <Label className="text-white/60 text-xs">Bio</Label>
            <Textarea
              data-ocid="profile.textarea"
              value={form.bio}
              onChange={(e) => setForm((f) => ({ ...f, bio: e.target.value }))}
              className="bg-white/5 border-white/10 text-white resize-none"
              rows={3}
            />
          </div>
          <div className="flex flex-col gap-1">
            <Label className="text-white/60 text-xs">Location</Label>
            <Input
              value={form.location}
              onChange={(e) =>
                setForm((f) => ({ ...f, location: e.target.value }))
              }
              className="bg-white/5 border-white/10 text-white"
            />
          </div>
          <div className="flex flex-col gap-1">
            <Label className="text-white/60 text-xs">Website</Label>
            <Input
              value={form.website}
              onChange={(e) =>
                setForm((f) => ({ ...f, website: e.target.value }))
              }
              className="bg-white/5 border-white/10 text-white"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1">
              <Label className="text-white/60 text-xs">Birthday</Label>
              <Input
                type="date"
                value={form.birthday}
                onChange={(e) =>
                  setForm((f) => ({ ...f, birthday: e.target.value }))
                }
                className="bg-white/5 border-white/10 text-white"
              />
            </div>
            <div className="flex flex-col gap-1">
              <Label className="text-white/60 text-xs">Gender</Label>
              <Select
                value={form.gender}
                onValueChange={(v) => setForm((f) => ({ ...f, gender: v }))}
              >
                <SelectTrigger
                  className="bg-white/5 border-white/10 text-white"
                  data-ocid="profile.select"
                >
                  <SelectValue placeholder="Select" />
                </SelectTrigger>
                <SelectContent className="bg-[#1a1a2e] border-white/10 text-white">
                  <SelectItem value="male">Male</SelectItem>
                  <SelectItem value="female">Female</SelectItem>
                  <SelectItem value="nonbinary">Non-binary</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="flex flex-col gap-1">
            <Label className="text-white/60 text-xs">Relationship Status</Label>
            <Select
              value={form.relationshipStatus}
              onValueChange={(v) =>
                setForm((f) => ({ ...f, relationshipStatus: v }))
              }
            >
              <SelectTrigger className="bg-white/5 border-white/10 text-white">
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent className="bg-[#1a1a2e] border-white/10 text-white">
                <SelectItem value="single">Single</SelectItem>
                <SelectItem value="in_relationship">
                  In a relationship
                </SelectItem>
                <SelectItem value="married">Married</SelectItem>
                <SelectItem value="complicated">
                  It&apos;s complicated
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
          {/* Extended profile fields */}
          <div className="flex flex-col gap-1">
            <Label className="text-white/60 text-xs">
              Interests (comma-separated)
            </Label>
            <Input
              value={extForm.interests}
              onChange={(e) =>
                setExtForm((f) => ({ ...f, interests: e.target.value }))
              }
              placeholder="e.g. travel, photography, cooking"
              className="bg-white/5 border-white/10 text-white placeholder:text-white/20"
            />
          </div>
          <div className="flex flex-col gap-1">
            <Label className="text-white/60 text-xs">Hobbies</Label>
            <Input
              value={extForm.hobbies}
              onChange={(e) =>
                setExtForm((f) => ({ ...f, hobbies: e.target.value }))
              }
              placeholder="e.g. gaming, hiking, reading"
              className="bg-white/5 border-white/10 text-white placeholder:text-white/20"
            />
          </div>
          <div className="flex flex-col gap-1">
            <Label className="text-white/60 text-xs">Favourite Movies</Label>
            <Input
              value={extForm.favMovies}
              onChange={(e) =>
                setExtForm((f) => ({ ...f, favMovies: e.target.value }))
              }
              placeholder="e.g. Inception, The Dark Knight"
              className="bg-white/5 border-white/10 text-white placeholder:text-white/20"
            />
          </div>
          <div className="flex flex-col gap-1">
            <Label className="text-white/60 text-xs">
              Favourite Songs / Music
            </Label>
            <Input
              value={extForm.favSongs}
              onChange={(e) =>
                setExtForm((f) => ({ ...f, favSongs: e.target.value }))
              }
              placeholder="e.g. Blinding Lights, Shape of You"
              className="bg-white/5 border-white/10 text-white placeholder:text-white/20"
            />
          </div>
          <div className="flex flex-col gap-1">
            <Label className="text-white/60 text-xs">Education</Label>
            <Input
              value={extForm.education}
              onChange={(e) =>
                setExtForm((f) => ({ ...f, education: e.target.value }))
              }
              placeholder="e.g. BSc Computer Science, MIT"
              className="bg-white/5 border-white/10 text-white placeholder:text-white/20"
            />
          </div>
          <div className="flex flex-col gap-1">
            <Label className="text-white/60 text-xs">
              Thoughts / Thinking About
            </Label>
            <Textarea
              value={extForm.thoughts}
              onChange={(e) =>
                setExtForm((f) => ({ ...f, thoughts: e.target.value }))
              }
              placeholder="What's on your mind? Share your thoughts..."
              className="bg-white/5 border-white/10 text-white resize-none placeholder:text-white/20"
              rows={2}
            />
          </div>

          <Button
            type="submit"
            data-ocid="profile.submit_button"
            disabled={updateProfile.isPending}
            className="bg-gradient-to-r from-pink-500 to-purple-600 border-0 text-white"
          >
            {updateProfile.isPending ? (
              <Loader2 className="w-4 h-4 animate-spin mr-2" />
            ) : null}
            Save Changes
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}

// ─── Extended Profile Info (reads from backend profile) ─────────────────────
function ExtendedProfileInfo({ profile }: { profile: Profile | null }) {
  const items = [
    { icon: "🎯", label: "Interests", value: profile?.interests || "" },
    { icon: "🎮", label: "Hobbies", value: profile?.hobbies || "" },
    { icon: "🎬", label: "Favourite Movies", value: profile?.favMovies || "" },
    { icon: "🎵", label: "Favourite Songs", value: profile?.favSongs || "" },
    { icon: "🎓", label: "Education", value: profile?.education || "" },
    { icon: "💭", label: "Thoughts", value: profile?.thoughts || "" },
  ].filter((item) => item.value.trim().length > 0);

  if (items.length === 0) return null;

  return (
    <div className="mt-3 flex flex-col gap-2">
      {items.map((item) => (
        <div
          key={item.label}
          className="flex items-start gap-2 bg-white/5 rounded-xl px-3 py-2.5"
        >
          <span className="text-base shrink-0">{item.icon}</span>
          <div className="flex-1 min-w-0">
            <p className="text-white/40 text-[10px] font-medium uppercase tracking-wide">
              {item.label}
            </p>
            <p className="text-white/80 text-sm">{item.value}</p>
          </div>
        </div>
      ))}
    </div>
  );
}

// ─── Story Highlights Section ────────────────────────────────────────────────
function StoryHighlightsSection({
  myPrincipal,
}: {
  myPrincipal: import("@icp-sdk/core/principal").Principal | null;
}) {
  const { data: highlights } = useGetStoryHighlights(myPrincipal);
  const { data: stories } = useGetStories(myPrincipal);
  const saveHighlight = useSaveStoryToHighlight();
  const [showStoryPicker, setShowStoryPicker] = useState(false);

  const handleSaveHighlight = async (idx: number) => {
    try {
      await saveHighlight.mutateAsync(BigInt(idx));
      setShowStoryPicker(false);
    } catch {}
  };

  return (
    <div className="mt-4">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-white/50 text-xs font-semibold uppercase tracking-widest">
          Highlights
        </h3>
      </div>
      <div className="flex items-center gap-3 overflow-x-auto no-scrollbar pb-1">
        {/* Add highlight button */}
        <button
          type="button"
          data-ocid="profile.upload_button"
          onClick={() => setShowStoryPicker(true)}
          className="flex flex-col items-center gap-1.5 shrink-0"
        >
          <div className="w-14 h-14 rounded-full border-2 border-dashed border-pink-500/40 bg-pink-500/8 flex items-center justify-center">
            <Plus className="w-5 h-5 text-pink-400" />
          </div>
          <span className="text-white/30 text-[10px]">Add</span>
        </button>

        {/* Existing highlights */}
        {highlights && highlights.length > 0 ? (
          highlights.map((story, i) => (
            <div
              key={story.timestamp.toString()}
              data-ocid={`profile.item.${i + 1}`}
              className="flex flex-col items-center gap-1.5 shrink-0"
            >
              <div className="w-14 h-14 rounded-full overflow-hidden border-2 border-pink-500/60 bg-gradient-to-br from-pink-500/30 to-purple-600/30 flex items-center justify-center">
                {story.image ? (
                  <img
                    src={story.image.getDirectURL()}
                    alt="Highlight"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span className="text-lg">✨</span>
                )}
              </div>
              <span className="text-white/40 text-[10px] max-w-[56px] truncate">
                {story.content || `Story ${i + 1}`}
              </span>
            </div>
          ))
        ) : (
          <p className="text-white/20 text-xs py-2">No highlights yet</p>
        )}
      </div>

      {/* Story picker modal */}
      {showStoryPicker && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 backdrop-blur-sm">
          <div className="bg-[#1a1a2e] rounded-t-3xl w-full max-w-sm p-4 pb-8">
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-white font-bold">Save Story to Highlights</h4>
              <button
                type="button"
                onClick={() => setShowStoryPicker(false)}
                className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center"
              >
                <X className="w-4 h-4 text-white" />
              </button>
            </div>
            {stories && stories.length > 0 ? (
              <div className="flex flex-col gap-2 max-h-60 overflow-y-auto">
                {stories.map((story, idx) => (
                  <button
                    key={`${story.timestamp.toString()}-${idx}`}
                    type="button"
                    onClick={() => handleSaveHighlight(idx)}
                    className="flex items-center gap-3 p-3 bg-white/5 rounded-xl hover:bg-white/10 transition-colors"
                  >
                    {story.image ? (
                      <img
                        src={story.image.getDirectURL()}
                        alt="Story"
                        className="w-10 h-10 rounded-xl object-cover shrink-0"
                      />
                    ) : (
                      <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-pink-500/30 to-purple-600/30 flex items-center justify-center shrink-0">
                        <span className="text-lg">✨</span>
                      </div>
                    )}
                    <p className="text-white/70 text-sm flex-1 text-left truncate">
                      {story.content || "Story"}
                    </p>
                  </button>
                ))}
              </div>
            ) : (
              <p className="text-white/30 text-sm text-center py-6">
                No stories to highlight
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
