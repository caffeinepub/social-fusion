interface Props {
  storyCount: number;
  size?: number;
}

export default function StoryRing({ storyCount, size = 48 }: Props) {
  if (storyCount === 0) return null;

  const strokeWidth = 2.5;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const gapDeg = storyCount > 1 ? 4 : 0;
  const gapFrac = (gapDeg / 360) * circumference;
  const segLen = (circumference - gapFrac * storyCount) / storyCount;
  const cx = size / 2;
  const cy = size / 2;

  // Build segments
  const segments: { offset: number }[] = [];
  for (let i = 0; i < storyCount; i++) {
    segments.push({ offset: i * (segLen + gapFrac) });
  }

  const gradId = `sg-${storyCount}-${size}`;

  return (
    <svg
      width={size}
      height={size}
      className="absolute inset-0 pointer-events-none"
      style={{ zIndex: 2 }}
    >
      <title>Story ring</title>
      <defs>
        <linearGradient id={gradId} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#ec4899" />
          <stop offset="100%" stopColor="#a855f7" />
        </linearGradient>
      </defs>
      {segments.map((seg, i) => (
        <circle
          // biome-ignore lint/suspicious/noArrayIndexKey: segment order is stable
          key={i}
          cx={cx}
          cy={cy}
          r={radius}
          fill="none"
          stroke={`url(#${gradId})`}
          strokeWidth={strokeWidth}
          strokeDasharray={`${segLen} ${circumference - segLen}`}
          strokeDashoffset={-seg.offset + circumference * 0.25}
          strokeLinecap="round"
          transform={`rotate(-90 ${cx} ${cy})`}
        />
      ))}
    </svg>
  );
}
