import type { Principal } from "@icp-sdk/core/principal";
import { Crown } from "lucide-react";
import { motion } from "motion/react";
import { useEffect, useRef, useState } from "react";
import type { Profile } from "../backend";

interface Props {
  profiles: Array<[Principal, Profile]>;
  onUserClick: (p: Principal) => void;
}

export default function SpotlightSection({ profiles, onUserClick }: Props) {
  const [activeIdx, setActiveIdx] = useState(0);
  const scrollRef = useRef<HTMLDivElement>(null);

  const premiumProfiles = profiles
    .filter((_, i) => i % 3 === 0 || i < 3)
    .slice(0, 8);

  // Active index cycle for golden highlight
  useEffect(() => {
    if (premiumProfiles.length === 0) return;
    const t = setInterval(() => {
      setActiveIdx((i) => (i + 1) % premiumProfiles.length);
    }, 3000);
    return () => clearInterval(t);
  }, [premiumProfiles.length]);

  // Auto-scroll horizontally every 3s
  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    const t = setInterval(() => {
      const maxScroll = el.scrollWidth - el.clientWidth;
      if (maxScroll <= 0) return;
      if (el.scrollLeft >= maxScroll - 5) {
        el.scrollTo({ left: 0, behavior: "smooth" });
      } else {
        el.scrollBy({ left: 80, behavior: "smooth" });
      }
    }, 3000);
    return () => clearInterval(t);
  }, []);

  if (premiumProfiles.length === 0) return null;

  return (
    <div className="px-4 pt-3 pb-2">
      <div className="flex items-center gap-1.5 mb-2">
        <Crown className="w-3.5 h-3.5 text-yellow-400" />
        <p className="text-white/60 text-xs font-semibold uppercase tracking-widest">
          Spotlight
        </p>
      </div>
      <div
        ref={scrollRef}
        className="flex gap-3 overflow-x-auto no-scrollbar pb-1"
      >
        {premiumProfiles.map(([principal, profile], i) => (
          <motion.button
            key={principal.toString()}
            type="button"
            onClick={() => onUserClick(principal)}
            className="flex flex-col items-center gap-1.5 shrink-0"
            whileTap={{ scale: 0.9 }}
          >
            <div
              className="relative w-16 h-16 rounded-full p-[2px]"
              style={{
                background:
                  i === activeIdx
                    ? "linear-gradient(135deg, #fbbf24, #f59e0b, #fbbf24)"
                    : "linear-gradient(135deg, #ec4899, #a855f7)",
                animation:
                  i === activeIdx
                    ? "goldenPulse 1.5s ease-in-out infinite"
                    : "none",
                boxShadow:
                  i === activeIdx ? "0 0 16px rgba(251,191,36,0.6)" : "none",
              }}
            >
              <div className="w-full h-full rounded-full overflow-hidden bg-[#0a0a0f]">
                {profile.avatar ? (
                  <img
                    src={profile.avatar.getDirectURL()}
                    alt={profile.displayName}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full rounded-full bg-gradient-to-br from-yellow-500/30 to-orange-500/30 flex items-center justify-center text-white text-sm font-bold">
                    {profile.displayName[0]?.toUpperCase()}
                  </div>
                )}
              </div>
              {i === activeIdx && (
                <span className="absolute -top-1 -right-1 text-xs">👑</span>
              )}
            </div>
            <span className="text-white/60 text-[10px] w-16 text-center truncate">
              {profile.displayName}
            </span>
          </motion.button>
        ))}
      </div>
    </div>
  );
}
