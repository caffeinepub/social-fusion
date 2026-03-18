import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Mic,
  Music,
  Play,
  QrCode,
  Radio,
  Share2,
  Square,
  Users,
  Video,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useEffect, useRef, useState } from "react";

// ── Feature 1: Live Stream Modal ─────────────────────────────────────────────
export function LiveStreamModal({ onClose }: { onClose: () => void }) {
  const [viewers, setViewers] = useState(0);
  const [isLive, setIsLive] = useState(false);
  const [comments, setComments] = useState<{ user: string; text: string }[]>(
    [],
  );
  useEffect(() => {
    if (!isLive) return;
    const iv = setInterval(() => {
      setViewers((v) => v + Math.floor(Math.random() * 3));
      if (Math.random() > 0.7) {
        const names = ["Priya", "Rohan", "Ananya", "Dev", "Sneha"];
        const texts = [
          "❤️ love this!",
          "🔥 fire!",
          "😍 amazing",
          "Joined!",
          "Hi!",
        ];
        setComments((c) => [
          ...c.slice(-4),
          {
            user: names[Math.floor(Math.random() * names.length)],
            text: texts[Math.floor(Math.random() * texts.length)],
          },
        ]);
      }
    }, 1500);
    return () => clearInterval(iv);
  }, [isLive]);

  return (
    <motion.div
      data-ocid="live.modal"
      className="fixed inset-0 z-50 flex flex-col bg-black"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      {/* Fake camera feed */}
      <div className="flex-1 relative bg-gradient-to-br from-purple-900 to-pink-900 flex items-center justify-center">
        <div
          className="absolute inset-0 opacity-30"
          style={{
            backgroundImage:
              "radial-gradient(circle at 30% 40%, #ff0080 0%, transparent 50%), radial-gradient(circle at 70% 60%, #7c3aed 0%, transparent 50%)",
          }}
        />
        {/* LIVE badge */}
        {isLive && (
          <div className="absolute top-4 left-4 flex items-center gap-1.5 bg-red-600 text-white text-xs font-bold px-3 py-1.5 rounded-full">
            <motion.span
              animate={{ opacity: [1, 0, 1] }}
              transition={{ duration: 1, repeat: Number.POSITIVE_INFINITY }}
              className="w-2 h-2 rounded-full bg-white"
            />
            LIVE
          </div>
        )}
        {/* Viewer count */}
        {isLive && (
          <div className="absolute top-4 right-4 flex items-center gap-1 bg-black/50 backdrop-blur-sm text-white text-xs px-3 py-1.5 rounded-full">
            <Users className="w-3 h-3" />
            {viewers}
          </div>
        )}
        {/* Live comments overlay */}
        <div className="absolute bottom-20 left-4 right-16 flex flex-col gap-1.5">
          <AnimatePresence>
            {comments.map((c) => (
              <motion.div
                key={`${c.user}-${c.text}`}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0 }}
                className="bg-black/40 backdrop-blur-sm text-white text-xs rounded-full px-3 py-1.5 w-fit"
              >
                <span className="font-bold text-pink-300">{c.user}</span>{" "}
                {c.text}
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
        {/* Avatar placeholder */}
        <div className="w-24 h-24 rounded-full bg-white/10 border-2 border-white/20 flex items-center justify-center">
          <Video className="w-10 h-10 text-white/40" />
        </div>
      </div>
      {/* Controls */}
      <div className="bg-black/90 px-4 py-4 flex items-center justify-between">
        <button
          type="button"
          onClick={onClose}
          className="text-white/60 text-sm"
        >
          End
        </button>
        <motion.button
          type="button"
          data-ocid="live.primary_button"
          onClick={() => setIsLive((l) => !l)}
          whileTap={{ scale: 0.95 }}
          className={`px-6 py-3 rounded-full font-bold text-white text-sm ${isLive ? "bg-gray-700" : "bg-gradient-to-r from-red-500 to-pink-600"}`}
        >
          {isLive ? "Stop Live" : "Go Live 🔴"}
        </motion.button>
        <button type="button" className="text-white/60">
          <Share2 className="w-5 h-5" />
        </button>
      </div>
    </motion.div>
  );
}

// ── Feature 2: Status Message ─────────────────────────────────────────────────
const STATUS_PRESETS = [
  "Available ✅",
  "Busy 🔴",
  "At work 💼",
  "Travelling ✈️",
  "Do not disturb 🔕",
  "In a meeting 📅",
  "Looking for match 💕",
];
export function StatusMessageBadge({ status }: { status: string }) {
  if (!status) return null;
  return <span className="text-xs text-white/50 italic">{status}</span>;
}
export function StatusMessagePicker({
  onSave,
}: { onSave: (s: string) => void }) {
  const [open, setOpen] = useState(false);
  const [custom, setCustom] = useState("");
  const save = (s: string) => {
    onSave(s);
    setOpen(false);
  };
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <button
          type="button"
          data-ocid="status.open_modal_button"
          className="text-xs text-pink-400 underline"
        >
          Set status
        </button>
      </DialogTrigger>
      <DialogContent
        data-ocid="status.dialog"
        className="bg-[#1a1a2e] border-white/10 text-white max-w-xs"
      >
        <DialogHeader>
          <DialogTitle>Set Status</DialogTitle>
        </DialogHeader>
        <div className="flex flex-col gap-2">
          {STATUS_PRESETS.map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => save(s)}
              className="text-left px-3 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-sm text-white/80 transition-colors"
            >
              {s}
            </button>
          ))}
          <div className="flex gap-2 mt-2">
            <Input
              data-ocid="status.input"
              value={custom}
              onChange={(e) => setCustom(e.target.value)}
              placeholder="Custom status..."
              className="bg-white/5 border-white/10 text-white flex-1"
            />
            <Button
              onClick={() => save(custom)}
              size="sm"
              className="bg-pink-600 border-0"
            >
              Set
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// ── Feature 10: Video Status ──────────────────────────────────────────────────
export function VideoStatusBubble() {
  const [playing, setPlaying] = useState(false);
  const [showUpload, setShowUpload] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (f) {
      setVideoUrl(URL.createObjectURL(f));
      setShowUpload(false);
    }
  };
  return (
    <div className="flex flex-col items-center gap-2">
      <p className="text-white/40 text-xs">Video Status</p>
      <div className="relative">
        <motion.button
          type="button"
          data-ocid="video_status.open_modal_button"
          whileTap={{ scale: 0.95 }}
          onClick={() => (videoUrl ? setPlaying(true) : setShowUpload(true))}
          className="w-16 h-16 rounded-full overflow-hidden border-2 border-pink-500 bg-gradient-to-br from-purple-800 to-pink-800 flex items-center justify-center relative"
          style={{ boxShadow: "0 0 0 3px rgba(236,72,153,0.3)" }}
        >
          {videoUrl ? (
            <video
              src={videoUrl}
              className="w-full h-full object-cover"
              muted
            />
          ) : (
            <Video className="w-6 h-6 text-white/60" />
          )}
          <div className="absolute inset-0 flex items-center justify-center bg-black/20">
            <Play className="w-5 h-5 text-white fill-white" />
          </div>
        </motion.button>
        <motion.div
          animate={{ rotate: 360 }}
          transition={{
            duration: 8,
            repeat: Number.POSITIVE_INFINITY,
            ease: "linear",
          }}
          className="absolute -inset-1 rounded-full"
          style={{
            background: "conic-gradient(from 0deg, #ec4899, #a855f7, #ec4899)",
            padding: 2,
          }}
        >
          <div className="w-full h-full rounded-full bg-[#0a0a0f]" />
        </motion.div>
      </div>
      <button
        type="button"
        onClick={() => setShowUpload(true)}
        className="text-xs text-white/40 hover:text-white/60"
      >
        {videoUrl ? "Change" : "+ Add"}
      </button>
      {showUpload && (
        <div
          data-ocid="video_status.dialog"
          className="fixed inset-0 z-50 bg-black/80 flex items-end justify-center"
          role="presentation"
          onClick={() => setShowUpload(false)}
          onKeyDown={(e) => e.stopPropagation()}
        >
          <div
            className="bg-[#1a1a2e] rounded-t-3xl p-6 w-full max-w-sm"
            role="presentation"
            onClick={(e) => e.stopPropagation()}
            onKeyDown={(e) => e.stopPropagation()}
          >
            <p className="text-white font-bold mb-4">
              Upload Video Status (max 30s)
            </p>
            <button
              type="button"
              data-ocid="video_status.upload_button"
              onClick={() => fileRef.current?.click()}
              className="w-full h-24 border-2 border-dashed border-white/20 rounded-2xl flex flex-col items-center justify-center gap-2 hover:border-pink-500/50 transition-colors"
            >
              <Video className="w-8 h-8 text-white/40" />
              <span className="text-white/40 text-sm">Tap to select video</span>
            </button>
            <input
              ref={fileRef}
              type="file"
              accept="video/*"
              className="hidden"
              onChange={handleFile}
            />
          </div>
        </div>
      )}
      {playing && videoUrl && (
        <div
          data-ocid="video_status.modal"
          className="fixed inset-0 z-50 bg-black flex items-center justify-center"
          role="presentation"
          onClick={() => setPlaying(false)}
          onKeyDown={(e) => e.stopPropagation()}
        >
          <video
            src={videoUrl}
            autoPlay
            controls
            className="max-w-full max-h-full"
          >
            <track kind="captions" />
          </video>
        </div>
      )}
    </div>
  );
}

