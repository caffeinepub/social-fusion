import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import type { Principal } from "@icp-sdk/core/principal";
import {
  Bookmark,
  Heart,
  MessageCircle,
  MoreHorizontal,
  Send,
  VolumeX,
  X,
} from "lucide-react";
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

const MENTION_SUGGESTIONS = ["Priya", "Rahul", "Anjali", "Vikram", "Meera"];

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
  const [saved, setSaved] = useState(false);
  const [muted, setMuted] = useState(false);
  const [showCommentSheet, setShowCommentSheet] = useState(false);
  const [commentInput, setCommentInput] = useState("");
  const [showMentions, setShowMentions] = useState(false);
  const [allComments, setAllComments] = useState<
    { storyIdx: number; comments: Comment[] }[]
  >(() => stories.map((_, i) => ({ storyIdx: i, comments: [] })));
  const pausedRef = useRef(false);
  const commentInputRef = useRef<HTMLInputElement>(null);
  const holdTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  pausedRef.current = paused;

  const story = stories[currentIndex];
  const currentComments =
    allComments.find((c) => c.storyIdx === currentIndex)?.comments ?? [];

  useEffect(() => {
    setProgress(0);
    if (showCommentSheet) return; // pause when comment sheet open
    const start = { time: Date.now(), pausedMs: 0, pauseStart: 0 };
    let localPaused = false;

    const interval = setInterval(() => {
      if (pausedRef.current) {
        if (!localPaused) {
          start.pauseStart = Date.now();
          localPaused = true;
        }
        return;
      }
      if (localPaused) {
        start.pausedMs += Date.now() - start.pauseStart;
        localPaused = false;
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
  }, [currentIndex, stories.length, onClose, showCommentSheet]);

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

  const handleCommentChange = (val: string) => {
    setCommentInput(val);
    const lastAt = val.lastIndexOf("@");
    setShowMentions(lastAt !== -1 && lastAt === val.length - 1);
  };

  const handleMentionSelect = (name: string) => {
    const lastAt = commentInput.lastIndexOf("@");
    setCommentInput(`${commentInput.substring(0, lastAt)}@${name} `);
    setShowMentions(false);
    commentInputRef.current?.focus();
  };

  const handleTap = (e: React.MouseEvent<HTMLElement>) => {
    if (showCommentSheet) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const third = rect.width / 3;
    if (x < third) goPrev();
    else if (x > third * 2) goNext();
  };

  const handlePointerDown = () => {
    holdTimerRef.current = setTimeout(() => setPaused(true), 150);
  };

  const handlePointerUp = () => {
    if (holdTimerRef.current) clearTimeout(holdTimerRef.current);
    setPaused(false);
  };

  const isLiked = liked[currentIndex];
  const displayName = profile?.displayName || "User";

  const getTimeAgo = () => {
    const ts = Number(story.timestamp) / 1_000_000;
    const mins = Math.floor((Date.now() - ts) / 60000);
    if (mins < 1) return "just now";
    if (mins < 60) return `${mins}m ago`;
    return `${Math.floor(mins / 60)}h ago`;
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[200] bg-black flex items-center justify-center"
        style={{ touchAction: "none" }}
      >
        <div
          className="relative w-full max-w-[430px] h-full max-h-dvh flex flex-col select-none"
          onPointerDown={handlePointerDown}
          onPointerUp={handlePointerUp}
          onPointerLeave={handlePointerUp}
        >
          {/* Progress bars */}
          <div className="absolute top-0 left-0 right-0 z-20 flex gap-1 px-2 pt-2">
            {stories.map((_, i) => (
              <div
                key={`prog-story-${i}-of-${stories.length}`}
                className="flex-1 h-[2px] bg-white/30 rounded-full overflow-hidden"
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

          {/* Top bar: avatar + name + time + close */}
          <div className="absolute top-6 left-0 right-0 z-20 flex items-center justify-between px-3 pt-1">
            <div className="flex items-center gap-2">
              <Avatar className="w-8 h-8 ring-2 ring-white/40">
                {profile?.avatar && (
                  <AvatarImage src={profile.avatar.getDirectURL()} />
                )}
                <AvatarFallback className="bg-gradient-to-br from-pink-500 to-purple-600 text-white text-xs font-bold">
                  {displayName[0]?.toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className="flex items-center gap-1.5">
                <span className="text-white font-semibold text-sm drop-shadow">
                  {displayName}
                </span>
                <span className="text-white/50 text-xs">{getTimeAgo()}</span>
              </div>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-black/30 flex items-center justify-center"
            >
              <X className="w-4 h-4 text-white" />
            </button>
          </div>

          {/* Story media */}
          <button
            type="button"
            className="absolute inset-0 w-full h-full"
            onClick={handleTap}
            onKeyDown={(e) => {
              if (e.key === "ArrowLeft") goPrev();
              else if (e.key === "ArrowRight") goNext();
            }}
            aria-label="Story tap navigation"
          >
            {story.image ? (
              <img
                src={story.image.getDirectURL()}
                alt="Story"
                className="w-full h-full object-cover"
              />
            ) : (
              <div
                className="w-full h-full flex items-center justify-center"
                style={{
                  background:
                    "linear-gradient(135deg, #1a0a2e 0%, #3d0a3d 50%, #1a0a0a 100%)",
                }}
              >
                <p className="text-white text-xl font-bold px-8 text-center">
                  {story.content}
                </p>
              </div>
            )}
            {/* dark gradient overlays */}
            <div className="absolute inset-x-0 top-0 h-32 bg-gradient-to-b from-black/60 to-transparent pointer-events-none" />
            <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-black/80 to-transparent pointer-events-none" />
          </button>

          {/* Double-tap heart anim */}
          <AnimatePresence>
            {likeAnim && (
              <motion.div
                initial={{ scale: 0, opacity: 1 }}
                animate={{ scale: 1.4, opacity: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.6 }}
                className="absolute inset-0 flex items-center justify-center pointer-events-none z-30"
              >
                <Heart className="w-24 h-24 fill-red-500 text-red-500" />
              </motion.div>
            )}
          </AnimatePresence>

          {/* Story caption text */}
          {story.content && story.image && (
            <div className="absolute bottom-24 left-0 right-0 px-4 z-10 pointer-events-none">
              <p className="text-white text-sm text-center drop-shadow">
                {story.content}
              </p>
            </div>
          )}

          {/* Bottom actions */}
          <div className="absolute bottom-4 left-0 right-0 z-20 px-3">
            <div className="flex items-center justify-between gap-2">
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  handleLike();
                }}
                className="flex flex-col items-center gap-0.5 active:scale-90 transition-transform"
              >
                <Heart
                  className={`w-6 h-6 transition-colors ${
                    isLiked ? "fill-red-500 text-red-500" : "text-white"
                  }`}
                />
                <span className="text-white/50 text-[9px]">Like</span>
              </button>

              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setShowCommentSheet(true);
                  setPaused(true);
                }}
                className="flex flex-col items-center gap-0.5 active:scale-90 transition-transform"
              >
                <MessageCircle className="w-6 h-6 text-white" />
                <span className="text-white/50 text-[9px]">Comment</span>
              </button>

              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  handleReply(displayName);
                  setShowCommentSheet(true);
                  setPaused(true);
                }}
                className="flex flex-col items-center gap-0.5 active:scale-90 transition-transform"
              >
                <Send className="w-6 h-6 text-white" />
                <span className="text-white/50 text-[9px]">Reply</span>
              </button>

              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  handleReply("@");
                  setShowCommentSheet(true);
                  setPaused(true);
                }}
                className="flex flex-col items-center gap-0.5 active:scale-90 transition-transform"
              >
                <span className="text-white w-6 h-6 flex items-center justify-center text-lg font-bold">
                  @
                </span>
                <span className="text-white/50 text-[9px]">Mention</span>
              </button>

              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setSaved(!saved);
                }}
                className="flex flex-col items-center gap-0.5 active:scale-90 transition-transform"
              >
                <Bookmark
                  className={`w-6 h-6 transition-colors ${
                    saved ? "fill-yellow-400 text-yellow-400" : "text-white"
                  }`}
                />
                <span className="text-white/50 text-[9px]">Save</span>
              </button>

              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setMuted(!muted);
                }}
                className="flex flex-col items-center gap-0.5 active:scale-90 transition-transform"
              >
                <VolumeX
                  className={`w-6 h-6 transition-colors ${
                    muted ? "text-yellow-400" : "text-white"
                  }`}
                />
                <span className="text-white/50 text-[9px]">Mute</span>
              </button>

              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                }}
                className="flex flex-col items-center gap-0.5 active:scale-90 transition-transform"
              >
                <MoreHorizontal className="w-6 h-6 text-white" />
                <span className="text-white/50 text-[9px]">Share</span>
              </button>
            </div>
          </div>
        </div>

        {/* Comment sheet */}
        <AnimatePresence>
          {showCommentSheet && (
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="absolute bottom-0 left-0 right-0 z-[300] rounded-t-3xl overflow-hidden"
              style={{ background: "rgba(15,10,30,0.97)", maxHeight: "60vh" }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between px-4 py-3 border-b border-white/10">
                <span className="text-white font-semibold text-sm">
                  Comments
                </span>
                <button
                  type="button"
                  onClick={() => {
                    setShowCommentSheet(false);
                    setPaused(false);
                  }}
                  className="w-7 h-7 rounded-full bg-white/10 flex items-center justify-center"
                >
                  <X className="w-3.5 h-3.5 text-white" />
                </button>
              </div>

              {/* Comments list */}
              <div
                className="overflow-y-auto px-4 py-2"
                style={{ maxHeight: "calc(60vh - 110px)" }}
              >
                {currentComments.length === 0 && (
                  <p className="text-white/30 text-sm text-center py-6">
                    No comments yet. Be the first!
                  </p>
                )}
                {currentComments.map((c, i) => (
                  <div
                    key={`comment-${c.author}-${c.text.slice(0, 10)}-${i}`}
                    className="flex items-start gap-2 mb-3"
                  >
                    <div className="w-7 h-7 rounded-full bg-gradient-to-br from-pink-500 to-purple-600 flex items-center justify-center shrink-0">
                      <span className="text-white text-xs font-bold">
                        {c.author[0]?.toUpperCase()}
                      </span>
                    </div>
                    <div className="flex-1">
                      <p className="text-white/60 text-xs font-semibold">
                        {c.author}
                      </p>
                      <p className="text-white text-sm">{c.text}</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleReply(c.author)}
                      className="text-white/30 text-xs hover:text-white/60 transition-colors"
                    >
                      Reply
                    </button>
                  </div>
                ))}
              </div>

              {/* Mention suggestions */}
              <AnimatePresence>
                {showMentions && (
                  <motion.div
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 8 }}
                    className="px-4 pb-1 flex gap-2 flex-wrap"
                  >
                    {MENTION_SUGGESTIONS.map((name) => (
                      <button
                        key={name}
                        type="button"
                        onClick={() => handleMentionSelect(name)}
                        className="text-xs text-pink-400 bg-pink-500/10 px-2 py-1 rounded-full"
                      >
                        @{name}
                      </button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Comment input */}
              <div className="flex gap-2 px-4 py-3 border-t border-white/10">
                <input
                  ref={commentInputRef}
                  value={commentInput}
                  onChange={(e) => handleCommentChange(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSendComment()}
                  placeholder="Add a comment or @mention..."
                  className="flex-1 bg-white/5 border border-white/10 rounded-full px-3 py-2 text-white text-sm placeholder:text-white/30 outline-none focus:border-pink-500/50"
                />
                <button
                  type="button"
                  onClick={handleSendComment}
                  disabled={!commentInput.trim()}
                  className="w-9 h-9 rounded-full bg-gradient-to-r from-pink-500 to-purple-600 flex items-center justify-center disabled:opacity-40"
                >
                  <Send className="w-4 h-4 text-white" />
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </AnimatePresence>
  );
}
