import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import type { Principal } from "@icp-sdk/core/principal";
import { ArrowLeft, Heart, Search, X } from "lucide-react";
import { useState } from "react";
import { useGetAllProfiles } from "../hooks/useQueries";

type FilterKey = "age" | "gender" | "distance" | "online" | "verified" | null;

interface SearchScreenProps {
  onBack: () => void;
  onProfileClick?: (p: Principal) => void;
}

export default function SearchScreen({
  onBack,
  onProfileClick,
}: SearchScreenProps) {
  const [query, setQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState<FilterKey>(null);
  const [ageMin, setAgeMin] = useState(18);
  const [ageMax, setAgeMax] = useState(50);
  const [gender, setGender] = useState<"all" | "male" | "female">("all");
  const [distance, setDistance] = useState([50]);
  const [onlineOnly, setOnlineOnly] = useState(false);
  const [verifiedOnly, setVerifiedOnly] = useState(false);

  const { data: profiles, isLoading } = useGetAllProfiles();

  const filtered = (profiles ?? []).filter(([, profile]) => {
    if (
      query.trim() &&
      !profile.displayName.toLowerCase().includes(query.toLowerCase())
    )
      return false;
    if (gender !== "all" && profile.gender && profile.gender !== gender)
      return false;
    return true;
  });

  const toggleFilter = (key: FilterKey) => {
    setActiveFilter((prev) => (prev === key ? null : key));
  };

  const chips: { key: FilterKey; label: string }[] = [
    { key: "age", label: "Age Range" },
    { key: "gender", label: "Gender" },
    { key: "distance", label: "Distance" },
    { key: "online", label: "Online Now" },
    { key: "verified", label: "Verified" },
  ];

  return (
    <div
      data-ocid="search.page"
      className="flex flex-col h-full bg-[#0a0a0f] text-white"
    >
      {/* Header */}
      <div className="flex items-center gap-3 px-4 pt-5 pb-3 shrink-0">
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
            className="pl-9 bg-white/8 border-white/10 text-white placeholder:text-white/30 h-10 rounded-full"
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
      </div>

      {/* Filter chips */}
      <div className="flex gap-2 px-4 overflow-x-auto no-scrollbar pb-3 shrink-0">
        {chips.map(({ key, label }) => (
          <button
            key={key}
            type="button"
            data-ocid="search.tab"
            onClick={() => toggleFilter(key)}
            className={`shrink-0 px-3 py-1.5 rounded-full text-xs font-semibold border transition-all ${
              activeFilter === key
                ? "bg-gradient-to-r from-pink-500 to-purple-600 border-transparent text-white"
                : "bg-white/5 border-white/10 text-white/60 hover:border-white/20"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Inline filter panel */}
      {activeFilter && (
        <div className="mx-4 mb-3 bg-[#1a1a2e] border border-white/10 rounded-2xl p-4 shrink-0">
          {activeFilter === "age" && (
            <div className="flex flex-col gap-3">
              <p className="text-xs text-white/50 font-semibold uppercase tracking-wider">
                Age Range
              </p>
              <div className="flex gap-3">
                <div className="flex flex-col gap-1 flex-1">
                  <Label className="text-white/50 text-xs">Min Age</Label>
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
                  <Label className="text-white/50 text-xs">Max Age</Label>
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
          )}
          {activeFilter === "gender" && (
            <div className="flex flex-col gap-3">
              <p className="text-xs text-white/50 font-semibold uppercase tracking-wider">
                Gender
              </p>
              <div className="flex gap-2">
                {(["all", "male", "female"] as const).map((g) => (
                  <button
                    key={g}
                    type="button"
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
          )}
          {activeFilter === "distance" && (
            <div className="flex flex-col gap-3">
              <p className="text-xs text-white/50 font-semibold uppercase tracking-wider">
                Distance: {distance[0]}km
              </p>
              <Slider
                data-ocid="search.toggle"
                min={1}
                max={100}
                value={distance}
                onValueChange={setDistance}
                className="w-full"
              />
            </div>
          )}
          {activeFilter === "online" && (
            <div className="flex items-center justify-between">
              <p className="text-sm text-white/70">Online Now Only</p>
              <Switch
                data-ocid="search.switch"
                checked={onlineOnly}
                onCheckedChange={setOnlineOnly}
              />
            </div>
          )}
          {activeFilter === "verified" && (
            <div className="flex items-center justify-between">
              <p className="text-sm text-white/70">Verified Profiles Only</p>
              <Switch
                data-ocid="search.switch"
                checked={verifiedOnly}
                onCheckedChange={setVerifiedOnly}
              />
            </div>
          )}
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
    </div>
  );
}