// ── Feature 13: Profile QR Code ───────────────────────────────────────────────
export function ProfileQRCode({ name }: { name: string }) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <button
        type="button"
        data-ocid="qr.open_modal_button"
        onClick={() => setOpen(true)}
        className="flex flex-col items-center gap-1 px-3 py-2 rounded-xl bg-white/5 hover:bg-white/10 transition-colors"
      >
        <QrCode className="w-5 h-5 text-white/60" />
        <span className="text-white/40 text-[10px]">QR Code</span>
      </button>
      {open && (
        <div
          data-ocid="qr.dialog"
          className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-6"
          role="presentation"
          onClick={() => setOpen(false)}
          onKeyDown={(e) => {
            if (e.key === "Escape") setOpen(false);
          }}
        >
          <motion.div
            initial={{ scale: 0.8 }}
            animate={{ scale: 1 }}
            className="bg-white rounded-3xl p-6 flex flex-col items-center gap-4"
            onClick={(e) => e.stopPropagation()}
          >
            <p className="text-gray-800 font-bold text-lg">{name}'s Profile</p>
            {/* Stylized QR placeholder */}
            <div className="w-48 h-48 relative">
              <svg
                viewBox="0 0 100 100"
                className="w-full h-full"
                aria-label="QR Code"
                role="img"
              >
                <rect
                  x="0"
                  y="0"
                  width="30"
                  height="30"
                  rx="3"
                  fill="#1a1a2e"
                />
                <rect x="5" y="5" width="20" height="20" rx="2" fill="white" />
                <rect
                  x="9"
                  y="9"
                  width="12"
                  height="12"
                  rx="1"
                  fill="#ec4899"
                />
                <rect
                  x="70"
                  y="0"
                  width="30"
                  height="30"
                  rx="3"
                  fill="#1a1a2e"
                />
                <rect x="75" y="5" width="20" height="20" rx="2" fill="white" />
                <rect
                  x="79"
                  y="9"
                  width="12"
                  height="12"
                  rx="1"
                  fill="#a855f7"
                />
                <rect
                  x="0"
                  y="70"
                  width="30"
                  height="30"
                  rx="3"
                  fill="#1a1a2e"
                />
                <rect x="5" y="75" width="20" height="20" rx="2" fill="white" />
                <rect
                  x="9"
                  y="79"
                  width="12"
                  height="12"
                  rx="1"
                  fill="#ec4899"
                />
                {[35, 40, 45, 50, 55, 60, 65].map((x) =>
                  [35, 40, 45, 50, 55, 60, 65].map((y) =>
                    Math.random() > 0.5 ? (
                      <rect
                        key={`${x}-${y}`}
                        x={x}
                        y={y}
                        width="4"
                        height="4"
                        fill="#1a1a2e"
                      />
                    ) : null,
                  ),
                )}
                <text
                  x="50"
                  y="52"
                  textAnchor="middle"
                  fontSize="6"
                  fill="#ec4899"
                  fontFamily="sans-serif"
                >
                  SOCIAL
                </text>
                <text
                  x="50"
                  y="59"
                  textAnchor="middle"
                  fontSize="4"
                  fill="#a855f7"
                  fontFamily="sans-serif"
                >
                  FUSION
                </text>
              </svg>
            </div>
            <p className="text-gray-500 text-sm">Scan to visit profile</p>
            <button
              type="button"
              data-ocid="qr.close_button"
              onClick={() => setOpen(false)}
              className="px-6 py-2 rounded-full bg-gradient-to-r from-pink-500 to-purple-600 text-white font-semibold text-sm"
            >
              Share
            </button>
          </motion.div>
        </div>
      )}
    </>
  );
}

