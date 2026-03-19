import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import {
  ArrowLeft,
  Phone,
  PhoneIncoming,
  PhoneMissed,
  PhoneOutgoing,
  Video,
} from "lucide-react";
import { motion } from "motion/react";
import { useInternetIdentity } from "../hooks/useInternetIdentity";
import { useGetAllProfiles } from "../hooks/useQueries";

interface Props {
  onBack: () => void;
}

// Simulated call history entries using real profiles
const CALL_TYPES = [
  { type: "incoming", callType: "voice", time: "2h ago" },
  { type: "outgoing", callType: "video", time: "Yesterday" },
  { type: "missed", callType: "voice", time: "2 days ago" },
  { type: "incoming", callType: "video", time: "3 days ago" },
];

export default function CallHistoryScreen({ onBack }: Props) {
  const { data: profiles, isLoading } = useGetAllProfiles();
  const { identity } = useInternetIdentity();
  const myPrincipal = identity?.getPrincipal();

  const otherUsers =
    profiles?.filter(([p]) => p.toString() !== myPrincipal?.toString()) ?? [];

  return (
    <motion.div
      initial={{ opacity: 0, x: 40 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 40 }}
      transition={{ duration: 0.2 }}
      data-ocid="messages.dialog"
      className="flex flex-col h-full bg-[#0a0a0f]"
    >
      {/* Header */}
      <div className="flex items-center gap-3 px-4 pt-5 pb-4 border-b border-white/5 shrink-0">
        <button
          type="button"
          data-ocid="messages.close_button"
          onClick={onBack}
          className="w-9 h-9 rounded-full flex items-center justify-center text-white/70"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h1 className="text-xl font-bold font-display text-white">
          Call History
        </h1>
      </div>

      <div className="flex-1 overflow-y-auto pb-20">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-16 gap-6">
            <div className="w-12 h-12 rounded-full border-4 border-pink-500/30 border-t-pink-500 animate-spin" />
            <div
              data-ocid="messages.loading_state"
              className="flex flex-col gap-3 w-full px-4"
            >
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex items-center gap-3">
                  <Skeleton className="w-12 h-12 rounded-full" />
                  <div className="flex flex-col gap-1.5 flex-1">
                    <Skeleton className="w-28 h-3" />
                    <Skeleton className="w-20 h-2" />
                  </div>
                  <Skeleton className="w-8 h-8 rounded-full" />
                </div>
              ))}
            </div>
          </div>
        ) : otherUsers.length > 0 ? (
          <div className="flex flex-col">
            {otherUsers.slice(0, 10).map(([principal, profile], i) => {
              const callInfo = CALL_TYPES[i % CALL_TYPES.length];
              const isMissed = callInfo.type === "missed";
              return (
                <div
                  key={principal.toString()}
                  data-ocid={`messages.item.${i + 1}`}
                  className="flex items-center gap-3 px-4 py-3.5 hover:bg-white/5 transition-colors"
                >
                  <Avatar className="w-12 h-12 shrink-0">
                    {profile.avatar && (
                      <AvatarImage
                        src={profile.avatar.getDirectURL()}
                        alt={profile.displayName}
                      />
                    )}
                    <AvatarFallback className="bg-gradient-to-br from-purple-600 to-pink-500 text-white font-bold">
                      {profile.displayName[0]?.toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex flex-col flex-1 min-w-0">
                    <p
                      className={`font-semibold text-sm ${
                        isMissed ? "text-red-400" : "text-white"
                      }`}
                    >
                      {profile.displayName}
                    </p>
                    <div className="flex items-center gap-1.5 mt-0.5">
                      {callInfo.type === "incoming" && (
                        <PhoneIncoming className="w-3 h-3 text-green-400" />
                      )}
                      {callInfo.type === "outgoing" && (
                        <PhoneOutgoing className="w-3 h-3 text-blue-400" />
                      )}
                      {callInfo.type === "missed" && (
                        <PhoneMissed className="w-3 h-3 text-red-400" />
                      )}
                      <span className="text-white/30 text-xs capitalize">
                        {callInfo.type} · {callInfo.callType} · {callInfo.time}
                      </span>
                    </div>
                  </div>
                  <button
                    type="button"
                    data-ocid={`messages.secondary_button.${i + 1}`}
                    className="w-9 h-9 rounded-full bg-white/10 flex items-center justify-center"
                  >
                    {callInfo.callType === "video" ? (
                      <Video className="w-4 h-4 text-white/60" />
                    ) : (
                      <Phone className="w-4 h-4 text-white/60" />
                    )}
                  </button>
                </div>
              );
            })}
          </div>
        ) : (
          <div
            data-ocid="messages.empty_state"
            className="flex flex-col items-center justify-center py-24 gap-4 text-center px-8"
          >
            <div className="text-5xl">📞</div>
            <p className="text-white/50 font-semibold">No call history yet</p>
            <p className="text-white/30 text-sm">Your calls will appear here</p>
          </div>
        )}
      </div>
    </motion.div>
  );
}
