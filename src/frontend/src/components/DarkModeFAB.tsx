import { Moon, Sun } from "lucide-react";
import { motion } from "motion/react";
import { useTheme } from "../contexts/ThemeContext";

export default function DarkModeFAB() {
  const { themeId, setTheme } = useTheme();
  const isLight = themeId === "light";

  const toggle = () => setTheme(isLight ? "dark" : "light");

  return (
    <motion.button
      type="button"
      data-ocid="app.toggle"
      onClick={toggle}
      whileTap={{ scale: 0.85 }}
      whileHover={{ scale: 1.1 }}
      className="fixed bottom-20 right-4 z-50 w-11 h-11 rounded-full shadow-2xl flex items-center justify-center"
      style={{
        background: isLight
          ? "linear-gradient(135deg, #1a0a2e, #0a0a1e)"
          : "linear-gradient(135deg, #fbbf24, #f97316)",
        boxShadow: isLight
          ? "0 4px 20px rgba(168,85,247,0.5)"
          : "0 4px 20px rgba(251,191,36,0.5)",
      }}
      title={isLight ? "Switch to dark mode" : "Switch to light mode"}
      aria-label={isLight ? "Switch to dark mode" : "Switch to light mode"}
    >
      <motion.div
        key={themeId}
        initial={{ rotate: -90, opacity: 0 }}
        animate={{ rotate: 0, opacity: 1 }}
        transition={{ duration: 0.25 }}
      >
        {isLight ? (
          <Moon className="w-5 h-5 text-white" />
        ) : (
          <Sun className="w-5 h-5 text-yellow-900" />
        )}
      </motion.div>
    </motion.button>
  );
}
