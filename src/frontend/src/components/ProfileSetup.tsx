import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
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
import { Textarea } from "@/components/ui/textarea";
import {
  Camera,
  Check,
  ChevronLeft,
  ChevronRight,
  Loader2,
  Sparkles,
  X,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
import { ExternalBlob } from "../backend";
import { useCreateProfile } from "../hooks/useQueries";

const TOTAL_STEPS = 5;

const STEP_TITLES = [
  "Basic Info",
  "Your Photos",
  "Interests & Hobbies",
  "About You",
  "Review & Complete",
];

const STEP_ICONS = ["👤", "📸", "✨", "💭", "🎉"];

export default function ProfileSetup() {
  const [step, setStep] = useState(1);
  const [direction, setDirection] = useState(1);

  // Step 1 — Basic Info
  const [displayName, setDisplayName] = useState("");
  const [gender, setGender] = useState("");
  const [birthday, setBirthday] = useState("");
  const [location, setLocation] = useState("");
  const [relationshipStatus, setRelationshipStatus] = useState("");

  // Step 2 — Photos
  const [avatarBlob, setAvatarBlob] = useState<ExternalBlob | null>(null);
  const [avatarPreview, setAvatarPreview] = useState("");
  const [coverPreview, setCoverPreview] = useState("");
  const [extraPreviews, setExtraPreviews] = useState<string[]>([]);

  // Step 3 — Interests
  const [interests, setInterests] = useState("");
  const [hobbies, setHobbies] = useState("");
  const [favMovies, setFavMovies] = useState("");
  const [favSongs, setFavSongs] = useState("");
  const [education, setEducation] = useState("");

  // Step 4 — About
  const [bio, setBio] = useState("");
  const [thoughts, setThoughts] = useState("");
  const [website, setWebsite] = useState("");

  const createProfile = useCreateProfile();

  const goNext = () => {
    setDirection(1);
    setStep((s) => Math.min(s + 1, TOTAL_STEPS));
  };

  const goPrev = () => {
    setDirection(-1);
    setStep((s) => Math.max(s - 1, 1));
  };

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const bytes = new Uint8Array(await file.arrayBuffer());
    setAvatarBlob(ExternalBlob.fromBytes(bytes));
    setAvatarPreview(URL.createObjectURL(file));
  };

  const handleCoverChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setCoverPreview(URL.createObjectURL(file));
  };

  const handleExtraImages = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []).slice(0, 6);
    const urls = files.map((f) => URL.createObjectURL(f));
    setExtraPreviews(urls);
  };

  const removeExtra = (i: number) => {
    setExtraPreviews((prev) => prev.filter((_, idx) => idx !== i));
  };

  const handleComplete = async () => {
    if (!displayName.trim()) return;
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
        interests: interests.trim(),
        hobbies: hobbies.trim(),
        favMovies: favMovies.trim(),
        favSongs: favSongs.trim(),
        education: education.trim(),
        thoughts: thoughts.trim(),
      });
      // Set 2-month premium trial
      const expiry = Date.now() + 60 * 24 * 60 * 60 * 1000;
      localStorage.setItem(
        "socialFusionPremium",
        JSON.stringify({ isPremium: true, plan: "trial", expiry }),
      );
    } catch {}
  };

  const canGoNext = step === 1 ? !!displayName.trim() : true;

  const variants = {
    enter: (d: number) => ({ opacity: 0, x: d * 40 }),
    center: { opacity: 1, x: 0 },
    exit: (d: number) => ({ opacity: 0, x: -d * 40 }),
  };

  return (
    <div
      className="min-h-dvh flex flex-col bg-[#0a0a0f] px-5 py-6 overflow-y-auto"
      style={{
        background: "radial-gradient(ellipse at top, #1a0030 0%, #0a0a0f 60%)",
      }}
    >
      {/* Header */}
      <div className="flex flex-col items-center mb-6">
        <div
          className="w-14 h-14 rounded-2xl flex items-center justify-center mb-3 shadow-lg shadow-pink-500/30"
          style={{
            background: "linear-gradient(135deg, #ec4899, #a855f7)",
          }}
        >
          <Sparkles className="w-7 h-7 text-white" />
        </div>
        <h1
          className="text-2xl font-bold text-white"
          style={{ fontFamily: "var(--font-display, sans-serif)" }}
        >
          Create Your Profile
        </h1>
        <p className="text-white/40 text-sm mt-1">
          Step {step} of {TOTAL_STEPS} — {STEP_TITLES[step - 1]}
        </p>
      </div>

      {/* Progress */}
      <div className="mb-6">
        <div className="flex gap-1.5 mb-2">
          {STEP_TITLES.map((title, i) => (
            <div
              key={`step-bar-${title}`}
              className="h-1.5 flex-1 rounded-full transition-all duration-500"
              style={{
                background:
                  i < step
                    ? "linear-gradient(90deg, #ec4899, #a855f7)"
                    : "rgba(255,255,255,0.1)",
              }}
            />
          ))}
        </div>
        <div className="flex justify-between">
          {STEP_ICONS.map((icon, i) => (
            <div
              key={`step-icon-${STEP_ICONS[i]}`}
              className={`text-sm transition-all ${
                i + 1 === step
                  ? "scale-125"
                  : i + 1 < step
                    ? "opacity-60"
                    : "opacity-20"
              }`}
            >
              {i + 1 < step ? "✅" : icon}
            </div>
          ))}
        </div>
      </div>

      {/* Step content */}
      <div className="flex-1 relative overflow-hidden">
        <AnimatePresence custom={direction} mode="wait">
          <motion.div
            key={step}
            custom={direction}
            variants={variants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.28, ease: "easeInOut" }}
            className="w-full"
          >
            {step === 1 && (
              <Step1
                displayName={displayName}
                setDisplayName={setDisplayName}
                gender={gender}
                setGender={setGender}
                birthday={birthday}
                setBirthday={setBirthday}
                location={location}
                setLocation={setLocation}
                relationshipStatus={relationshipStatus}
                setRelationshipStatus={setRelationshipStatus}
              />
            )}
            {step === 2 && (
              <Step2
                avatarPreview={avatarPreview}
                coverPreview={coverPreview}
                extraPreviews={extraPreviews}
                displayName={displayName}
                onAvatarChange={handleAvatarChange}
                onCoverChange={handleCoverChange}
                onExtraImages={handleExtraImages}
                onRemoveExtra={removeExtra}
              />
            )}
            {step === 3 && (
              <Step3
                interests={interests}
                setInterests={setInterests}
                hobbies={hobbies}
                setHobbies={setHobbies}
                favMovies={favMovies}
                setFavMovies={setFavMovies}
                favSongs={favSongs}
                setFavSongs={setFavSongs}
                education={education}
                setEducation={setEducation}
              />
            )}
            {step === 4 && (
              <Step4
                bio={bio}
                setBio={setBio}
                thoughts={thoughts}
                setThoughts={setThoughts}
                website={website}
                setWebsite={setWebsite}
              />
            )}
            {step === 5 && (
              <Step5
                displayName={displayName}
                gender={gender}
                birthday={birthday}
                location={location}
                relationshipStatus={relationshipStatus}
                avatarPreview={avatarPreview}
                interests={interests}
                hobbies={hobbies}
                bio={bio}
              />
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Navigation */}
      <div className="flex items-center gap-3 mt-6">
        {step > 1 && (
          <button
            type="button"
            data-ocid="profile_setup.cancel_button"
            onClick={goPrev}
            className="w-12 h-12 rounded-full bg-white/8 border border-white/10 flex items-center justify-center active:scale-95 transition-transform"
          >
            <ChevronLeft className="w-5 h-5 text-white" />
          </button>
        )}

        {step < TOTAL_STEPS ? (
          <button
            type="button"
            data-ocid="profile_setup.primary_button"
            onClick={goNext}
            disabled={!canGoNext}
            className="flex-1 h-12 rounded-2xl font-bold text-white flex items-center justify-center gap-2 active:scale-95 transition-transform disabled:opacity-40"
            style={{
              background: "linear-gradient(135deg, #ec4899, #a855f7)",
              boxShadow: "0 4px 20px rgba(236,72,153,0.3)",
            }}
          >
            Next
            <ChevronRight className="w-5 h-5" />
          </button>
        ) : (
          <button
            type="button"
            data-ocid="profile_setup.submit_button"
            onClick={handleComplete}
            disabled={createProfile.isPending || !displayName.trim()}
            className="flex-1 h-12 rounded-2xl font-bold text-white flex items-center justify-center gap-2 active:scale-95 transition-transform disabled:opacity-40"
            style={{
              background: "linear-gradient(135deg, #ec4899, #a855f7)",
              boxShadow: "0 4px 20px rgba(236,72,153,0.3)",
            }}
          >
            {createProfile.isPending ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" /> Creating...
              </>
            ) : (
              <>
                <Check className="w-5 h-5" /> Complete &amp; Start Trial
              </>
            )}
          </button>
        )}
      </div>
    </div>
  );
}

