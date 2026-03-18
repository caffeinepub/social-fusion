import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Bookmark,
  Calendar,
  CheckCircle,
  Heart,
  Sparkles,
  Users,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";

// ── Feature 17: Bookmarks ─────────────────────────────────────────────────────
interface BookmarkItem {
  id: string;
  name: string;
  type: "profile" | "post";
  emoji: string;
}
const SAMPLE_BOOKMARKS: BookmarkItem[] = [
  { id: "b1", name: "Priya Sharma", type: "profile", emoji: "👩" },
  { id: "b2", name: "Dev Kumar", type: "profile", emoji: "👨" },
  { id: "b3", name: "Beach Sunset post", type: "post", emoji: "🌅" },
];
export function BookmarksSection() {
  const [bookmarks, setBookmarks] = useState<BookmarkItem[]>(SAMPLE_BOOKMARKS);
  const remove = (id: string) =>
    setBookmarks((b) => b.filter((x) => x.id !== id));
  return (
    <div className="px-4 py-4">
      <div className="flex items-center gap-2 mb-3">
        <Bookmark className="w-4 h-4 text-yellow-400" />
        <h3 className="text-white font-bold">Saved</h3>
        <span className="text-white/30 text-sm">{bookmarks.length}</span>
      </div>
      {bookmarks.length === 0 ? (
        <div
          data-ocid="bookmarks.empty_state"
          className="flex flex-col items-center gap-2 py-8"
        >
          <Bookmark className="w-8 h-8 text-white/20" />
          <p className="text-white/30 text-sm">Nothing saved yet</p>
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          {bookmarks.map((b, i) => (
            <motion.div
              key={b.id}
              data-ocid={`bookmarks.item.${i + 1}`}
              layout
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="flex items-center gap-3 bg-white/5 border border-white/10 rounded-xl px-3 py-2.5"
            >
              <span className="text-xl shrink-0">{b.emoji}</span>
              <div className="flex-1">
                <p className="text-white text-sm font-medium">{b.name}</p>
                <p className="text-white/30 text-xs capitalize">{b.type}</p>
              </div>
              <Badge className="text-[10px] bg-white/5 text-white/40 border-white/10">
                {b.type}
              </Badge>
              <button
                type="button"
                data-ocid={`bookmarks.delete_button.${i + 1}`}
                onClick={() => remove(b.id)}
                className="text-white/30 hover:text-red-400 transition-colors text-lg leading-none"
              >
                ×
              </button>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}

export function BookmarkToggleButton({
  id: _id,
  name: _name,
  type: _type = "profile",
}: {
  id: string;
  name: string;
  type?: "profile" | "post";
}) {
  const [saved, setSaved] = useState(false);
  const toggle = () => setSaved((s) => !s);
  return (
    <motion.button
      type="button"
      data-ocid="bookmark.toggle"
      onClick={toggle}
      whileTap={{ scale: 0.85 }}
      className="w-9 h-9 rounded-full flex items-center justify-center transition-colors"
      style={{
        background: saved ? "rgba(234,179,8,0.2)" : "rgba(255,255,255,0.05)",
      }}
    >
      <Bookmark
        className={`w-4 h-4 transition-all ${saved ? "text-yellow-400 fill-yellow-400" : "text-white/40"}`}
      />
    </motion.button>
  );
}

// ── Feature 18: Activity Feed ─────────────────────────────────────────────────
const ACTIVITY_ITEMS = [
  {
    id: "a1",
    user: "Priya",
    action: "liked your profile",
    time: "2m ago",
    emoji: "❤️",
  },
  {
    id: "a2",
    user: "Dev",
    action: "starred you",
    time: "15m ago",
    emoji: "⭐",
  },
  {
    id: "a3",
    user: "Ananya",
    action: "viewed your profile",
    time: "1h ago",
    emoji: "👀",
  },
  {
    id: "a4",
    user: "Rohan",
    action: "super liked you",
    time: "2h ago",
    emoji: "💫",
  },
  {
    id: "a5",
    user: "Sneha",
    action: "sent a request",
    time: "3h ago",
    emoji: "💌",
  },
  {
    id: "a6",
    user: "Kavya",
    action: "liked your story",
    time: "5h ago",
    emoji: "🌟",
  },
];
export function ActivityFeedSection() {
  return (
    <div className="px-4 py-4">
      <div className="flex items-center gap-2 mb-3">
        <Sparkles className="w-4 h-4 text-pink-400" />
        <h3 className="text-white font-bold">Activity</h3>
        <Badge className="text-[10px] bg-pink-500/20 text-pink-300 border-pink-500/30">
          Last 48h
        </Badge>
      </div>
      <div className="flex flex-col gap-2">
        {ACTIVITY_ITEMS.map((item, i) => (
          <motion.div
            key={item.id}
            data-ocid={`activity.item.${i + 1}`}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.08 }}
            className="flex items-center gap-3 bg-white/5 border border-white/5 rounded-xl px-3 py-2.5"
          >
            <span className="text-xl shrink-0">{item.emoji}</span>
            <div className="flex-1">
              <p className="text-white/80 text-sm">
                <span className="font-semibold text-white">{item.user}</span>{" "}
                {item.action}
              </p>
            </div>
            <span className="text-white/30 text-xs shrink-0">{item.time}</span>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

// ── Feature 22: Event Invites ─────────────────────────────────────────────────
interface EventItem {
  id: string;
  title: string;
  host: string;
  time: string;
  emoji: string;
  rsvp: number;
  isJoined: boolean;
}
const SAMPLE_EVENTS: EventItem[] = [
  {
    id: "e1",
    title: "Coffee Chat ☕",
    host: "Priya S.",
    time: "Today 6 PM",
    emoji: "☕",
    rsvp: 8,
    isJoined: false,
  },
  {
    id: "e2",
    title: "Movie Night 🎬",
    host: "Dev K.",
    time: "Sat 8 PM",
    emoji: "🎬",
    rsvp: 14,
    isJoined: true,
  },
  {
    id: "e3",
    title: "Book Club 📚",
    host: "Ananya R.",
    time: "Sun 5 PM",
    emoji: "📚",
    rsvp: 6,
    isJoined: false,
  },
  {
    id: "e4",
    title: "Game Night 🎮",
    host: "Rohan M.",
    time: "Fri 9 PM",
    emoji: "🎮",
    rsvp: 12,
    isJoined: false,
  },
];
export function EventInvitesSection() {
  const [events, setEvents] = useState(SAMPLE_EVENTS);
  const [createOpen, setCreateOpen] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const toggle = (id: string) =>
    setEvents((ev) =>
      ev.map((e) =>
        e.id === id
          ? {
              ...e,
              isJoined: !e.isJoined,
              rsvp: e.isJoined ? e.rsvp - 1 : e.rsvp + 1,
            }
          : e,
      ),
    );
  const create = () => {
    if (!newTitle.trim()) return;
    setEvents((ev) => [
      {
        id: `e${Date.now()}`,
        title: newTitle,
        host: "You",
        time: "TBD",
        emoji: "🎉",
        rsvp: 1,
        isJoined: true,
      },
      ...ev,
    ]);
    setNewTitle("");
    setCreateOpen(false);
  };
  return (
    <div className="px-4 py-4">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Calendar className="w-4 h-4 text-blue-400" />
          <h3 className="text-white font-bold">Events</h3>
        </div>
        <button
          type="button"
          data-ocid="events.open_modal_button"
          onClick={() => setCreateOpen(true)}
          className="text-xs text-pink-400 bg-pink-500/10 px-3 py-1 rounded-full"
        >
          + Create
        </button>
      </div>
      {createOpen && (
        <div data-ocid="events.modal" className="flex gap-2 mb-3">
          <Input
            data-ocid="events.input"
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
            placeholder="Event name..."
            className="bg-white/5 border-white/10 text-white flex-1"
          />
          <Button
            data-ocid="events.submit_button"
            onClick={create}
            size="sm"
            className="bg-pink-600 border-0"
          >
            Create
          </Button>
          <Button
            data-ocid="events.cancel_button"
            onClick={() => setCreateOpen(false)}
            size="sm"
            variant="ghost"
            className="text-white/40"
          >
            ✕
          </Button>
        </div>
      )}
      <div className="flex flex-col gap-2">
        {events.map((ev, i) => (
          <motion.div
            key={ev.id}
            data-ocid={`events.item.${i + 1}`}
            layout
            className="flex items-center gap-3 bg-white/5 border border-white/10 rounded-2xl px-3 py-3"
          >
            <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center text-xl shrink-0">
              {ev.emoji}
            </div>
            <div className="flex-1">
              <p className="text-white font-semibold text-sm">{ev.title}</p>
              <p className="text-white/40 text-xs">
                {ev.host} · {ev.time}
              </p>
              <div className="flex items-center gap-1 mt-0.5">
                <Users className="w-3 h-3 text-white/30" />
                <span className="text-white/30 text-xs">{ev.rsvp} going</span>
              </div>
            </div>
            <motion.button
              type="button"
              data-ocid={`events.toggle.${i + 1}`}
              whileTap={{ scale: 0.9 }}
              onClick={() => toggle(ev.id)}
              className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all ${ev.isJoined ? "bg-green-500/20 text-green-400 border border-green-500/30" : "bg-blue-500/20 text-blue-400 border border-blue-500/30"}`}
            >
              {ev.isJoined ? (
                <>
                  <CheckCircle className="inline w-3 h-3 mr-1" />
                  Joined
                </>
              ) : (
                "RSVP"
              )}
            </motion.button>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

// ── Feature 25: Couple Goals Feed ────────────────────────────────────────────
const COUPLE_GOALS = [
  {
    id: "c1",
    p1: "Priya",
    p2: "Dev",
    since: "3 months",
    emoji: "❤️",
    story: "Met on Social Fusion!",
  },
  {
    id: "c2",
    p1: "Ananya",
    p2: "Rohan",
    since: "6 months",
    emoji: "💑",
    story: "Found our soulmate here 💕",
  },
  {
    id: "c3",
    p1: "Sneha",
    p2: "Karthik",
    since: "1 year",
    emoji: "💍",
    story: "Getting married next month!",
  },
  {
    id: "c4",
    p1: "Meera",
    p2: "Arjun",
    since: "2 months",
    emoji: "🥰",
    story: "Best decision of my life!",
  },
];
export function CoupleGoalsFeed() {
  return (
    <div className="px-4 py-4">
      <div className="flex items-center gap-2 mb-3">
        <Heart className="w-4 h-4 text-pink-400 fill-pink-400" />
        <h3 className="text-white font-bold">Couple Goals 💑</h3>
      </div>
      <div className="flex flex-col gap-3">
        {COUPLE_GOALS.map((c, i) => (
          <motion.div
            key={c.id}
            data-ocid={`couples.item.${i + 1}`}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="relative overflow-hidden rounded-2xl p-4"
            style={{
              background:
                "linear-gradient(135deg, rgba(236,72,153,0.1), rgba(168,85,247,0.1))",
              border: "1px solid rgba(236,72,153,0.2)",
            }}
          >
            <div className="flex items-center gap-3 mb-2">
              <div className="flex items-center">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-pink-500 to-purple-600 flex items-center justify-center text-white font-bold text-sm">
                  {c.p1[0]}
                </div>
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-blue-600 flex items-center justify-center text-white font-bold text-sm -ml-3 border-2 border-[#0a0a0f]">
                  {c.p2[0]}
                </div>
              </div>
              <div>
                <p className="text-white font-semibold text-sm">
                  {c.p1} & {c.p2} {c.emoji}
                </p>
                <p className="text-white/40 text-xs">Together {c.since}</p>
              </div>
            </div>
            <p className="text-white/60 text-sm italic">"{c.story}"</p>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
