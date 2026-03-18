interface Props {
  pct: number;
  size?: number;
}

export default function CompatibilityRing({ pct, size = 44 }: Props) {
  const r = (size - 6) / 2;
  const circumference = 2 * Math.PI * r;
  const filled = (pct / 100) * circumference;

  const color = pct >= 70 ? "#22c55e" : pct >= 40 ? "#f59e0b" : "#ec4899";

  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg
        width={size}
        height={size}
        style={{ transform: "rotate(-90deg)" }}
        role="img"
        aria-label={`${pct}% match`}
      >
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke="rgba(255,255,255,0.1)"
          strokeWidth={4}
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke={color}
          strokeWidth={4}
          strokeDasharray={`${filled} ${circumference - filled}`}
          strokeLinecap="round"
          style={{ transition: "stroke-dasharray 0.8s ease" }}
        />
      </svg>
      <div
        className="absolute inset-0 flex items-center justify-center text-[9px] font-bold"
        style={{ color }}
      >
        {pct}%
      </div>
    </div>
  );
}
