import { motion } from "motion/react";

const QUESTIONS = [
  "What's your idea of a perfect date? 💭",
  "If you could travel anywhere right now, where would you go? ✈️",
  "What's one thing that always makes you smile? 😊",
  "What are you most passionate about in life? 🔥",
  "What's your favourite way to spend a weekend? 🌿",
  "What kind of music speaks to your soul? 🎵",
  "What's a hidden talent you have? ✨",
  "What does your ideal morning look like? ☀️",
];

export function getRandomIcebreaker(): string {
  return QUESTIONS[Math.floor(Math.random() * QUESTIONS.length)];
}

export default function IcebreakerCard({ question }: { question: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.85, y: 16 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      className="flex justify-center px-4 py-3"
    >
      <div
        className="max-w-xs w-full px-4 py-3 rounded-2xl text-center"
        style={{
          background:
            "linear-gradient(135deg, rgba(236,72,153,0.15), rgba(168,85,247,0.15))",
          border: "1px solid rgba(236,72,153,0.3)",
        }}
      >
        <p className="text-white/40 text-[10px] uppercase tracking-widest mb-1">
          Icebreaker ❄️
        </p>
        <p className="text-white/80 text-sm italic">{question}</p>
      </div>
    </motion.div>
  );
}
