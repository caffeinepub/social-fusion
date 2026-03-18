import { useEffect, useRef } from "react";

interface TrainStop {
  id: string;
  name: string;
  x: number;
}

interface TrainAnimationProps {
  stops: TrainStop[];
  currentStopIndex: number;
  isMoving: boolean;
  trainPosition: number;
}

export default function TrainAnimation({
  stops,
  currentStopIndex,
  isMoving,
  trainPosition,
}: TrainAnimationProps) {
  const styleInjected = useRef(false);

  useEffect(() => {
    if (styleInjected.current) return;
    styleInjected.current = true;
    const id = "train-animation-styles";
    if (document.getElementById(id)) return;
    const style = document.createElement("style");
    style.id = id;
    style.textContent = `
      @keyframes stationPulse {
        0%, 100% { box-shadow: 0 0 0 0 rgba(236, 72, 153, 0.7); transform: scale(1); }
        50% { box-shadow: 0 0 0 8px rgba(236, 72, 153, 0); transform: scale(1.15); }
      }
      @keyframes trackGlow {
        0%, 100% { opacity: 0.6; }
        50% { opacity: 1; }
      }
      @keyframes trainBounce {
        0%, 100% { transform: translateY(0px); }
        50% { transform: translateY(-3px); }
      }
      @keyframes smokeFloat {
        0% { opacity: 0.8; transform: translateY(0) scale(0.8); }
        100% { opacity: 0; transform: translateY(-20px) scale(1.5); }
      }
      @keyframes heartTrack {
        0% { opacity: 0; transform: translateY(0) scale(0.5); }
        40% { opacity: 1; transform: translateY(-12px) scale(1); }
        100% { opacity: 0; transform: translateY(-28px) scale(0.7); }
      }
      .station-pulse {
        animation: stationPulse 1.5s ease-in-out infinite;
      }
      .train-bounce {
        animation: trainBounce 0.5s ease-in-out infinite;
      }
      .train-still {
        animation: none;
      }
      .track-glow {
        animation: trackGlow 2s ease-in-out infinite;
      }
      .smoke-puff {
        animation: smokeFloat 1s ease-out infinite;
      }
      .heart-track {
        animation: heartTrack 2s ease-out infinite;
      }
    `;
    document.head.appendChild(style);
  }, []);

  return (
    <div
      className="relative w-full"
      style={{ height: "140px", padding: "0 24px" }}
    >
      {/* Track line */}
      <div
        className="absolute track-glow"
        style={{
          top: "60px",
          left: "24px",
          right: "24px",
          height: "4px",
          background: "linear-gradient(90deg, #ec4899, #a855f7, #ec4899)",
          borderRadius: "2px",
          boxShadow:
            "0 0 12px rgba(236, 72, 153, 0.6), 0 0 24px rgba(168, 85, 247, 0.3)",
        }}
      />

      {/* Track ties */}
      {Array.from({ length: 12 }, (_, i) => i).map((i) => (
        <div
          key={`tie-${i}`}
          className="absolute"
          style={{
            top: "56px",
            left: `calc(24px + ${(i / 11) * 100}% * (100% - 48px) / 100%)`,
            width: "3px",
            height: "12px",
            background: "rgba(168, 85, 247, 0.4)",
            borderRadius: "1px",
          }}
        />
      ))}

      {/* Floating hearts on track */}
      {[15, 35, 55, 75].map((pos) => (
        <span
          key={`heart-${pos}`}
          className="heart-track absolute text-xs"
          style={{
            left: `calc(24px + ${pos}% * (100% - 48px) / 100%)`,
            top: "42px",
            animationDelay: `${[15, 35, 55, 75].indexOf(pos) * 0.5}s`,
            fontSize: "10px",
          }}
        >
          ❤️
        </span>
      ))}

      {/* Station stops */}
      {stops.map((stop, idx) => {
        const isActive = idx === currentStopIndex;
        const isPassed = idx < currentStopIndex;
        return (
          <div
            key={stop.id}
            className="absolute flex flex-col items-center"
            style={{
              left: `calc(24px + ${stop.x}% * (100% - 48px) / 100%)`,
              top: "46px",
              transform: "translateX(-50%)",
            }}
          >
            {/* Station dot */}
            <div
              className={isActive ? "station-pulse" : ""}
              style={{
                width: isActive ? "18px" : "12px",
                height: isActive ? "18px" : "12px",
                borderRadius: "50%",
                background: isPassed
                  ? "linear-gradient(135deg, #ec4899, #a855f7)"
                  : isActive
                    ? "linear-gradient(135deg, #f472b6, #c084fc)"
                    : "rgba(255,255,255,0.2)",
                border: isActive
                  ? "2px solid rgba(236, 72, 153, 0.9)"
                  : isPassed
                    ? "2px solid rgba(236, 72, 153, 0.5)"
                    : "2px solid rgba(255,255,255,0.3)",
                transition: "all 0.4s ease",
              }}
            />
            {/* Station label */}
            <span
              className="mt-2 text-center"
              style={{
                fontSize: "9px",
                color: isActive
                  ? "#f9a8d4"
                  : isPassed
                    ? "#c084fc"
                    : "rgba(255,255,255,0.4)",
                fontWeight: isActive ? "700" : "400",
                whiteSpace: "nowrap",
              }}
            >
              {stop.name}
            </span>
          </div>
        );
      })}

      {/* Train */}
      <div
        className={`absolute ${isMoving ? "train-bounce" : "train-still"}`}
        style={{
          left: `calc(24px + ${trainPosition}% * (100% - 48px) / 100%)`,
          top: "24px",
          transform: "translateX(-50%) translateZ(0)",
          transition: isMoving
            ? "left 2.5s cubic-bezier(0.4, 0, 0.6, 1)"
            : "left 0.1s",
          willChange: "left",
          fontSize: "28px",
          lineHeight: 1,
          zIndex: 10,
        }}
      >
        {/* Smoke puffs */}
        {isMoving && (
          <>
            <span
              className="smoke-puff absolute text-xs"
              style={{
                top: "-8px",
                left: "2px",
                fontSize: "10px",
                animationDelay: "0s",
              }}
            >
              💨
            </span>
            <span
              className="smoke-puff absolute text-xs"
              style={{
                top: "-12px",
                left: "8px",
                fontSize: "8px",
                animationDelay: "0.3s",
              }}
            >
              💨
            </span>
          </>
        )}
        🚂💕
      </div>
    </div>
  );
}
