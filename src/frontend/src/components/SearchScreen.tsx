import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import type { Principal } from "@icp-sdk/core/principal";
import { ArrowLeft, Heart, Search, SlidersHorizontal, X } from "lucide-react";
import { useState } from "react";
import { usePrivacy } from "../contexts/PrivacyContext";
import { useGetAllProfiles } from "../hooks/useQueries";

interface SearchScreenProps {
  onBack: () => void;
  onProfileClick?: (p: Principal) => void;
}

export default function SearchScreen({
  onBack,
  onProfileClick,
}: SearchScreenProps) {
  const [query, setQuery] = useState("");
  const [filterOpen, setFilterOpen] = useState(false);
  const [ageMin, setAgeMin] = useState(18);
  const [ageMax, setAgeMax] = useState(50);
  const [gender, setGender] = useState<"all" | "male" | "female">("all");
  const [locationFilter, setLocationFilter] = useState("");
  const [selectedInterests, setSelectedInterests] = useState<string[]>([]);
  const [onlineOnly, setOnlineOnly] = useState(false);
  const [verifiedOnly, setVerifiedOnly] = useState(false);

  const { data: profiles, isLoading } = useGetAllProfiles();
  const { isPrivate } = usePrivacy();

  const INTEREST_OPTIONS = [
    "Travel",
    "Music",
    "Fitness",
    "Cooking",
    "Reading",
    "Movies",
    "Sports",
    "Art",
    "Technology",
    "Nature",
  ];

  const filtered = (profiles ?? []).filter(([principal, profile]) => {
    // Filter private profiles
    if (isPrivate(principal.toString())) return false;
    if (
      query.trim() &&
      !profile.displayName.toLowerCase().includes(query.toLowerCase()) &&
      !profile.location?.toLowerCase().includes(query.toLowerCase())
    )
      return false;
    if (gender !== "all" && profile.gender && profile.gender !== gender)
      return false;
    if (
      locationFilter.trim() &&
      !profile.location?.toLowerCase().includes(locationFilter.toLowerCase())
    )
      return false;
    if (selectedInterests.length > 0) {
      const profileInterests = profile.interests?.toLowerCase() ?? "";
      const hasMatch = selectedInterests.some((i) =>
        profileInterests.includes(i.toLowerCase()),
      );
      if (!hasMatch) return false;
    }
    return true;
  });

  const toggleInterest = (interest: string) => {
    setSelectedInterests((prev) =>
      prev.includes(interest)
        ? prev.filter((i) => i !== interest)
        : [...prev, interest],
    );
  };

  const hasActiveFilters =
    gender !== "all" ||
    locationFilter.trim() !== "" ||
    selectedInterests.length > 0 ||
    onlineOnly ||
    verifiedOnly;

  return (
    <div
      data-ocid="search.page"
      className="flex flex-col h-full bg-[#0a0a0f] text-white"
    >
      {/* Header - Search + Filter in one row */}
      <div className="flex items-center gap-2 px-4 pt-5 pb-3 shrink-0">
        <button
          type="button"
          data-ocid="search.close_button"
          onClick={onBack}
          className="w-9 h-9 rounded-full bg-white/10 flex items-center justify-center shrink-0"
        >
          <ArrowLeft className="w-4 h-4" />
        </button>
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
          <Input
            data-ocid="search.search_input"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search people..."
            className="pl-9 bg-white/5 border border-white/20 text-white placeholder:text-white/40 h-10 rounded-full pr-9"
          />
          {query && (
            <button
              type="button"
              onClick={() => setQuery("")}
              className="absolute right-3 top-1/2 -translate-y-1/2"
            >
              <X className="w-3.5 h-3.5 text-white/40" />
            </button>
          )}
        </div>
        {/* Filter icon */}
        <button
          type="button"
          data-ocid="search.toggle"
          onClick={() => setFilterOpen(true)}
          className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 transition-all ${
            hasActiveFilters
              ? "bg-gradient-to-br from-pink-500 to-purple-600"
              : "bg-white/10"
          }`}
          title="Filters"
        >
          <SlidersHorizontal className="w-4 h-4 text-white" />
        </button>
      </div>

      {/* Active filters summary */}
      {hasActiveFilters && (
        <div className="px-4 pb-2 flex flex-wrap gap-1.5 shrink-0">
          {gender !== "all" && (
            <span className="px-2 py-0.5 rounded-full text-xs bg-pink-500/20 text-pink-300 border border-pink-500/30">
              {gender === "male" ? "Male" : "Female"}
            </span>
          )}
          {locationFilter && (
            <span className="px-2 py-0.5 rounded-full text-xs bg-purple-500/20 text-purple-300 border border-purple-500/30">
              📍 {locationFilter}
            </span>
          )}
          {selectedInterests.map((i) => (
            <span
              key={i}
              className="px-2 py-0.5 rounded-full text-xs bg-blue-500/20 text-blue-300 border border-blue-500/30"
            >
              {i}
            </span>
          ))}
          <button
            type="button"
            onClick={() => {
              setGender("all");
              setLocationFilter("");
              setSelectedInterests([]);
              setOnlineOnly(false);
              setVerifiedOnly(false);
            }}
            className="px-2 py-0.5 rounded-full text-xs bg-white/10 text-white/50"
          >
            Clear all
          </button>
        </div>
      )}

      {/* Results */}
      <div className="flex-1 overflow-y-auto pb-6">
        {isLoading ? (
          <div
            data-ocid="search.loading_state"
            className="flex flex-col gap-3 px-4"
          >
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="h-20 bg-white/5 rounded-2xl animate-pulse"
              />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div
            data-ocid="search.empty_state"
            className="flex flex-col items-center justify-center py-20 gap-3"
          >
            <Search className="w-12 h-12 text-white/20" />
            <p className="text-white/40 font-medium">No people found</p>
            <p className="text-white/20 text-sm">Try adjusting your filters</p>
          </div>
        ) : (
          <div className="flex flex-col gap-2 px-4">
            {filtered.map(([principal, profile], i) => (
              <div
                key={principal.toString()}
                data-ocid={`search.item.${i + 1}`}
                className="flex items-center gap-3 bg-white/5 border border-white/5 rounded-2xl p-3"
              >
                <button
                  type="button"
                  onClick={() => onProfileClick?.(principal)}
                  className="flex items-center gap-3 flex-1 min-w-0 text-left"
                >
                  <Avatar className="w-14 h-14 shrink-0">
                    {profile.avatar && (
                      <AvatarImage src={profile.avatar.getDirectURL()} />
                    )}
                    <AvatarFallback className="bg-gradient-to-br from-pink-500 to-purple-600 text-white font-bold">
                      {profile.displayName[0]?.toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex flex-col min-w-0">
                    <p className="font-semibold text-white truncate">
                      {profile.displayName}
                    </p>
                    {profile.bio && (
                      <p className="text-white/40 text-xs truncate mt-0.5">
                        {profile.bio}
                      </p>
                    )}
                    {profile.location && (
                      <p className="text-white/30 text-xs">
                        📍 {profile.location}
                      </p>
                    )}
                  </div>
                </button>
                <Button
                  data-ocid={`search.primary_button.${i + 1}`}
                  size="sm"
                  className="w-9 h-9 p-0 rounded-full bg-gradient-to-br from-pink-500 to-purple-600 border-0 shrink-0"
                >
                  <Heart className="w-4 h-4 text-white" />
                </Button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Filter Bottom Drawer */}
      <Drawer open={filterOpen} onOpenChange={setFilterOpen}>
        <DrawerContent className="bg-[#1a1a2e] border-t border-white/10 text-white">
          <DrawerHeader className="pb-2">
            <DrawerTitle className="text-white text-lg font-bold flex items-center justify-between">
              Filter Profiles
              {hasActiveFilters && (
                <button
                  type="button"
                  onClick={() => {
                    setGender("all");
                    setLocationFilter("");
                    setSelectedInterests([]);
                    setOnlineOnly(false);
                    setVerifiedOnly(false);
                  }}
                  className="text-pink-400 text-sm font-normal"
                >
                  Reset
                </button>
              )}
            </DrawerTitle>
          </DrawerHeader>
          <div className="px-4 pb-8 flex flex-col gap-5 overflow-y-auto max-h-[60dvh]">
            {/* Gender */}
            <div>
              <p className="text-xs text-white/50 font-semibold uppercase tracking-wider mb-2">
                Gender
              </p>
              <div className="flex gap-2">
                {(["all", "male", "female"] as const).map((g) => (
                  <button
                    key={g}
                    type="button"
                    data-ocid="search.radio"
                    onClick={() => setGender(g)}
                    className={`flex-1 py-2 rounded-xl text-sm font-medium transition-all ${
                      gender === g
                        ? "bg-gradient-to-r from-pink-500 to-purple-600 text-white"
                        : "bg-white/5 text-white/50 border border-white/10"
                    }`}
                  >
                    {g === "all" ? "All" : g === "male" ? "Male" : "Female"}
                  </button>
                ))}
              </div>
            </div>

            {/* Age Range */}
            <div>
              <p className="text-xs text-white/50 font-semibold uppercase tracking-wider mb-2">
                Age Range: {ageMin} – {ageMax}
              </p>
              <div className="flex gap-3">
                <div className="flex flex-col gap-1 flex-1">
                  <Label className="text-white/50 text-xs">Min</Label>
                  <Input
                    type="number"
                    min={18}
                    max={80}
                    value={ageMin}
                    onChange={(e) => setAgeMin(Number(e.target.value))}
                    className="bg-white/5 border-white/10 text-white h-9"
                  />
                </div>
                <div className="flex flex-col gap-1 flex-1">
                  <Label className="text-white/50 text-xs">Max</Label>
                  <Input
                    type="number"
                    min={18}
                    max={80}
                    value={ageMax}
                    onChange={(e) => setAgeMax(Number(e.target.value))}
                    className="bg-white/5 border-white/10 text-white h-9"
                  />
                </div>
              </div>
            </div>

            {/* Location */}
            <div>
              <p className="text-xs text-white/50 font-semibold uppercase tracking-wider mb-2">
                Location
              </p>
              <Input
                data-ocid="search.input"
                value={locationFilter}
                onChange={(e) => setLocationFilter(e.target.value)}
                placeholder="City, State, Country..."
                className="bg-white/5 border-white/10 text-white placeholder:text-white/30 h-10"
              />
            </div>

            {/* Interests */}
            <div>
              <p className="text-xs text-white/50 font-semibold uppercase tracking-wider mb-2">
                Interests
              </p>
              <div className="flex flex-wrap gap-2">
                {INTEREST_OPTIONS.map((interest) => (
                  <button
                    key={interest}
                    type="button"
                    data-ocid="search.toggle"
                    onClick={() => toggleInterest(interest)}
                    className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                      selectedInterests.includes(interest)
                        ? "bg-gradient-to-r from-pink-500 to-purple-600 text-white"
                        : "bg-white/5 border border-white/10 text-white/60"
                    }`}
                  >
                    {interest}
                  </button>
                ))}
              </div>
            </div>

            {/* Online / Verified */}
            <div className="flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <p className="text-sm text-white/70">Online Now Only</p>
                <Switch
                  data-ocid="search.switch"
                  checked={onlineOnly}
                  onCheckedChange={setOnlineOnly}
                />
              </div>
              <div className="flex items-center justify-between">
                <p className="text-sm text-white/70">Verified Profiles Only</p>
                <Switch
                  data-ocid="search.switch"
                  checked={verifiedOnly}
                  onCheckedChange={setVerifiedOnly}
                />
              </div>
            </div>

            <Button
              data-ocid="search.primary_button"
              onClick={() => setFilterOpen(false)}
              className="w-full bg-gradient-to-r from-pink-500 to-purple-600 text-white border-0 rounded-2xl h-12 font-semibold"
            >
              Apply Filters
            </Button>
          </div>
        </DrawerContent>
      </Drawer>
    </div>
  );
}