// ── Feature 14: Astrology Badge ───────────────────────────────────────────────
const ZODIAC_SIGNS: Record<string, string> = {
  Aries: "♈",
  Taurus: "♉",
  Gemini: "♊",
  Cancer: "♋",
  Leo: "♌",
  Virgo: "♍",
  Libra: "♎",
  Scorpio: "♏",
  Sagittarius: "♐",
  Capricorn: "♑",
  Aquarius: "♒",
  Pisces: "♓",
};
const COMPATIBLE: Record<string, string[]> = {
  Aries: ["Leo", "Sagittarius", "Gemini"],
  Taurus: ["Virgo", "Capricorn", "Cancer"],
  Gemini: ["Libra", "Aquarius", "Aries"],
  Cancer: ["Scorpio", "Pisces", "Taurus"],
  Leo: ["Aries", "Sagittarius", "Libra"],
  Virgo: ["Taurus", "Capricorn", "Scorpio"],
  Libra: ["Gemini", "Aquarius", "Leo"],
  Scorpio: ["Cancer", "Pisces", "Virgo"],
  Sagittarius: ["Aries", "Leo", "Aquarius"],
  Capricorn: ["Taurus", "Virgo", "Pisces"],
  Aquarius: ["Gemini", "Libra", "Sagittarius"],
  Pisces: ["Cancer", "Scorpio", "Capricorn"],
};
export function getZodiac(birthday?: string): string | null {
  if (!birthday) return null;
  const d = new Date(birthday);
  const m = d.getMonth() + 1;
  const day = d.getDate();
  if ((m === 3 && day >= 21) || (m === 4 && day <= 19)) return "Aries";
  if ((m === 4 && day >= 20) || (m === 5 && day <= 20)) return "Taurus";
  if ((m === 5 && day >= 21) || (m === 6 && day <= 20)) return "Gemini";
  if ((m === 6 && day >= 21) || (m === 7 && day <= 22)) return "Cancer";
  if ((m === 7 && day >= 23) || (m === 8 && day <= 22)) return "Leo";
  if ((m === 8 && day >= 23) || (m === 9 && day <= 22)) return "Virgo";
  if ((m === 9 && day >= 23) || (m === 10 && day <= 22)) return "Libra";
  if ((m === 10 && day >= 23) || (m === 11 && day <= 21)) return "Scorpio";
  if ((m === 11 && day >= 22) || (m === 12 && day <= 21)) return "Sagittarius";
  if ((m === 12 && day >= 22) || (m === 1 && day <= 19)) return "Capricorn";
  if ((m === 1 && day >= 20) || (m === 2 && day <= 18)) return "Aquarius";
  return "Pisces";
}
export function AstrologyBadge({
  birthday,
  otherBirthday,
}: { birthday?: string; otherBirthday?: string }) {
  const sign = getZodiac(birthday);
  const otherSign = getZodiac(otherBirthday);
  if (!sign) return null;
  const emoji = ZODIAC_SIGNS[sign] ?? "⭐";
  const isCompat = otherSign ? COMPATIBLE[sign]?.includes(otherSign) : null;
  return (
    <div className="flex items-center gap-2">
      <span className="text-lg" title={sign}>
        {emoji}
      </span>
      <span className="text-xs text-white/50">{sign}</span>
      {isCompat !== null && (
        <span
          className={`text-xs px-2 py-0.5 rounded-full font-medium ${isCompat ? "bg-green-500/20 text-green-400" : "bg-orange-500/20 text-orange-400"}`}
        >
          {isCompat ? "✨ Compatible" : "🤔 Different"}
        </span>
      )}
    </div>
  );
}

