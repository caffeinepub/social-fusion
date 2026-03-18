import { MapPin } from "lucide-react";
import { useEffect, useRef } from "react";

interface LoveBubbleProps {
  profile: {
    name: string;
    location: string;
    avatar: string;
    interests: string[];
    message: string;
  };
  delay: number;
  x: number;
  isSelected: boolean;
  onClick: () => void;
}

export default function LoveBubble({
  profile,
  delay,
  x,
  isSelected,
  onClick,
}: LoveBubbleProps) {
  const styleInjected = useRef(false);

  useEffect(() => {
    if (styleInjected.current) return;
    styleInjected.current = true;
    const id = "love-bubble-styles";
    if (document.getElementById(id)) return;
    const style = document.createElement("style");
    style.id = id;
    style.textContent = `
      @keyframes bubbleFloat {
        0% { transform: translateY(0px) translateX(0px) scale(1); }
        25% { transform: translateY(-12px) translateX(6px) scale(1.02); }
        50% { transform: translateY(-6px) translateX(-4px) scale(1); }
        75% { transform: translateY(-18px) translateX(3px) scale(1.01); }
        100% { transform: translateY(0px) translateX(0px) scale(1); }
      }
      @keyframes heartPop {
        0% { opacity: 0; transform: scale(0) translateY(0); }
        30% { opacity: 1; transform: scale(1.4) translateY(-8px); }
        70% { opacity: 0.8; transform: scale(1) translateY(-20px); }
        100% { opacity: 0; transform: scale(0.5) translateY(-36px); }
      }
      .love-bubble-float {
        animation: bubbleFloat 4s ease-in-out infinite;
        will-change: transform;
        transform: translateZ(0);
      }
      .heart-particle {
        position: absolute;
        pointer-events: none;
        animation: heartPop 2.5s ease-out infinite;
        will-change: transform, opacity;
      }
    `;
    document.head.appendChild(style);
  }, []);

  const glowStyle = isSelected
    ? "0 0 20px 6px rgba(236, 72, 153, 0.7), 0 0 40px 12px rgba(168, 85, 247, 0.4)"
    : "0 0 10px 3px rgba(236, 72, 153, 0.3), 0 0 20px 6px rgba(168, 85, 247, 0.2)";

  return (
    <button
      type="button"
      data-ocid="love_track.bubble.button"
      className="love-bubble-float absolute flex flex-col items-center cursor-pointer"
      style={{
        left: `${x}%`,
        bottom: "20px",
        animationDelay: `${delay}s`,
        transform: "translateX(-50%) translateZ(0)",
      }}
      onClick={onClick}
    >
      {/* Heart particles */}
      <span
        className="heart-particle text-xs"
        style={{ top: "-10px", left: "0px", animationDelay: `${delay}s` }}
      >
        ❤️
      </span>
      <span
        className="heart-particle text-xs"
        style={{
          top: "-5px",
          right: "-5px",
          animationDelay: `${delay + 0.8}s`,
        }}
      >
        💕
      </span>
      <span
        className="heart-particle text-xs"
        style={{ top: "0px", left: "-10px", animationDelay: `${delay + 1.4}s` }}
      >
        💖
      </span>

      {/* Bubble card */}
      <div
        className="relative flex flex-col items-center p-3 rounded-2xl"
        style={{
          background: "rgba(255,255,255,0.07)",
          backdropFilter: "blur(12px)",
          border: isSelected
            ? "2px solid rgba(236, 72, 153, 0.8)"
            : "1.5px solid rgba(236, 72, 153, 0.4)",
          boxShadow: glowStyle,
          minWidth: "100px",
          maxWidth: "120px",
        }}
      >
        {/* Avatar */}
        <div
          className="rounded-full overflow-hidden mb-2 shrink-0"
          style={{
            width: "52px",
            height: "52px",
            border: "2px solid rgba(236, 72, 153, 0.6)",
            boxShadow: "0 0 10px rgba(236,72,153,0.4)",
          }}
        >
          {profile.avatar ? (
            <img
              src={profile.avatar}
              alt={profile.name}
              className="w-full h-full object-cover"
            />
          ) : (
            <div
              className="w-full h-full flex items-center justify-center text-lg"
              style={{
                background: "linear-gradient(135deg, #ec4899, #a855f7)",
              }}
            >
              {profile.name.charAt(0)}
            </div>
          )}
        </div>

        {/* Name */}
        <p className="text-white text-xs font-semibold text-center leading-tight mb-1 truncate w-full">
          {profile.name}
        </p>

        {/* Location */}
        <div className="flex items-center gap-0.5 mb-1">
          <MapPin className="w-2.5 h-2.5 text-pink-400 shrink-0" />
          <span className="text-pink-300 text-xs truncate">
            {profile.location}
          </span>
        </div>

        {/* Interest tag */}
        {profile.interests[0] && (
          <span
            className="text-xs px-2 py-0.5 rounded-full text-white"
            style={{
              background: "linear-gradient(90deg, #ec4899, #a855f7)",
              fontSize: "9px",
            }}
          >
            {profile.interests[0]}
          </span>
        )}
      </div>
    </button>
  );
}
