import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import type { Principal } from "@icp-sdk/core/principal";
import { Bookmark, Heart, Send, X } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useEffect, useRef, useState } from "react";
import type { Profile, Story } from "../backend";

interface Comment {
  author: string;
  text: string;
}

interface Props {
  stories: Story[];
  author: Principal;
  profile: Profile | undefined;
  onClose: () => void;
}

const STORY_DURATION = 5000;

export default function StoryViewer({
  stories,
  author: _author,
  profile,
  onClose,
}: Props) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [progress, setProgress] = useState(0);
  const [paused, setPaused] = useState(false);
  const [liked, setLiked] = useState<boolean[]>(() => stories.map(() => false));
  const [likeAnim, setLikeAnim] = useState(false);
  const [commentInput, setCommentInput] = useState("");
  const [allComments, setAllComments] = useState<
    { storyIdx: number; comments: Comment[] }[]
  >(() => stories.map((_, i) => ({ storyIdx: i, comments: [] })));
  const [savedHighlight, setSavedHighlight] = useState(false);
  const pausedRef = useRef(false);
  const commentInputRef = useRef<HTMLInputElement>(null);

  pausedRef.current = paused;

  const story = stories[currentIndex];
  const currentComments =
    allComments.find((c) => c.storyIdx === currentIndex)?.comments ?? [];

  useEffect(() => {
    setProgress(0);
    const start = { time: Date.now(), pausedMs: 0, pauseStart: 0 };
    let paused = false;

    const interval = setInterval(() => {
      if (pausedRef.current) {
        if (!paused) {
          start.pauseStart = Date.now();
          paused = true;
        }
        return;
      }
      if (paused) {
        start.pausedMs += Date.now() - start.pauseStart;
        paused = false;
      }
      const elapsed = Date.now() - start.time - start.pausedMs;
      const pct = Math.min((elapsed / STORY_DURATION) * 100, 100);
      setProgress(pct);
      if (pct >= 100) {
        clearInterval(interval);
        if (currentIndex < stories.length - 1) {
          setCurrentIndex((i) => i + 1);
        } else {
          onClose();
        }
      }
    }, 50);
    return () => clearInterval(interval);
  }, [currentIndex, stories.length, onClose]);

  if (!story) return null;

  const goNext = () => {
    if (currentIndex < stories.length - 1) setCurrentIndex((i) => i + 1);
    else onClose();
  };
  const goPrev = () => {
    if (currentIndex > 0) setCurrentIndex((i) => i - 1);
  };

  const handleLike = () => {
    const next = [...liked];
    next[currentIndex] = !next[currentIndex];
    setLiked(next);
    if (!liked[currentIndex]) {
      setLikeAnim(true);
      setTimeout(() => setLikeAnim(false), 600);
    }
  };

  const handleSendComment = () => {
    const text = commentInput.trim();
    if (!text) return;
    setAllComments((prev) =>
      prev.map((c) =>
        c.storyIdx === currentIndex
          ? {
              ...c,
              comments: [
                ...c.comments,
                { author: profile?.displayName ?? "You", text },
              ],
            }
          : c,
      ),
    );
    setCommentInput("");
  };

  const handleReply = (author: string) => {
    setCommentInput(`@${author} `);
    commentInputRef.current?.focus();
  };

  const isLiked = liked[currentIndex];
  const displayName = profile?.displayName || "User";

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[100] bg-black flex items-center justify-center"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.95 }}
          animate={{ scale: 1 }}
          exit={{ scale: 0.95 }}
          className="relative w-full max-w-[430px] h-full max-h-dvh flex flex-col select-none"
          onClick={(e) => e.stopPropagation()}
          onPointerDown={() => setPaused(true)}
          onPointerUp={() => setPaused(false)}
          onPointerLeave={() => setPaused(false)}
        >
          {/* Progress bars */}
          <div className="absolute top-2 left-2 right-2 flex gap-1 z-20">
            {stories.map((s, i) => (
              <div
                key={s.timestamp.toString() + String(i)}
                className="flex-1 h-0.5 bg-white/25 rounded-full overflow-hidden"
              >
                <div
                  className="h-full bg-white rounded-full transition-none"
                  style={{
                    width:
                      i < currentIndex
                        ? "100%"
                        : i === currentIndex
                          ? `${progress}%`
                          : "0%",
                  }}
                />
              </div>
            ))}
          </div>

          {/* Pause indicator */}
          {paused && (
            <div className="absolute inset-0 z-30 flex items-center justify-center pointer-events-none">
              <div className="w-14 h-14 bg-black/50 rounded-full flex items-center justify-center">
                <div className="flex gap-1">
                  <div className="w-1.5 h-6 bg-white rounded-full" />
                  <div className="w-1.5 h-6 bg-white rounded-full" />
                </div>
              </div>
            </div>
          )}

          {/* Header */}
          <div className="absolute top-6 left-4 right-4 flex items-center justify-between z-20">
            <div className="flex items-center gap-2">
              <Avatar className="w-8 h-8 border border-white/50">
                {profile?.avatar && (
                  <AvatarImage src={profile.avatar.getDirectURL()} />
                )}
                <AvatarFallback className="bg-muted text-xs">
                  {displayName[0]?.toUpperCase() || "?"}
                </AvatarFallback>
              </Avatar>
              <span className="text-white text-sm font-semibold drop-shadow">
                {displayName}
              </span>
            </div>
            <div className="flex items-center gap-2">
              {/* Save to Highlight */}
              <button
                type="button"
                data-ocid="story.save_button"
                onClick={(e) => {
                  e.stopPropagation();
                  setSavedHighlight(true);
                  setTimeout(() => setSavedHighlight(false), 1500);
                }}
                className="w-8 h-8 rounded-full bg-black/30 flex items-center justify-center"
              >
                <Bookmark
                  className={`w-4 h-4 ${savedHighlight ? "text-yellow-400 fill-yellow-400" : "text-white"}`}
                />
              </button>
              <button
                type="button"
                data-ocid="story.close_button"
                onClick={(e) => {
                  e.stopPropagation();
                  onClose();
                }}
                className="w-8 h-8 rounded-full bg-black/30 flex items-center justify-center"
              >
                <X className="w-4 h-4 text-white" />
              </button>
            </div>
          </div>

          {/* Tap zones */}
          <div className="absolute inset-0 flex z-10" style={{ bottom: 140 }}>
            <button
              type="button"
              className="flex-1 h-full"
              onClick={(e) => {
                e.stopPropagation();
                goPrev();
              }}
              aria-label="Previous story"
            />
            <button
              type="button"
              className="flex-1 h-full"
              onClick={(e) => {
                e.stopPropagation();
                goNext();
              }}
              aria-label="Next story"
            />
          </div>

          {/* Content */}
          {story.image ? (
            <img
              src={story.image.getDirectURL()}
              alt="Story"
              className="w-full h-full object-cover"
              draggable={false}
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-pink-600/70 to-purple-700/70 p-8">
              <p className="text-white text-2xl font-bold text-center leading-snug">
                {story.content}
              </p>
            </div>
          )}

          {story.image && story.content && (
            <div className="absolute bottom-36 left-4 right-4 z-10">
              <p className="text-white text-base font-medium drop-shadow-lg text-center">
                {story.content}
              </p>
            </div>
          )}

          {/* Bottom interaction zone */}
          <div
            className="absolute bottom-0 left-0 right-0 z-20 flex flex-col"
            style={{
              background:
                "linear-gradient(to top, rgba(0,0,0,0.85) 0%, transparent 100%)",
            }}
            onClick={(e) => e.stopPropagation()}
            onKeyDown={(e) => e.stopPropagation()}
            onPointerDown={(e) => e.stopPropagation()}
            onPointerUp={(e) => e.stopPropagation()}
          >
            {/* Comments list (last 3) */}
            {currentComments.length > 0 && (
              <div className="px-4 pb-1 flex flex-col gap-1 max-h-28 overflow-y-auto">
                {currentComments.slice(-3).map((c, i) => (
                  // biome-ignore lint/suspicious/noArrayIndexKey: comment order is stable
                  <div key={i} className="flex items-start gap-2">
                    <div className="w-5 h-5 rounded-full bg-gradient-to-br from-pink-500 to-purple-600 flex items-center justify-center text-[10px] text-white font-bold shrink-0 mt-0.5">
                      {c.author[0]?.toUpperCase()}
                    </div>
                    <div className="flex-1">
                      <span className="text-white/90 text-xs">
                        <span className="font-semibold">{c.author}</span>{" "}
                        {c.text}
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleReply(c.author)}
                      className="text-white/40 text-[10px] shrink-0 hover:text-white/70"
                    >
                      Reply
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* Like + Comment input */}
            <div className="flex items-center gap-2 px-4 pb-4 pt-2">
              {/* Like */}
              <motion.button
                type="button"
                data-ocid="story.toggle"
                onClick={handleLike}
                animate={likeAnim ? { scale: [1, 1.5, 1] } : { scale: 1 }}
                transition={{ duration: 0.4 }}
                className="w-10 h-10 rounded-full bg-black/40 flex items-center justify-center shrink-0"
              >
                <Heart
                  className={`w-5 h-5 transition-colors ${
                    isLiked ? "text-pink-500 fill-pink-500" : "text-white"
                  }`}
                />
              </motion.button>

              {/* Comment input */}
              <div className="flex-1 flex items-center gap-2 bg-white/10 rounded-full px-4 h-10 border border-white/20">
                <input
                  ref={commentInputRef}
                  type="text"
                  value={commentInput}
                  onChange={(e) => setCommentInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") handleSendComment();
                  }}
                  placeholder="Add a comment..."
                  className="flex-1 bg-transparent text-white text-sm outline-none placeholder:text-white/40"
                  data-ocid="story.input"
                />
                <button
                  type="button"
                  data-ocid="story.submit_button"
                  onClick={handleSendComment}
                  disabled={!commentInput.trim()}
                  className="text-pink-400 disabled:opacity-30"
                >
                  <Send className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