// ── Step 1: Basic Info ──────────────────────────────────────────────────────
function Step1({
  displayName,
  setDisplayName,
  gender,
  setGender,
  birthday,
  setBirthday,
  location,
  setLocation,
  relationshipStatus,
  setRelationshipStatus,
}: {
  displayName: string;
  setDisplayName: (v: string) => void;
  gender: string;
  setGender: (v: string) => void;
  birthday: string;
  setBirthday: (v: string) => void;
  location: string;
  setLocation: (v: string) => void;
  relationshipStatus: string;
  setRelationshipStatus: (v: string) => void;
}) {
  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-1.5">
        <Label className="text-white/60 text-xs uppercase tracking-wider">
          Display Name *
        </Label>
        <Input
          data-ocid="profile_setup.input"
          value={displayName}
          onChange={(e) => setDisplayName(e.target.value)}
          placeholder="Your full name"
          className="h-12 bg-white/5 border-white/10 text-white placeholder:text-white/30 rounded-xl"
          maxLength={50}
        />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="flex flex-col gap-1.5">
          <Label className="text-white/60 text-xs uppercase tracking-wider">
            Gender
          </Label>
          <Select value={gender} onValueChange={setGender}>
            <SelectTrigger className="h-12 bg-white/5 border-white/10 text-white rounded-xl">
              <SelectValue placeholder="Select" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Male">Male</SelectItem>
              <SelectItem value="Female">Female</SelectItem>
              <SelectItem value="Non-binary">Non-binary</SelectItem>
              <SelectItem value="Other">Other</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="flex flex-col gap-1.5">
          <Label className="text-white/60 text-xs uppercase tracking-wider">
            Birthday
          </Label>
          <Input
            type="date"
            value={birthday}
            onChange={(e) => setBirthday(e.target.value)}
            className="h-12 bg-white/5 border-white/10 text-white rounded-xl"
          />
        </div>
      </div>

      <div className="flex flex-col gap-1.5">
        <Label className="text-white/60 text-xs uppercase tracking-wider">
          Location
        </Label>
        <Input
          value={location}
          onChange={(e) => setLocation(e.target.value)}
          placeholder="City, Country"
          className="h-12 bg-white/5 border-white/10 text-white placeholder:text-white/30 rounded-xl"
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <Label className="text-white/60 text-xs uppercase tracking-wider">
          Relationship Status
        </Label>
        <Select
          value={relationshipStatus}
          onValueChange={setRelationshipStatus}
        >
          <SelectTrigger className="h-12 bg-white/5 border-white/10 text-white rounded-xl">
            <SelectValue placeholder="Select status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="Single">Single</SelectItem>
            <SelectItem value="Divorced">Divorced</SelectItem>
            <SelectItem value="Widowed">Widowed</SelectItem>
            <SelectItem value="Never Married">Never Married</SelectItem>
            <SelectItem value="Prefer not to say">Prefer not to say</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}

