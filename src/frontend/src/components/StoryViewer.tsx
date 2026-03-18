import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import type { Principal } from "@icp-sdk/core/principal";
import { X } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useEffect, useState } from "react";
import type { Profile, Story } from "../backend";

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

  const story = stories[currentIndex];

  useEffect(() => {
    setProgress(0);
    const start = Date.now();
    const interval = setInterval(() => {
      const elapsed = Date.now() - start;
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

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[100] bg-black/90 flex items-center justify-center"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9 }}
          animate={{ scale: 1 }}
          exit={{ scale: 0.9 }}
          className="relative w-full max-w-[430px] h-full max-h-dvh flex flex-col"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Progress bars */}
          <div className="absolute top-2 left-2 right-2 flex gap-1 z-20">
            {stories.map((story, i) => (
              <div
                key={story.timestamp.toString() + String(i)}
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

          {/* Header */}
          <div className="absolute top-6 left-4 right-4 flex items-center justify-between z-10">
            <div className="flex items-center gap-2">
              <Avatar className="w-8 h-8 border border-white/50">
                {profile?.avatar && (
                  <AvatarImage src={profile.avatar.getDirectURL()} />
                )}
                <AvatarFallback className="bg-muted text-xs">
                  {profile?.displayName?.[0]?.toUpperCase() || "?"}
                </AvatarFallback>
              </Avatar>
              <span className="text-white text-sm font-semibold drop-shadow">
                {profile?.displayName || "User"}
              </span>
            </div>
            <button
              type="button"
              data-ocid="story.close_button"
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-black/30 flex items-center justify-center"
            >
              <X className="w-4 h-4 text-white" />
            </button>
          </div>

          {/* Tap zones: left = prev, right = next */}
          <div className="absolute inset-0 flex z-10">
            <button
              type="button"
              className="flex-1 h-full"
              onClick={goPrev}
              aria-label="Previous story"
            />
            <button
              type="button"
              className="flex-1 h-full"
              onClick={goNext}
              aria-label="Next story"
            />
          </div>

          {/* Content */}
          {story.image ? (
            <img
              src={story.image.getDirectURL()}
              alt="Story"
              className="w-full h-full object-cover rounded-none"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary/50 to-secondary/50 p-8">
              <p className="text-white text-2xl font-display font-bold text-center leading-snug">
                {story.content}
              </p>
            </div>
          )}

          {story.image && story.content && (
            <div className="absolute bottom-12 left-4 right-4 z-10">
              <p className="text-white text-base font-medium drop-shadow-lg text-center">
                {story.content}
              </p>
            </div>
          )}

          {/* Swipe down hint */}
          <div className="absolute bottom-4 left-0 right-0 flex flex-col items-center z-10 pointer-events-none">
            <motion.div
              animate={{ y: [0, 4, 0] }}
              transition={{ repeat: Number.POSITIVE_INFINITY, duration: 1.5 }}
              className="text-white/30 text-xs"
            >
              ↓ Swipe down to close
            </motion.div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