// ── Feature 20: Relationship Goals ───────────────────────────────────────────
export const REL_GOALS = [
  "Marriage 💍",
  "Serious 💑",
  "Friendship 🤝",
  "Casual 😊",
];
export function RelationshipGoalBadge({ goal }: { goal: string }) {
  if (!goal) return null;
  const colors: Record<string, string> = {
    "Marriage 💍": "from-yellow-500 to-orange-500",
    "Serious 💑": "from-pink-500 to-red-500",
    "Friendship 🤝": "from-blue-500 to-cyan-500",
    "Casual 😊": "from-green-500 to-teal-500",
  };
  return (
    <span
      className={`text-xs px-3 py-1 rounded-full text-white font-medium bg-gradient-to-r ${colors[goal] || "from-gray-500 to-gray-600"}`}
    >
      {goal}
    </span>
  );
}
export function RelationshipGoalPicker({
  value,
  onChange,
}: { value: string; onChange: (v: string) => void }) {
  return (
    <div className="flex flex-col gap-1">
      <Label className="text-white/60 text-xs">Relationship Goal</Label>
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger
          data-ocid="relgoal.select"
          className="bg-white/5 border-white/10 text-white"
        >
          <SelectValue placeholder="Select goal" />
        </SelectTrigger>
        <SelectContent className="bg-[#1a1a2e] border-white/10 text-white">
          {REL_GOALS.map((g) => (
            <SelectItem key={g} value={g}>
              {g}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}

// ── Feature 23: Voice Introduction ───────────────────────────────────────────
export function VoiceIntroduction() {
  const [recording, setRecording] = useState(false);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [seconds, setSeconds] = useState(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const mediaRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mr = new MediaRecorder(stream);
      mediaRef.current = mr;
      chunksRef.current = [];
      mr.ondataavailable = (e) => chunksRef.current.push(e.data);
      mr.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: "audio/webm" });
        setAudioUrl(URL.createObjectURL(blob));
        for (const t of stream.getTracks()) {
          t.stop();
        }
      };
      mr.start();
      setRecording(true);
      setSeconds(0);
      timerRef.current = setInterval(() => {
        setSeconds((s) => {
          if (s >= 29) {
            stopRecording();
            return 30;
          }
          return s + 1;
        });
      }, 1000);
    } catch {}
  };
  const stopRecording = () => {
    mediaRef.current?.stop();
    setRecording(false);
    if (timerRef.current) clearInterval(timerRef.current);
  };

  return (
    <div className="bg-white/5 border border-white/10 rounded-2xl p-4">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Mic className="w-4 h-4 text-pink-400" />
          <span className="text-white/70 text-sm font-medium">
            Voice Introduction
          </span>
        </div>
        {recording && (
          <div className="flex items-center gap-1.5">
            <motion.span
              animate={{ opacity: [1, 0, 1] }}
              transition={{ duration: 0.8, repeat: Number.POSITIVE_INFINITY }}
              className="w-2 h-2 rounded-full bg-red-500"
            />
            <span className="text-red-400 text-xs">{seconds}s / 30s</span>
          </div>
        )}
      </div>
      {recording && (
        <div className="mb-3">
          <Progress value={(seconds / 30) * 100} className="h-1.5" />
          <div className="flex justify-center gap-1 mt-2">
            {Array.from({ length: 20 }).map((_, i) => (
              <motion.div
                // biome-ignore lint/suspicious/noArrayIndexKey: static visual bar
                key={`wave-bar-${i}`}
                animate={{ height: [4, 4 + Math.random() * 16, 4] }}
                transition={{
                  duration: 0.3 + Math.random() * 0.4,
                  repeat: Number.POSITIVE_INFINITY,
                }}
                className="w-1 bg-pink-400 rounded-full"
              />
            ))}
          </div>
        </div>
      )}
      {audioUrl && !recording && (
        <audio
          controls
          src={audioUrl}
          className="w-full mb-3"
          style={{ height: 36 }}
        >
          <track kind="captions" />
        </audio>
      )}
      <div className="flex gap-2">
        {recording ? (
          <Button
            data-ocid="voice_intro.secondary_button"
            onClick={stopRecording}
            size="sm"
            className="flex-1 bg-red-500/20 text-red-400 border-red-500/30"
          >
            <Square className="w-3.5 h-3.5 mr-1.5" /> Stop
          </Button>
        ) : (
          <Button
            data-ocid="voice_intro.primary_button"
            onClick={startRecording}
            size="sm"
            className="flex-1 bg-pink-500/20 text-pink-400 border-pink-500/30"
          >
            <Mic className="w-3.5 h-3.5 mr-1.5" />{" "}
            {audioUrl ? "Re-record" : "Record (30s)"}
          </Button>
        )}
      </div>
    </div>
  );
}

