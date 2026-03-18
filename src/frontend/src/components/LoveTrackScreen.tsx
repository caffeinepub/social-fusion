import { ArrowLeft, Pause, Play } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import type { Profile } from "../backend";
import { useGetAllProfiles } from "../hooks/useQueries";
import LoveBubble from "./LoveBubble";
import TrainAnimation from "./TrainAnimation";

interface LoveTrackScreenProps {
  onClose: () => void;
}

const STOPS = [
  { id: "delhi", name: "Delhi", x: 5 },
  { id: "jaipur", name: "Jaipur", x: 25 },
  { id: "mumbai", name: "Mumbai", x: 45 },
  { id: "kolkata", name: "Kolkata", x: 65 },
  { id: "chennai", name: "Chennai", x: 85 },
];

const LOVE_MESSAGES = [
  "Looking for my soulmate 💕",
  "Serious relationship only ❤️",
  "Finding true love 🌹",
  "Ready for marriage 💍",
  "Soulmates forever 💞",
];

const PLACEHOLDER_PROFILES = [
  {
    name: "Priya S.",
    location: "Delhi",
    avatar: "",
    interests: ["Music", "Travel"],
    message: LOVE_MESSAGES[0],
  },
  {
    name: "Ananya K.",
    location: "Mumbai",
    avatar: "",
    interests: ["Reading", "Yoga"],
    message: LOVE_MESSAGES[1],
  },
  {
    name: "Meera R.",
    location: "Chennai",
    avatar: "",
    interests: ["Cooking", "Dance"],
    message: LOVE_MESSAGES[2],
  },
  {
    name: "Kavya M.",
    location: "Kolkata",
    avatar: "",
    interests: ["Art", "Poetry"],
    message: LOVE_MESSAGES[3],
  },
  {
    name: "Sneha P.",
    location: "Jaipur",
    avatar: "",
    interests: ["Fitness", "Movies"],
    message: LOVE_MESSAGES[4],
  },
];

type JourneyState = "moving" | "arrived";

interface BubbleProfile {
  name: string;
  location: string;
  avatar: string;
  interests: string[];
  message: string;
  bubbleX: number;
  bubbleDelay: number;
}

function profileToBubble(
  entry:
    | [import("@icp-sdk/core/principal").Principal, Profile]
    | (typeof PLACEHOLDER_PROFILES)[0],
  stopName: string,
): BubbleProfile {
  if (Array.isArray(entry)) {
    const rp = entry[1] as Profile;
    const interests = [
      ...(rp.interests
        ? rp.interests
            .split(",")
            .map((s: string) => s.trim())
            .filter(Boolean)
        : []),
      ...(rp.hobbies
        ? rp.hobbies
            .split(",")
            .map((s: string) => s.trim())
            .filter(Boolean)
        : []),
    ].slice(0, 3);
    return {
      name: rp.displayName || "User",
      location: rp.location || stopName,
      avatar: "",
      interests,
      message: LOVE_MESSAGES[Math.floor(Math.random() * LOVE_MESSAGES.length)],
      bubbleX: 0,
      bubbleDelay: 0,
    };
  }
  return { ...entry, bubbleX: 0, bubbleDelay: 0 };
}

