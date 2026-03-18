import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Camera, Loader2, Sparkles } from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";
import { toast } from "sonner";
import { ExternalBlob } from "../backend";
import { useCreateProfile } from "../hooks/useQueries";

export default function ProfileSetup() {
  const [displayName, setDisplayName] = useState("");
  const [bio, setBio] = useState("");
  const [website, setWebsite] = useState("");
  const [location, setLocation] = useState("");
  const [gender, setGender] = useState("");
  const [birthday, setBirthday] = useState("");
  const [relationshipStatus, setRelationshipStatus] = useState("");
  const [avatarBlob, setAvatarBlob] = useState<ExternalBlob | null>(null);
  const [avatarPreview, setAvatarPreview] = useState("");
  const createProfile = useCreateProfile();

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const bytes = new Uint8Array(await file.arrayBuffer());
    const blob = ExternalBlob.fromBytes(bytes);
    setAvatarBlob(blob);
    setAvatarPreview(URL.createObjectURL(new Blob([bytes])));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!displayName.trim()) {
      toast.error("Please enter a display name");
      return;
    }
    try {
      await createProfile.mutateAsync({
        displayName: displayName.trim(),
        bio: bio.trim(),
        avatar: avatarBlob ?? undefined,
        website: website.trim(),
        location: location.trim(),
        gender,
        birthday: birthday.trim(),
        relationshipStatus,
      });
      toast.success("Profile created!");
    } catch {
      toast.error("Failed to create profile");
    }
  };

  return (
    <div className="min-h-dvh flex flex-col items-center justify-center bg-background px-6 py-8">
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-sm"
      >
        <div className="text-center mb-8">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center mx-auto mb-4">
            <Sparkles className="w-6 h-6 text-white" />
          </div>
          <h1 className="text-2xl font-bold font-display">
            Set up your profile
          </h1>
          <p className="text-muted-foreground text-sm mt-1">
            Tell the world who you are
          </p>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="flex justify-center">
            <label
              className="relative cursor-pointer group"
              htmlFor="avatar-upload"
            >
              <Avatar className="w-20 h-20 border-2 border-border">
                <AvatarImage src={avatarPreview} />
                <AvatarFallback className="bg-muted text-2xl">
                  {displayName?.[0]?.toUpperCase() || "?"}
                </AvatarFallback>
              </Avatar>
              <div className="absolute inset-0 rounded-full bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                <Camera className="w-6 h-6 text-white" />
              </div>
              <input
                id="avatar-upload"
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleAvatarChange}
              />
            </label>
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="display-name">Display Name *</Label>
            <Input
              id="display-name"
              data-ocid="profile_setup.input"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              placeholder="Your name"
              className="bg-input border-border h-11"
              maxLength={50}
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="bio">Bio</Label>
            <Textarea
              id="bio"
              data-ocid="profile_setup.textarea"
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="Tell people about yourself..."
              className="bg-input border-border resize-none"
              rows={3}
              maxLength={160}
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="website">Website</Label>
            <Input
              id="website"
              value={website}
              onChange={(e) => setWebsite(e.target.value)}
              placeholder="https://yoursite.com"
              className="bg-input border-border h-11"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="location">Location</Label>
            <Input
              id="location"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="City, Country"
              className="bg-input border-border h-11"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1.5">
              <Label>Gender</Label>
              <Select value={gender} onValueChange={setGender}>
                <SelectTrigger className="bg-input border-border h-11">
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
              <Label htmlFor="birthday">Birthday</Label>
              <Input
                id="birthday"
                type="date"
                value={birthday}
                onChange={(e) => setBirthday(e.target.value)}
                className="bg-input border-border h-11"
              />
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <Label>Relationship Status</Label>
            <Select
              value={relationshipStatus}
              onValueChange={setRelationshipStatus}
            >
              <SelectTrigger className="bg-input border-border h-11">
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

          <Button
            type="submit"
            data-ocid="profile_setup.submit_button"
            disabled={createProfile.isPending || !displayName.trim()}
            className="h-12 bg-gradient-to-r from-primary to-secondary hover:opacity-90 font-semibold rounded-2xl mt-2"
          >
            {createProfile.isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Creating...
              </>
            ) : (
              "Continue to Social Fusion"
            )}
          </Button>
        </form>
      </motion.div>
    </div>
  );
}
