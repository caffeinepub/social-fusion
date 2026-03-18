import { createContext, useContext, useEffect, useState } from "react";

export type ThemeId =
  | "dark"
  | "light"
  | "pink"
  | "gold"
  | "blue"
  | "amoled"
  | "midnight"
  | "rose"
  | "forest"
  | "sunset";

export interface AppTheme {
  id: ThemeId;
  name: string;
  bg: string;
  bgCard: string;
  bgSecondary: string;
  textPrimary: string;
  textSecondary: string;
  borderColor: string;
  accent: string;
  accentSecondary: string;
  preview: string;
}

export const THEMES: AppTheme[] = [
  {
    id: "dark",
    name: "Dark",
    bg: "#0a0a0f",
    bgCard: "#13131f",
    bgSecondary: "#1a1a2e",
    textPrimary: "#f1f0f5",
    textSecondary: "rgba(241,240,245,0.5)",
    borderColor: "rgba(255,255,255,0.08)",
    accent: "#ec4899",
    accentSecondary: "#a855f7",
    preview: "#0a0a0f",
  },
  {
    id: "light",
    name: "Light",
    bg: "#f8f7ff",
    bgCard: "#ffffff",
    bgSecondary: "#ede9ff",
    textPrimary: "#1a1030",
    textSecondary: "rgba(26,16,48,0.55)",
    borderColor: "rgba(0,0,0,0.09)",
    accent: "#ec4899",
    accentSecondary: "#a855f7",
    preview: "#f8f7ff",
  },
  {
    id: "pink",
    name: "Rose",
    bg: "#110a0e",
    bgCard: "#1e0f17",
    bgSecondary: "#2a1520",
    textPrimary: "#fff0f5",
    textSecondary: "rgba(255,240,245,0.5)",
    borderColor: "rgba(244,114,182,0.12)",
    accent: "#f472b6",
    accentSecondary: "#e879f9",
    preview: "#110a0e",
  },
  {
    id: "gold",
    name: "Gold",
    bg: "#0e0a04",
    bgCard: "#1a1305",
    bgSecondary: "#261c07",
    textPrimary: "#fff8e7",
    textSecondary: "rgba(255,248,231,0.5)",
    borderColor: "rgba(245,158,11,0.15)",
    accent: "#f59e0b",
    accentSecondary: "#f97316",
    preview: "#0e0a04",
  },
  {
    id: "blue",
    name: "Ocean",
    bg: "#040a11",
    bgCard: "#07101c",
    bgSecondary: "#0d1a2e",
    textPrimary: "#e8f4ff",
    textSecondary: "rgba(232,244,255,0.5)",
    borderColor: "rgba(56,189,248,0.12)",
    accent: "#38bdf8",
    accentSecondary: "#6366f1",
    preview: "#040a11",
  },
  {
    id: "forest",
    name: "Forest",
    bg: "#060e08",
    bgCard: "#0d1a10",
    bgSecondary: "#142817",
    textPrimary: "#e8f5ea",
    textSecondary: "rgba(232,245,234,0.5)",
    borderColor: "rgba(34,197,94,0.12)",
    accent: "#22c55e",
    accentSecondary: "#16a34a",
    preview: "#060e08",
  },
  {
    id: "sunset",
    name: "Sunset",
    bg: "#120604",
    bgCard: "#1e0c07",
    bgSecondary: "#2d1409",
    textPrimary: "#fff5ed",
    textSecondary: "rgba(255,245,237,0.5)",
    borderColor: "rgba(249,115,22,0.15)",
    accent: "#f97316",
    accentSecondary: "#ef4444",
    preview: "#120604",
  },
  {
    id: "amoled",
    name: "AMOLED",
    bg: "#000000",
    bgCard: "#0a0a0a",
    bgSecondary: "#111111",
    textPrimary: "#ffffff",
    textSecondary: "rgba(255,255,255,0.5)",
    borderColor: "rgba(255,255,255,0.06)",
    accent: "#ec4899",
    accentSecondary: "#a855f7",
    preview: "#000000",
  },
  {
    id: "midnight",
    name: "Midnight",
    bg: "#050510",
    bgCard: "#0c0c20",
    bgSecondary: "#12122e",
    textPrimary: "#eeeeff",
    textSecondary: "rgba(238,238,255,0.5)",
    borderColor: "rgba(129,140,248,0.12)",
    accent: "#818cf8",
    accentSecondary: "#c084fc",
    preview: "#050510",
  },
  {
    id: "rose",
    name: "Deep Rose",
    bg: "#1a0a12",
    bgCard: "#26101c",
    bgSecondary: "#331626",
    textPrimary: "#ffe8f0",
    textSecondary: "rgba(255,232,240,0.5)",
    borderColor: "rgba(251,113,133,0.12)",
    accent: "#fb7185",
    accentSecondary: "#f43f5e",
    preview: "#1a0a12",
  },
];

interface ThemeContextValue {
  themeId: ThemeId;
  theme: AppTheme;
  setTheme: (id: ThemeId) => void;
}

const ThemeContext = createContext<ThemeContextValue | null>(null);

function applyThemeVars(theme: AppTheme) {
  const root = document.documentElement;
  root.setAttribute("data-sf-theme", theme.id);
  root.style.setProperty("--app-bg", theme.bg);
  root.style.setProperty("--sf-bg", theme.bg);
  root.style.setProperty("--sf-bg-card", theme.bgCard);
  root.style.setProperty("--sf-bg-secondary", theme.bgSecondary);
  root.style.setProperty("--sf-text-primary", theme.textPrimary);
  root.style.setProperty("--sf-text-secondary", theme.textSecondary);
  root.style.setProperty("--sf-border", theme.borderColor);
  root.style.setProperty("--accent-primary", theme.accent);
  root.style.setProperty("--accent-secondary", theme.accentSecondary);
  // Update shadcn background for light theme
  if (theme.id === "light") {
    root.style.setProperty("--background", "250 100% 99%");
    root.style.setProperty("--foreground", "255 40% 12%");
    root.style.setProperty("--card", "0 0% 100%");
    root.style.setProperty("--card-foreground", "255 40% 12%");
    root.style.setProperty("--border", "250 20% 88%");
    root.style.setProperty("--input", "250 20% 93%");
    root.style.setProperty("--muted", "250 20% 94%");
    root.style.setProperty("--muted-foreground", "250 15% 45%");
  } else {
    root.style.setProperty("--background", "15 5% 6%");
    root.style.setProperty("--foreground", "0 0% 96%");
    root.style.setProperty("--card", "240 6% 10%");
    root.style.setProperty("--card-foreground", "0 0% 96%");
    root.style.setProperty("--border", "240 5% 18%");
    root.style.setProperty("--input", "240 5% 14%");
    root.style.setProperty("--muted", "240 5% 18%");
    root.style.setProperty("--muted-foreground", "240 5% 55%");
  }
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [themeId, setThemeId] = useState<ThemeId>(() => {
    try {
      const saved = localStorage.getItem("sf-theme");
      if (saved && THEMES.find((t) => t.id === saved)) return saved as ThemeId;
    } catch {}
    return "dark";
  });

  const theme = THEMES.find((t) => t.id === themeId) ?? THEMES[0];

  useEffect(() => {
    applyThemeVars(theme);
  }, [theme]);

  const setTheme = (id: ThemeId) => {
    setThemeId(id);
    try {
      localStorage.setItem("sf-theme", id);
    } catch {}
  };

  return (
    <ThemeContext.Provider value={{ themeId, theme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error("useTheme must be used within ThemeProvider");
  return ctx;
}