export default function LoveTrackScreen({ onClose }: LoveTrackScreenProps) {
  const { data: allProfiles } = useGetAllProfiles();
  const [journeyState, setJourneyState] = useState<JourneyState>("moving");
  const [currentStopIndex, setCurrentStopIndex] = useState(0);
  const [trainPosition, setTrainPosition] = useState(STOPS[0].x);
  const [isPaused, setIsPaused] = useState(false);
  const [visibleBubbles, setVisibleBubbles] = useState<BubbleProfile[]>([]);
  const [selectedBubble, setSelectedBubble] = useState<BubbleProfile | null>(
    null,
  );
  const [arrivalBanner, setArrivalBanner] = useState("");
  const [showBanner, setShowBanner] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const bgStyleInjected = useRef(false);

  useEffect(() => {
    if (bgStyleInjected.current) return;
    bgStyleInjected.current = true;
    const id = "love-track-bg-styles";
    if (document.getElementById(id)) return;
    const style = document.createElement("style");
    style.id = id;
    style.textContent = `
      @keyframes floatHeart {
        0% { opacity: 0; transform: translateY(0) scale(0.6) rotate(-10deg); }
        20% { opacity: 0.7; }
        80% { opacity: 0.4; }
        100% { opacity: 0; transform: translateY(-120px) scale(1.2) rotate(10deg); }
      }
      @keyframes arrivalSlide {
        0% { opacity: 0; transform: translateY(-20px); }
        15% { opacity: 1; transform: translateY(0); }
        75% { opacity: 1; transform: translateY(0); }
        100% { opacity: 0; transform: translateY(-12px); }
      }
      .bg-heart {
        position: absolute;
        pointer-events: none;
        animation: floatHeart linear infinite;
        will-change: transform, opacity;
      }
      .arrival-banner {
        animation: arrivalSlide 2.5s ease-in-out forwards;
      }
    `;
    document.head.appendChild(style);
  }, []);

  // Journey loop
  useEffect(() => {
    if (isPaused) return;

    if (journeyState === "moving") {
      const target = STOPS[currentStopIndex];
      setTrainPosition(target.x);

      timerRef.current = setTimeout(() => {
        setJourneyState("arrived");
        setArrivalBanner(`📍 Arriving at ${target.name}`);
        setShowBanner(true);

        // Build bubbles for this stop
        const profiles =
          allProfiles && allProfiles.length > 0
            ? allProfiles
            : PLACEHOLDER_PROFILES;
        const stopProfiles = profiles
          .filter((_, idx) => idx % STOPS.length === currentStopIndex)
          .slice(0, 4);
        const fallback = profiles.slice(0, 3);
        const source = stopProfiles.length > 0 ? stopProfiles : fallback;

        const bubbles: BubbleProfile[] = source.map((p, i) => {
          const base = profileToBubble(
            p as [import("@icp-sdk/core/principal").Principal, Profile],
            target.name,
          );
          const positions = [15, 35, 55, 75];
          return {
            ...base,
            bubbleX: positions[i % positions.length],
            bubbleDelay: i * 0.4,
          };
        });
        setVisibleBubbles(bubbles);

        // Hide banner
        timerRef.current = setTimeout(() => setShowBanner(false), 2500);
      }, 2800);
    } else if (journeyState === "arrived") {
      timerRef.current = setTimeout(() => {
        setVisibleBubbles([]);
        setSelectedBubble(null);
        const nextIndex = (currentStopIndex + 1) % STOPS.length;
        setCurrentStopIndex(nextIndex);
        setJourneyState("moving");
      }, 5000);
    }

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [journeyState, currentStopIndex, isPaused, allProfiles]);

  const bgHearts = [
    { left: "8%", bottom: "30%", size: 16, dur: "6s", delay: "0s" },
    { left: "20%", bottom: "10%", size: 12, dur: "8s", delay: "1.5s" },
    { left: "40%", bottom: "50%", size: 14, dur: "7s", delay: "0.8s" },
    { left: "60%", bottom: "20%", size: 18, dur: "9s", delay: "2s" },
    { left: "78%", bottom: "40%", size: 11, dur: "6.5s", delay: "3s" },
    { left: "90%", bottom: "15%", size: 15, dur: "7.5s", delay: "0.3s" },
  ];

  return (
    <div
      data-ocid="love_track.page"
      className="fixed inset-0 flex flex-col overflow-hidden"
      style={{
        zIndex: 50,
        background:
          "linear-gradient(180deg, #0d0015 0%, #1a0030 50%, #0d001f 100%)",
      }}
    >
      {/* Background floating hearts */}
      {bgHearts.map((h) => (
        <span
          key={h.left}
          className="bg-heart"
          style={{
            left: h.left,
            bottom: h.bottom,
            fontSize: `${h.size}px`,
            animationDuration: h.dur,
            animationDelay: h.delay,
          }}
        >
          ❤️
        </span>
      ))}

      {/* Header */}
      <div
        className="flex items-center justify-between px-4 py-3 shrink-0"
        style={{
          background: "rgba(13, 0, 21, 0.8)",
          backdropFilter: "blur(12px)",
          borderBottom: "1px solid rgba(236, 72, 153, 0.2)",
        }}
      >
        <button
          type="button"
          data-ocid="love_track.close_button"
          onClick={onClose}
          className="w-9 h-9 rounded-full flex items-center justify-center"
          style={{ background: "rgba(255,255,255,0.08)" }}
        >
          <ArrowLeft className="w-5 h-5 text-white" />
        </button>

        <div className="flex flex-col items-center">
          <h1
            className="font-bold text-base"
            style={{
              background: "linear-gradient(90deg, #f472b6, #c084fc, #f472b6)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
            }}
          >
            Love Track 💕
          </h1>
          <span className="text-xs" style={{ color: "rgba(255,255,255,0.4)" }}>
            {journeyState === "moving"
              ? "🚂 On the way..."
              : `📍 ${STOPS[currentStopIndex].name}`}
          </span>
        </div>

        <button
          type="button"
          data-ocid="love_track.toggle"
          onClick={() => setIsPaused((p) => !p)}
          className="w-9 h-9 rounded-full flex items-center justify-center"
          style={{
            background: isPaused
              ? "linear-gradient(135deg, #ec4899, #a855f7)"
              : "rgba(255,255,255,0.08)",
          }}
        >
          {isPaused ? (
            <Play className="w-4 h-4 text-white" />
          ) : (
            <Pause className="w-4 h-4 text-white/70" />
          )}
        </button>
      </div>

      {/* Arrival banner */}
      {showBanner && (
        <div
          className="arrival-banner absolute left-0 right-0 mx-auto px-4 py-2 rounded-xl text-center"
          style={{
            top: "70px",
            maxWidth: "260px",
            left: "50%",
            transform: "translateX(-50%)",
            background:
              "linear-gradient(135deg, rgba(236,72,153,0.25), rgba(168,85,247,0.25))",
            border: "1px solid rgba(236,72,153,0.5)",
            backdropFilter: "blur(8px)",
            zIndex: 20,
          }}
        >
          <span className="text-white text-sm font-semibold">
            {arrivalBanner}
          </span>
        </div>
      )}

      {/* Main content — bubbles */}
      <div className="flex-1 relative overflow-hidden">
        {journeyState === "arrived" &&
          visibleBubbles.map((bubble, i) => (
            <LoveBubble
              key={`${bubble.name}-${i}`}
              profile={bubble}
              delay={bubble.bubbleDelay}
              x={bubble.bubbleX}
              isSelected={selectedBubble?.name === bubble.name}
              onClick={() =>
                setSelectedBubble((prev) =>
                  prev?.name === bubble.name ? null : bubble,
                )
              }
            />
          ))}

        {journeyState === "moving" && (
          <div className="flex flex-col items-center justify-center h-full gap-3">
            <div
              className="text-4xl"
              style={{ animation: "trainBounce 0.5s ease-in-out infinite" }}
            >
              🚂
            </div>
            <p
              className="text-sm font-medium"
              style={{
                background: "linear-gradient(90deg, #f472b6, #c084fc)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}
            >
              Heading to {STOPS[currentStopIndex].name}...
            </p>
          </div>
        )}
      </div>

      {/* Track section */}
      <div
        className="shrink-0"
        style={{
          background: "rgba(13, 0, 21, 0.9)",
          borderTop: "1px solid rgba(236, 72, 153, 0.15)",
        }}
      >
        <TrainAnimation
          stops={STOPS}
          currentStopIndex={currentStopIndex}
          isMoving={journeyState === "moving" && !isPaused}
          trainPosition={trainPosition}
        />
      </div>

      {/* Selected profile bottom sheet */}
      {selectedBubble && (
        <div
          data-ocid="love_track.modal"
          className="fixed inset-x-0 bottom-0 rounded-t-3xl p-5 flex flex-col gap-4"
          style={{
            zIndex: 60,
            background: "linear-gradient(180deg, #1a0030 0%, #0d0015 100%)",
            border: "1px solid rgba(236, 72, 153, 0.3)",
            boxShadow: "0 -8px 40px rgba(236, 72, 153, 0.2)",
            maxHeight: "55vh",
          }}
        >
          {/* Handle */}
          <div
            className="mx-auto rounded-full"
            style={{
              width: "40px",
              height: "4px",
              background: "rgba(255,255,255,0.2)",
            }}
          />

          <div className="flex items-center gap-4">
            {/* Avatar */}
            <div
              className="rounded-full overflow-hidden shrink-0"
              style={{
                width: "70px",
                height: "70px",
                border: "2.5px solid rgba(236, 72, 153, 0.7)",
                boxShadow: "0 0 16px rgba(236,72,153,0.4)",
              }}
            >
              {selectedBubble.avatar ? (
                <img
                  src={selectedBubble.avatar}
                  alt={selectedBubble.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div
                  className="w-full h-full flex items-center justify-center text-2xl text-white"
                  style={{
                    background: "linear-gradient(135deg, #ec4899, #a855f7)",
                  }}
                >
                  {selectedBubble.name.charAt(0)}
                </div>
              )}
            </div>

            <div className="flex-1 min-w-0">
              <h2 className="text-white font-bold text-lg">
                {selectedBubble.name}
              </h2>
              <p className="text-pink-300 text-sm">
                📍 {selectedBubble.location}
              </p>
              <p className="text-purple-300 text-xs mt-0.5 italic">
                {selectedBubble.message}
              </p>
            </div>
          </div>

          {/* Interests */}
          {selectedBubble.interests.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {selectedBubble.interests.map((interest) => (
                <span
                  key={interest}
                  className="px-3 py-1 rounded-full text-white text-xs font-medium"
                  style={{
                    background: "linear-gradient(90deg, #ec4899, #a855f7)",
                  }}
                >
                  {interest}
                </span>
              ))}
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3">
            <button
              type="button"
              data-ocid="love_track.confirm_button"
              className="flex-1 py-3 rounded-2xl text-white font-semibold text-sm"
              style={{
                background: "linear-gradient(135deg, #ec4899, #a855f7)",
              }}
            >
              Send Heart ❤️
            </button>
            <button
              type="button"
              data-ocid="love_track.cancel_button"
              onClick={() => setSelectedBubble(null)}
              className="px-6 py-3 rounded-2xl text-white/70 text-sm"
              style={{ background: "rgba(255,255,255,0.08)" }}
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* Backdrop for selected bubble */}
      {selectedBubble && (
        <button
          type="button"
          aria-label="Close profile"
          className="fixed inset-0"
          style={{ zIndex: 55, background: "rgba(0,0,0,0.5)" }}
          onClick={() => setSelectedBubble(null)}
        />
      )}
    </div>
  );
}
