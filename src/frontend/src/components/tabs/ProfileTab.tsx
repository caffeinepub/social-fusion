import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import { useQueryClient } from "@tanstack/react-query";
import {
  Cake,
  Camera,
  Edit2,
  Grid,
  Heart,
  Link,
  Loader2,
  LogOut,
  MapPin,
  User,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { ExternalBlob } from "../../backend";
import type { Profile } from "../../backend";
import { useInternetIdentity } from "../../hooks/useInternetIdentity";
import {
  useGetCallerProfile,
  useGetFollowers,
  useGetFollowing,
  useGetPostsByUser,
  useUpdateProfile,
} from "../../hooks/useQueries";

export default function ProfileTab() {
  const { identity, clear } = useInternetIdentity();
  const qc = useQueryClient();
  const myPrincipal = identity?.getPrincipal() ?? null;

  const { data: profile, isLoading: profileLoading } = useGetCallerProfile();
  const { data: posts } = useGetPostsByUser(myPrincipal);
  const { data: followers } = useGetFollowers(myPrincipal);
  const { data: following } = useGetFollowing(myPrincipal);

  const handleLogout = async () => {
    await clear();
    qc.clear();
  };

  if (profileLoading) {
    return (
      <div
        data-ocid="profile.loading_state"
        className="p-4 flex flex-col gap-4"
      >
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
    const ageDate = new Date(ageDiff);
    return Math.abs(ageDate.getUTCFullYear() - 1970);
  };

  const age = profile?.birthday ? calcAge(profile.birthday) : null;

  return (
    <div data-ocid="profile.page" className="flex flex-col h-full">
      <div className="px-4 pt-4 pb-3 flex items-center justify-between border-b border-border shrink-0">
        <h1 className="text-xl font-bold font-display">
          {profile?.displayName || "Profile"}
        </h1>
        <button
          type="button"
          data-ocid="profile.delete_button"
          onClick={handleLogout}
          className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-muted transition-colors"
          title="Logout"
        >
          <LogOut className="w-4 h-4 text-muted-foreground" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto pb-20">
        {/* Instagram-style header: avatar left, stats right */}
        <div className="p-4 flex items-start gap-4">
          <Avatar className="w-20 h-20 shrink-0 ring-2 ring-primary/30">
            {profile?.avatar && (
              <AvatarImage src={profile.avatar.getDirectURL()} />
            )}
            <AvatarFallback className="bg-muted text-2xl">
              {profile?.displayName?.[0]?.toUpperCase() || "?"}
            </AvatarFallback>
          </Avatar>
          <div className="flex flex-col gap-3 flex-1 min-w-0">
            {/* Stats */}
            <div className="flex gap-2 justify-around">
              {[
                { label: "Posts", value: posts?.length ?? 0 },
                { label: "Followers", value: followers?.length ?? 0 },
                { label: "Following", value: following?.length ?? 0 },
              ].map(({ label, value }) => (
                <div key={label} className="flex flex-col items-center">
                  <span className="font-bold text-lg leading-tight">
                    {value}
                  </span>
                  <span className="text-xs text-muted-foreground">{label}</span>
                </div>
              ))}
            </div>
            {/* Edit button */}
            {profile && (
              <EditProfileDialog
                profile={profile}
                onSuccess={() => toast.success("Profile updated!")}
              />
            )}
          </div>
        </div>

        {/* Profile info */}
        <div className="px-4 pb-4 flex flex-col gap-1.5">
          <p className="font-bold text-base">{profile?.displayName}</p>
          {profile?.bio && (
            <p className="text-sm text-foreground/90 leading-snug">
              {profile.bio}
            </p>
          )}
          {profile?.website && (
            <a
              href={
                profile.website.startsWith("http")
                  ? profile.website
                  : `https://${profile.website}`
              }
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 text-sm text-primary font-medium"
            >
              <Link className="w-3.5 h-3.5" />
              {profile.website}
            </a>
          )}
          {profile?.location && (
            <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
              <MapPin className="w-3.5 h-3.5" />
              {profile.location}
            </div>
          )}
          {/* Tags row */}
          <div className="flex flex-wrap gap-2 mt-1">
            {profile?.relationshipStatus && (
              <Badge
                variant="secondary"
                className="flex items-center gap-1 text-xs"
              >
                <Heart className="w-3 h-3" />
                {profile.relationshipStatus}
              </Badge>
            )}
            {profile?.gender && (
              <Badge
                variant="secondary"
                className="flex items-center gap-1 text-xs"
              >
                <User className="w-3 h-3" />
                {profile.gender}
              </Badge>
            )}
            {age !== null && (
              <Badge
                variant="secondary"
                className="flex items-center gap-1 text-xs"
              >
                <Cake className="w-3 h-3" />
                {age} years
              </Badge>
            )}
          </div>
        </div>

        {/* Posts grid */}
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
                  data-ocid={`profile.item.${i + 1}`}
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
              data-ocid="profile.empty_state"
              className="flex flex-col items-center justify-center py-10 text-center gap-2"
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

function EditProfileDialog({
  profile,
  onSuccess,
}: { profile: Profile; onSuccess: () => void }) {
  const [open, setOpen] = useState(false);
  const [displayName, setDisplayName] = useState(profile.displayName);
  const [bio, setBio] = useState(profile.bio);
  const [website, setWebsite] = useState(profile.website || "");
  const [location, setLocation] = useState(profile.location || "");
  const [gender, setGender] = useState(profile.gender || "");
  const [birthday, setBirthday] = useState(profile.birthday || "");
  const [relationshipStatus, setRelationshipStatus] = useState(
    profile.relationshipStatus || "",
  );
  const [avatarBlob, setAvatarBlob] = useState<ExternalBlob | null>(null);
  const [avatarPreview, setAvatarPreview] = useState("");
  const updateProfile = useUpdateProfile();

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const bytes = new Uint8Array(await file.arrayBuffer());
    setAvatarBlob(ExternalBlob.fromBytes(bytes));
    setAvatarPreview(URL.createObjectURL(new Blob([bytes])));
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await updateProfile.mutateAsync({
        displayName: displayName.trim(),
        bio: bio.trim(),
        avatar: avatarBlob ?? profile.avatar,
        website: website.trim(),
        location: location.trim(),
        gender,
        birthday: birthday.trim(),
        relationshipStatus,
      });
      onSuccess();
      setOpen(false);
    } catch {
      toast.error("Failed to update profile");
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          data-ocid="profile.edit_button"
          variant="outline"
          className="w-full border-border h-9 text-sm"
        >
          <Edit2 className="mr-2 w-3.5 h-3.5" /> Edit Profile
        </Button>
      </DialogTrigger>
      <DialogContent
        data-ocid="profile.dialog"
        className="bg-card border-border w-[92vw] max-w-sm rounded-2xl max-h-[90dvh] overflow-y-auto"
      >
        <DialogHeader>
          <DialogTitle className="font-display">Edit Profile</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSave} className="flex flex-col gap-4">
          <div className="flex justify-center">
            <label
              className="relative cursor-pointer group"
              htmlFor="edit-avatar-upload"
            >
              <Avatar className="w-16 h-16">
                <AvatarImage
                  src={avatarPreview || profile.avatar?.getDirectURL()}
                />
                <AvatarFallback className="bg-muted">
                  {displayName[0]?.toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className="absolute inset-0 rounded-full bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                <Camera className="w-5 h-5 text-white" />
              </div>
              <input
                id="edit-avatar-upload"
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleAvatarChange}
              />
            </label>
          </div>

          <div className="flex flex-col gap-1.5">
            <Label>Display Name</Label>
            <Input
              data-ocid="profile.input"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              className="bg-input border-border"
              maxLength={50}
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <Label>Bio</Label>
            <Textarea
              data-ocid="profile.textarea"
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              className="bg-input border-border resize-none"
              rows={3}
              maxLength={160}
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <Label>Website</Label>
            <Input
              value={website}
              onChange={(e) => setWebsite(e.target.value)}
              placeholder="https://yoursite.com"
              className="bg-input border-border"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <Label>Location</Label>
            <Input
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="City, Country"
              className="bg-input border-border"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1.5">
              <Label>Gender</Label>
              <Select value={gender} onValueChange={setGender}>
                <SelectTrigger className="bg-input border-border">
                  <SelectValue placeholder="Select" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Male">Male</SelectItem>
                  <SelectItem value="Female">Female</SelectItem>
                  <SelectItem value="Non-binary">Non-binary</SelectItem>
                  <SelectItem value="Other">Other</SelectItem>
                  <SelectItem value="Prefer not to say">
                    Prefer not to say
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex flex-col gap-1.5">
              <Label>Birthday</Label>
              <Input
                type="date"
                value={birthday}
                onChange={(e) => setBirthday(e.target.value)}
                className="bg-input border-border"
              />
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <Label>Relationship Status</Label>
            <Select
              value={relationshipStatus}
              onValueChange={setRelationshipStatus}
            >
              <SelectTrigger className="bg-input border-border">
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Single">Single</SelectItem>
                <SelectItem value="In a Relationship">
                  In a Relationship
                </SelectItem>
                <SelectItem value="Married">Married</SelectItem>
                <SelectItem value="It's Complicated">
                  It's Complicated
                </SelectItem>
                <SelectItem value="Prefer not to say">
                  Prefer not to say
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex gap-2">
            <Button
              type="button"
              data-ocid="profile.cancel_button"
              variant="outline"
              onClick={() => setOpen(false)}
              className="flex-1 border-border"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              data-ocid="profile.save_button"
              disabled={updateProfile.isPending}
              className="flex-1 bg-gradient-to-r from-primary to-secondary hover:opacity-90"
            >
              {updateProfile.isPending ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                "Save"
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