// ── Feature 27: Referral System ───────────────────────────────────────────────
export function ReferralCard({ principal }: { principal: string }) {
  const [copied, setCopied] = useState(false);
  const [count] = useState(Math.floor(Math.random() * 5));
  const link = `https://socialfusion.app/join?ref=${principal.slice(0, 8)}`;
  const copy = () => {
    navigator.clipboard.writeText(link).catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  return (
    <div className="bg-gradient-to-r from-purple-900/40 to-pink-900/40 border border-purple-500/20 rounded-2xl p-4">
      <div className="flex items-center gap-2 mb-3">
        <Users className="w-4 h-4 text-purple-400" />
        <span className="text-white font-semibold text-sm">Refer a Friend</span>
        {count > 0 && (
          <span className="ml-auto text-xs bg-purple-500/20 text-purple-300 px-2 py-0.5 rounded-full">
            {count} referred
          </span>
        )}
      </div>
      <p className="text-white/50 text-xs mb-3">
        Share your link and earn premium days for each friend who joins!
      </p>
      <div className="flex gap-2">
        <div className="flex-1 bg-white/5 rounded-xl px-3 py-2 text-white/50 text-xs truncate">
          {link}
        </div>
        <button
          type="button"
          data-ocid="referral.primary_button"
          onClick={copy}
          className="px-3 py-2 rounded-xl bg-purple-600 text-white text-xs font-semibold shrink-0"
        >
          {copied ? "Copied!" : "Copy"}
        </button>
      </div>
    </div>
  );
}

// ── Feature 30: Profile Music ──────────────────────────────────────────────────
export function ProfileMusicSection() {
  const [playing, setPlaying] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [song, setSong] = useState<{ title: string; artist: string } | null>(
    null,
  );
  const SONG_SUGGESTIONS = [
    { title: "Tum Hi Ho", artist: "Arijit Singh" },
    { title: "Kesariya", artist: "Arijit Singh" },
    { title: "Perfect", artist: "Ed Sheeran" },
    { title: "Shape of You", artist: "Ed Sheeran" },
    { title: "Tera Ban Jaunga", artist: "Akhil Sachdeva" },
    { title: "Raabta", artist: "Pritam" },
  ];
  return (
    <div className="bg-white/5 border border-white/10 rounded-2xl p-4">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Music className="w-4 h-4 text-pink-400" />
          <span className="text-white/70 text-sm font-medium">
            Profile Song
          </span>
        </div>
        <button
          type="button"
          onClick={() => setSearchOpen(true)}
          className="text-xs text-pink-400"
        >
          {song ? "Change" : "+ Add Song"}
        </button>
      </div>
      {song ? (
        <div className="flex items-center gap-3">
          <motion.div
            animate={playing ? { rotate: 360 } : { rotate: 0 }}
            transition={{
              duration: 3,
              repeat: playing ? Number.POSITIVE_INFINITY : 0,
              ease: "linear",
            }}
            className="w-12 h-12 rounded-full bg-gradient-to-br from-pink-500 to-purple-600 flex items-center justify-center shrink-0"
          >
            <Music className="w-5 h-5 text-white" />
          </motion.div>
          <div className="flex-1 min-w-0">
            <p className="text-white font-semibold text-sm truncate">
              {song.title}
            </p>
            <p className="text-white/40 text-xs">{song.artist}</p>
            {playing && (
              <div className="flex gap-0.5 mt-1">
                {Array.from({ length: 5 }).map((_, i) => (
                  <motion.div
                    // biome-ignore lint/suspicious/noArrayIndexKey: static visual bar
                    key={`eq-bar-${i}`}
                    animate={{ height: [2, 8 + i * 2, 2] }}
                    transition={{
                      duration: 0.4 + i * 0.1,
                      repeat: Number.POSITIVE_INFINITY,
                    }}
                    className="w-1 bg-pink-400 rounded-full"
                  />
                ))}
              </div>
            )}
          </div>
          <button
            type="button"
            data-ocid="music.toggle"
            onClick={() => setPlaying((p) => !p)}
            className="w-10 h-10 rounded-full bg-pink-500/20 flex items-center justify-center"
          >
            {playing ? (
              <Square className="w-4 h-4 text-pink-400" />
            ) : (
              <Play className="w-4 h-4 text-pink-400 fill-pink-400" />
            )}
          </button>
        </div>
      ) : (
        <button
          type="button"
          data-ocid="music.upload_button"
          onClick={() => setSearchOpen(true)}
          className="w-full py-3 border-2 border-dashed border-white/10 rounded-xl flex items-center justify-center gap-2 text-white/30 hover:border-pink-500/30 hover:text-white/50 transition-colors"
        >
          <Music className="w-4 h-4" /> Add a song to your profile
        </button>
      )}
      {searchOpen && (
        <div
          data-ocid="music.modal"
          className="fixed inset-0 z-50 bg-black/90 flex items-end"
          role="presentation"
          onClick={() => setSearchOpen(false)}
          onKeyDown={(e) => e.stopPropagation()}
        >
          <div
            className="bg-[#1a1a2e] rounded-t-3xl p-4 w-full"
            role="presentation"
            onClick={(e) => e.stopPropagation()}
            onKeyDown={(e) => e.stopPropagation()}
          >
            <p className="text-white font-bold mb-4">🎵 Choose Profile Song</p>
            <div className="flex flex-col gap-2">
              {SONG_SUGGESTIONS.map((s) => (
                <button
                  key={s.title}
                  type="button"
                  onClick={() => {
                    setSong(s);
                    setSearchOpen(false);
                  }}
                  className="flex items-center gap-3 p-3 rounded-xl bg-white/5 hover:bg-white/10 transition-colors text-left"
                >
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-pink-500 to-purple-600 flex items-center justify-center shrink-0">
                    <Music className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <p className="text-white text-sm font-medium">{s.title}</p>
                    <p className="text-white/40 text-xs">{s.artist}</p>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ── Feature 15: Voice Note in Stories ────────────────────────────────────────
export function VoiceNoteStoryOption() {
  const [recording, setRecording] = useState(false);
  const [done, setDone] = useState(false);
  const [seconds, setSeconds] = useState(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const start = () => {
    setRecording(true);
    setDone(false);
    setSeconds(0);
    timerRef.current = setInterval(
      () =>
        setSeconds((s) =>
          s >= 14
            ? (() => {
                setRecording(false);
                setDone(true);
                if (timerRef.current) clearInterval(timerRef.current);
                return 15;
              })()
            : s + 1,
        ),
      1000,
    );
  };
  const stop = () => {
    setRecording(false);
    setDone(true);
    if (timerRef.current) clearInterval(timerRef.current);
  };
  return (
    <div className="flex flex-col items-center gap-3 p-4">
      <p className="text-white font-semibold">🎤 Voice Note Story</p>
      <p className="text-white/40 text-sm">Record up to 15 seconds</p>
      <motion.button
        type="button"
        data-ocid="voice_story.primary_button"
        onMouseDown={start}
        onMouseUp={stop}
        onTouchStart={start}
        onTouchEnd={stop}
        whileTap={{ scale: 0.9 }}
        className={`w-20 h-20 rounded-full flex items-center justify-center shadow-2xl ${recording ? "bg-red-500" : "bg-gradient-to-br from-pink-500 to-purple-600"}`}
        style={recording ? { boxShadow: "0 0 0 8px rgba(239,68,68,0.3)" } : {}}
      >
        <Mic className="w-8 h-8 text-white" />
      </motion.button>
      {recording && (
        <p className="text-red-400 text-sm">
          {seconds}s / 15s - Release to stop
        </p>
      )}
      {done && (
        <p className="text-green-400 text-sm">✓ Voice note ready to post!</p>
      )}
    </div>
  );
}

// ── Feature 26: Story Polls ───────────────────────────────────────────────────
export function StoryPollCreator() {
  const [question, setQuestion] = useState("");
  const [options, setOptions] = useState(["Yes", "No"]);
  const [votes, setVotes] = useState<number[]>([0, 0]);
  const [voted, setVoted] = useState(false);
  const vote = (i: number) => {
    if (voted) return;
    setVotes((v) => v.map((val, j) => (j === i ? val + 1 : val)));
    setVoted(true);
  };
  const total = votes.reduce((a, b) => a + b, 0);
  return (
    <div className="bg-gradient-to-br from-purple-900/50 to-pink-900/50 border border-purple-500/20 rounded-2xl p-4">
      <p className="text-white font-bold text-sm mb-3">📊 Story Poll</p>
      <Input
        data-ocid="poll.input"
        value={question}
        onChange={(e) => setQuestion(e.target.value)}
        placeholder="Ask a question..."
        className="bg-white/5 border-white/10 text-white mb-3"
      />
      <div className="flex flex-col gap-2">
        {options.map((opt, i) => (
          <div
            // biome-ignore lint/suspicious/noArrayIndexKey: poll options indexed
            key={i}
            className="relative overflow-hidden rounded-xl"
          >
            {voted && (
              <motion.div
                initial={{ width: 0 }}
                animate={{
                  width: `${total ? Math.round((votes[i] / total) * 100) : 0}%`,
                }}
                className="absolute inset-y-0 left-0 bg-pink-500/30"
              />
            )}
            <button
              type="button"
              onClick={() => vote(i)}
              className="relative w-full flex items-center justify-between px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-left"
            >
              <input
                value={opt}
                onChange={(e) =>
                  setOptions((o) =>
                    o.map((x, j) => (j === i ? e.target.value : x)),
                  )
                }
                className="bg-transparent text-white/80 text-sm flex-1 outline-none"
              />
              {voted && (
                <span className="text-white/60 text-xs ml-2">
                  {total ? Math.round((votes[i] / total) * 100) : 0}%
                </span>
              )}
            </button>
          </div>
        ))}
      </div>
      {options.length < 4 && (
        <button
          type="button"
          onClick={() => {
            setOptions((o) => [...o, ""]);
            setVotes((v) => [...v, 0]);
          }}
          className="mt-2 text-xs text-pink-400 hover:text-pink-300"
        >
          + Add option
        </button>
      )}
    </div>
  );
}
