import { createContext, useContext, useEffect, useState } from "react";

export type ThemeId =
  | "dark"
  | "pink"
  | "gold"
  | "blue"
  | "amoled"
  | "midnight"
  | "rose";

export interface AppTheme {
  id: ThemeId;
  name: string;
  bg: string;
  accent: string;
  accentSecondary: string;
  preview: string;
}

export const THEMES: AppTheme[] = [
  {
    id: "dark",
    name: "Dark",
    bg: "#0a0a0f",
    accent: "#ec4899",
    accentSecondary: "#a855f7",
    preview: "#0a0a0f",
  },
  {
    id: "pink",
    name: "Rose",
    bg: "#110a0e",
    accent: "#f472b6",
    accentSecondary: "#e879f9",
    preview: "#110a0e",
  },
  {
    id: "gold",
    name: "Gold",
    bg: "#0e0a04",
    accent: "#f59e0b",
    accentSecondary: "#f97316",
    preview: "#0e0a04",
  },
  {
    id: "blue",
    name: "Ocean",
    bg: "#040a11",
    accent: "#38bdf8",
    accentSecondary: "#6366f1",
    preview: "#040a11",
  },
  {
    id: "amoled",
    name: "AMOLED",
    bg: "#000000",
    accent: "#ec4899",
    accentSecondary: "#a855f7",
    preview: "#000000",
  },
  {
    id: "midnight",
    name: "Midnight",
    bg: "#050510",
    accent: "#818cf8",
    accentSecondary: "#c084fc",
    preview: "#050510",
  },
  {
    id: "rose",
    name: "Deep Rose",
    bg: "#1a0a12",
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
  root.style.setProperty("--accent-primary", theme.accent);
  root.style.setProperty("--accent-secondary", theme.accentSecondary);
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
