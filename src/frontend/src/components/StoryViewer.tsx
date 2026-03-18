import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import type { Principal } from "@icp-sdk/core/principal";
import { X } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import type { Profile, Story } from "../backend";

interface Props {
  stories: Story[];
  author: Principal;
  profile: Profile | undefined;
  onClose: () => void;
}

export default function StoryViewer({
  stories,
  author: _author,
  profile,
  onClose,
}: Props) {
  const story = stories[0];
  if (!story) return null;

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
          {/* Progress bar */}
          <div className="absolute top-0 left-0 right-0 h-0.5 bg-white/20 z-10">
            <motion.div
              className="h-full bg-white"
              initial={{ width: "0%" }}
              animate={{ width: "100%" }}
              transition={{ duration: 5, ease: "linear" }}
              onAnimationComplete={onClose}
            />
          </div>

          {/* Header */}
          <div className="absolute top-4 left-4 right-4 flex items-center justify-between z-10">
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
            <div className="absolute bottom-8 left-4 right-4">
              <p className="text-white text-base font-medium drop-shadow-lg text-center">
                {story.content}
              </p>
            </div>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