// ── Step 2: Photos ──────────────────────────────────────────────────────────
function Step2({
  avatarPreview,
  coverPreview,
  extraPreviews,
  displayName,
  onAvatarChange,
  onCoverChange,
  onExtraImages,
  onRemoveExtra,
}: {
  avatarPreview: string;
  coverPreview: string;
  extraPreviews: string[];
  displayName: string;
  onAvatarChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onCoverChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onExtraImages: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onRemoveExtra: (i: number) => void;
}) {
  return (
    <div className="flex flex-col gap-5">
      {/* Avatar */}
      <div className="flex flex-col items-center gap-3">
        <label className="relative cursor-pointer group" htmlFor="step2-avatar">
          <div className="w-24 h-24 rounded-full overflow-hidden border-2 border-pink-500/50 bg-gradient-to-br from-pink-500 to-purple-600 flex items-center justify-center">
            {avatarPreview ? (
              <img
                src={avatarPreview}
                alt="Avatar"
                className="w-full h-full object-cover"
              />
            ) : (
              <span className="text-white text-3xl font-bold">
                {displayName?.[0]?.toUpperCase() || "?"}
              </span>
            )}
          </div>
          <div className="absolute bottom-0 right-0 w-7 h-7 rounded-full bg-pink-500 border-2 border-[#0a0a0f] flex items-center justify-center">
            <Camera className="w-3.5 h-3.5 text-white" />
          </div>
          <input
            id="step2-avatar"
            type="file"
            accept="image/*"
            className="hidden"
            onChange={onAvatarChange}
          />
        </label>
        <p className="text-white/40 text-xs">Profile photo (required)</p>
      </div>

      {/* Cover photo */}
      <div className="flex flex-col gap-2">
        <Label className="text-white/60 text-xs uppercase tracking-wider">
          Cover Photo
        </Label>
        <label className="relative cursor-pointer group" htmlFor="step2-cover">
          <div
            className="w-full h-24 rounded-xl overflow-hidden border border-white/10 flex items-center justify-center"
            style={{
              background: coverPreview
                ? `url(${coverPreview}) center/cover no-repeat`
                : "linear-gradient(135deg, rgba(236,72,153,0.3), rgba(168,85,247,0.3))",
            }}
          >
            {!coverPreview && (
              <div className="flex items-center gap-2 text-white/50">
                <Camera className="w-4 h-4" />
                <span className="text-sm">Add cover photo</span>
              </div>
            )}
          </div>
          <input
            id="step2-cover"
            type="file"
            accept="image/*"
            className="hidden"
            onChange={onCoverChange}
          />
        </label>
      </div>

      {/* Extra images */}
      <div className="flex flex-col gap-2">
        <Label className="text-white/60 text-xs uppercase tracking-wider">
          More Photos (up to 6)
        </Label>
        <div className="grid grid-cols-3 gap-2">
          {extraPreviews.map((url, i) => (
            <div
              key={url}
              className="relative aspect-square rounded-xl overflow-hidden"
            >
              <img
                src={url}
                alt={`Gallery ${i + 1}`}
                className="w-full h-full object-cover"
              />
              <button
                type="button"
                onClick={() => onRemoveExtra(i)}
                className="absolute top-1 right-1 w-5 h-5 rounded-full bg-black/70 flex items-center justify-center"
              >
                <X className="w-3 h-3 text-white" />
              </button>
            </div>
          ))}
          {extraPreviews.length < 6 && (
            <label
              className="aspect-square rounded-xl border border-dashed border-white/20 flex items-center justify-center cursor-pointer bg-white/3"
              htmlFor="step2-extra"
            >
              <span className="text-white/30 text-2xl">+</span>
              <input
                id="step2-extra"
                type="file"
                accept="image/*"
                multiple
                className="hidden"
                onChange={onExtraImages}
              />
            </label>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Step 3: Interests ───────────────────────────────────────────────────────
function Step3({
  interests,
  setInterests,
  hobbies,
  setHobbies,
  favMovies,
  setFavMovies,
  favSongs,
  setFavSongs,
  education,
  setEducation,
}: {
  interests: string;
  setInterests: (v: string) => void;
  hobbies: string;
  setHobbies: (v: string) => void;
  favMovies: string;
  setFavMovies: (v: string) => void;
  favSongs: string;
  setFavSongs: (v: string) => void;
  education: string;
  setEducation: (v: string) => void;
}) {
  const fields = [
    {
      label: "Interests",
      icon: "✨",
      value: interests,
      onChange: setInterests,
      placeholder: "Travel, Cooking, Photography...",
    },
    {
      label: "Hobbies",
      icon: "🎨",
      value: hobbies,
      onChange: setHobbies,
      placeholder: "Reading, Hiking, Painting...",
    },
    {
      label: "Favourite Movies",
      icon: "🎬",
      value: favMovies,
      onChange: setFavMovies,
      placeholder: "Inception, The Notebook...",
    },
    {
      label: "Favourite Songs",
      icon: "🎵",
      value: favSongs,
      onChange: setFavSongs,
      placeholder: "Tum Hi Ho, Shape of You...",
    },
    {
      label: "Education",
      icon: "🎓",
      value: education,
      onChange: setEducation,
      placeholder: "B.Tech Computer Science, IIT Delhi",
    },
  ];
  return (
    <div className="flex flex-col gap-4">
      <p className="text-white/40 text-xs">
        Separate multiple items with commas
      </p>
      {fields.map((f) => (
        <div key={f.label} className="flex flex-col gap-1.5">
          <Label className="text-white/60 text-xs uppercase tracking-wider">
            {f.icon} {f.label}
          </Label>
          <Input
            value={f.value}
            onChange={(e) => f.onChange(e.target.value)}
            placeholder={f.placeholder}
            className="h-11 bg-white/5 border-white/10 text-white placeholder:text-white/25 rounded-xl"
          />
        </div>
      ))}
    </div>
  );
}

// ── Step 4: About You ───────────────────────────────────────────────────────
function Step4({
  bio,
  setBio,
  thoughts,
  setThoughts,
  website,
  setWebsite,
}: {
  bio: string;
  setBio: (v: string) => void;
  thoughts: string;
  setThoughts: (v: string) => void;
  website: string;
  setWebsite: (v: string) => void;
}) {
  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-1.5">
        <Label className="text-white/60 text-xs uppercase tracking-wider">
          💬 Bio
        </Label>
        <Textarea
          data-ocid="profile_setup.textarea"
          value={bio}
          onChange={(e) => setBio(e.target.value)}
          placeholder="Tell people about yourself — your values, what you're looking for..."
          className="bg-white/5 border-white/10 text-white placeholder:text-white/25 rounded-xl resize-none"
          rows={4}
          maxLength={300}
        />
        <p className="text-white/20 text-xs text-right">{bio.length}/300</p>
      </div>

      <div className="flex flex-col gap-1.5">
        <Label className="text-white/60 text-xs uppercase tracking-wider">
          💭 Thoughts (shown as ticker)
        </Label>
        <Input
          value={thoughts}
          onChange={(e) => setThoughts(e.target.value)}
          placeholder="Looking for a soulmate, serious relationship..."
          className="h-11 bg-white/5 border-white/10 text-white placeholder:text-white/25 rounded-xl"
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <Label className="text-white/60 text-xs uppercase tracking-wider">
          🌐 Website / Social
        </Label>
        <Input
          value={website}
          onChange={(e) => setWebsite(e.target.value)}
          placeholder="https://yoursite.com"
          className="h-11 bg-white/5 border-white/10 text-white placeholder:text-white/25 rounded-xl"
        />
      </div>
    </div>
  );
}

// ── Step 5: Review ──────────────────────────────────────────────────────────
function Step5({
  displayName,
  gender,
  birthday,
  location,
  relationshipStatus,
  avatarPreview,
  interests,
  hobbies,
  bio,
}: {
  displayName: string;
  gender: string;
  birthday: string;
  location: string;
  relationshipStatus: string;
  avatarPreview: string;
  interests: string;
  hobbies: string;
  bio: string;
}) {
  const calcAge = (b: string) => {
    if (!b) return null;
    return Math.abs(
      new Date(Date.now() - new Date(b).getTime()).getUTCFullYear() - 1970,
    );
  };
  const age = calcAge(birthday);

  return (
    <div className="flex flex-col gap-5">
      {/* Profile preview card */}
      <div
        className="rounded-2xl overflow-hidden relative"
        style={{
          background:
            "linear-gradient(135deg, rgba(236,72,153,0.15), rgba(168,85,247,0.15))",
          border: "1px solid rgba(236,72,153,0.3)",
        }}
      >
        <div className="p-4 flex items-center gap-4">
          <div className="w-16 h-16 rounded-full overflow-hidden bg-gradient-to-br from-pink-500 to-purple-600 flex items-center justify-center shrink-0">
            {avatarPreview ? (
              <img
                src={avatarPreview}
                alt="Preview"
                className="w-full h-full object-cover"
              />
            ) : (
              <span className="text-white text-2xl font-bold">
                {displayName?.[0]?.toUpperCase()}
              </span>
            )}
          </div>
          <div>
            <h3 className="text-white font-bold text-lg">{displayName}</h3>
            <p className="text-white/50 text-sm">
              {[gender, age ? `${age} yrs` : null, location]
                .filter(Boolean)
                .join(" · ")}
            </p>
            {relationshipStatus && (
              <span
                className="inline-block mt-1 px-2.5 py-0.5 rounded-full text-xs font-medium text-white"
                style={{
                  background: "linear-gradient(90deg, #ec4899, #a855f7)",
                }}
              >
                {relationshipStatus}
              </span>
            )}
          </div>
        </div>

        {(interests || hobbies) && (
          <div className="px-4 pb-4 flex flex-wrap gap-1.5">
            {interests
              .split(",")
              .filter(Boolean)
              .slice(0, 3)
              .map((i) => (
                <span
                  key={i}
                  className="px-2.5 py-1 rounded-full text-xs text-white"
                  style={{
                    background: "linear-gradient(90deg, #ec4899, #a855f7)",
                  }}
                >
                  {i.trim()}
                </span>
              ))}
            {hobbies
              .split(",")
              .filter(Boolean)
              .slice(0, 2)
              .map((h) => (
                <span
                  key={h}
                  className="px-2.5 py-1 rounded-full text-xs text-white"
                  style={{
                    background: "linear-gradient(90deg, #10b981, #06b6d4)",
                  }}
                >
                  {h.trim()}
                </span>
              ))}
          </div>
        )}
      </div>

      {/* Trial info */}
      <div
        className="rounded-2xl p-4 flex items-start gap-3"
        style={{
          background:
            "linear-gradient(135deg, rgba(245,158,11,0.15), rgba(251,191,36,0.1))",
          border: "1px solid rgba(245,158,11,0.3)",
        }}
      >
        <span className="text-2xl">🎁</span>
        <div>
          <p className="text-yellow-300 font-bold text-sm">
            2-Month Premium Trial Included!
          </p>
          <p className="text-yellow-200/60 text-xs mt-0.5">
            Enjoy Profile Verification, Stylish Layouts, Carousel Uploads, and
            Profile Boost — free for 60 days.
          </p>
        </div>
      </div>

      {bio && (
        <div className="bg-white/5 border border-white/10 rounded-xl p-3">
          <p className="text-white/40 text-xs mb-1">Bio</p>
          <p className="text-white/70 text-sm">{bio}</p>
        </div>
      )}
    </div>
  );
}
