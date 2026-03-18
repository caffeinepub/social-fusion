import { Button } from "@/components/ui/button";
import { ArrowLeft, Radio } from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";

interface Props {
  onBack: () => void;
}

export default function LiveStreamsScreen({ onBack }: Props) {
  const [isGoingLive, setIsGoingLive] = useState(false);

  const handleGoLive = () => {
    setIsGoingLive(true);
    setTimeout(() => {
      setIsGoingLive(false);
    }, 2000);
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: 40 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 40 }}
      transition={{ duration: 0.2 }}
      data-ocid="discover.panel"
      className="flex flex-col h-full bg-[#0a0a0f]"
    >
      {/* Header */}
      <div className="flex items-center px-4 pt-5 pb-4 border-b border-white/5 shrink-0">
        <button
          type="button"
          data-ocid="discover.close_button"
          onClick={onBack}
          className="w-9 h-9 rounded-full flex items-center justify-center text-white/70 mr-3"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div className="flex-1">
          <h1 className="text-xl font-bold font-display text-white">
            Live Streams
          </h1>
          <p className="text-white/30 text-xs">0 live now</p>
        </div>
        <Button
          data-ocid="discover.primary_button"
          onClick={handleGoLive}
          disabled={isGoingLive}
          className="h-9 px-4 rounded-full bg-gradient-to-r from-pink-500 to-purple-600 text-white text-sm font-semibold border-0 shadow-lg shadow-pink-500/20 flex items-center gap-1.5"
        >
          {isGoingLive ? (
            <>
              <span className="w-2 h-2 rounded-full bg-white animate-ping" />
              Going Live...
            </>
          ) : (
            <>
              <Radio className="w-4 h-4" />
              Go Live
            </>
          )}
        </Button>
      </div>

      {/* Empty state */}
      <div
        data-ocid="discover.empty_state"
        className="flex-1 flex flex-col items-center justify-center gap-5 px-8 text-center pb-20"
      >
        <motion.div
          animate={{ y: [0, -6, 0] }}
          transition={{
            repeat: Number.POSITIVE_INFINITY,
            duration: 3,
            ease: "easeInOut",
          }}
          className="text-7xl"
        >
          📡
        </motion.div>
        <div>
          <p className="text-white font-semibold text-xl font-display">
            No live streams right now.
          </p>
          <p className="text-white/40 text-sm mt-1">Be the first to go live!</p>
        </div>
        <Button
          data-ocid="discover.secondary_button"
          onClick={handleGoLive}
          disabled={isGoingLive}
          className="h-12 px-8 rounded-full bg-gradient-to-r from-pink-500 to-purple-600 text-white font-semibold border-0 shadow-lg shadow-pink-500/20"
        >
          {isGoingLive ? (
            <>
              <span className="w-2.5 h-2.5 rounded-full bg-white animate-ping mr-2" />
              Starting...
            </>
          ) : (
            <>
              <Radio className="w-4 h-4 mr-2" />
              Start Broadcasting
            </>
          )}
        </Button>
      </div>
    </motion.div>
  );
}
