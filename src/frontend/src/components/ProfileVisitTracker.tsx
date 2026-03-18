import { Eye } from "lucide-react";
import { useEffect } from "react";

export const VISIT_KEY = "socialFusionProfileVisits";

interface Visit {
  principalStr: string;
  displayName: string;
  avatarUrl?: string;
  timestamp: number;
}

export function recordVisit(
  targetPrincipal: string,
  myPrincipal: string,
  displayName: string,
  avatarUrl?: string,
) {
  if (targetPrincipal === myPrincipal) return;
  try {
    const raw = localStorage.getItem(VISIT_KEY) ?? "{}";
    const data = JSON.parse(raw) as Record<string, Visit[]>;
    const visits = data[targetPrincipal] ?? [];
    // Avoid duplicate within 10 min
    const recent = visits.filter(
      (v) =>
        v.principalStr !== myPrincipal ||
        Date.now() - v.timestamp > 10 * 60_000,
    );
    recent.unshift({
      principalStr: myPrincipal,
      displayName,
      avatarUrl,
      timestamp: Date.now(),
    });
    data[targetPrincipal] = recent.slice(0, 50);
    localStorage.setItem(VISIT_KEY, JSON.stringify(data));
  } catch {}
}

export function getMyVisitors(myPrincipal: string): Visit[] {
  try {
    const raw = localStorage.getItem(VISIT_KEY) ?? "{}";
    const data = JSON.parse(raw) as Record<string, Visit[]>;
    return data[myPrincipal] ?? [];
  } catch {
    return [];
  }
}

export function ProfileVisitBanner({
  myPrincipal,
}: {
  myPrincipal: string;
}) {
  const visitors = getMyVisitors(myPrincipal).slice(0, 10);

  if (visitors.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-8 gap-2">
        <Eye className="w-8 h-8 text-white/15" />
        <p className="text-white/30 text-sm">No profile views yet</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-2 py-3">
      {visitors.map((v, i) => {
        const diff = Date.now() - v.timestamp;
        const when =
          diff < 60_000
            ? "just now"
            : diff < 3_600_000
              ? `${Math.floor(diff / 60_000)}m ago`
              : diff < 86_400_000
                ? `${Math.floor(diff / 3_600_000)}h ago`
                : new Date(v.timestamp).toLocaleDateString();

        return (
          <div
            key={`${v.principalStr}-${i}`}
            className="flex items-center gap-3 bg-white/5 rounded-xl p-3"
          >
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-sm font-bold text-white shrink-0 overflow-hidden">
              {v.avatarUrl ? (
                <img
                  src={v.avatarUrl}
                  alt={v.displayName}
                  className="w-full h-full object-cover"
                />
              ) : (
                v.displayName[0]?.toUpperCase()
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-white text-sm font-semibold truncate">
                {v.displayName}
              </p>
              <p className="text-white/40 text-xs">
                👁️ Viewed your profile • {when}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
}

export function useProfileVisit(
  targetPrincipal: string | undefined,
  myPrincipal: string | undefined,
  displayName: string,
  avatarUrl?: string,
) {
  // biome-ignore lint/correctness/useExhaustiveDependencies: intentional - only re-run on principal change
  useEffect(() => {
    if (targetPrincipal && myPrincipal) {
      recordVisit(targetPrincipal, myPrincipal, displayName, avatarUrl);
    }
  }, [targetPrincipal, myPrincipal]);
}
