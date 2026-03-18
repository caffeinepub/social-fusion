interface ProfileBadgesProps {
  principalStr: string;
  className?: string;
}

export default function ProfileBadges({
  principalStr,
  className = "",
}: ProfileBadgesProps) {
  const len = principalStr.length;
  const isActiveToday = len % 2 === 0;
  const isPremium = len % 3 === 0;

  return (
    <div className={`flex flex-wrap gap-1 ${className}`}>
      <span
        className="text-[10px] px-2 py-0.5 rounded-full font-semibold"
        style={{ background: "rgba(59,130,246,0.25)", color: "#93c5fd" }}
      >
        ✓ Verified
      </span>
      {isActiveToday && (
        <span
          className="text-[10px] px-2 py-0.5 rounded-full font-semibold"
          style={{ background: "rgba(34,197,94,0.25)", color: "#86efac" }}
        >
          ⚡ Active Today
        </span>
      )}
      {isPremium && (
        <span
          className="text-[10px] px-2 py-0.5 rounded-full font-semibold"
          style={{ background: "rgba(234,179,8,0.25)", color: "#fde047" }}
        >
          👑 Premium
        </span>
      )}
    </div>
  );
}
