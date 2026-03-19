import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Bell,
  CheckCircle2,
  ChevronRight,
  Clock,
  Database,
  Download,
  Globe,
  HelpCircle,
  Info,
  KeyRound,
  Lock,
  MessageSquare,
  Moon,
  Palette,
  Settings2,
  ShieldCheck,
  ShieldOff,
  Sliders,
  Sparkles,
  Trash2,
  Type,
  User,
  X,
  Zap,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useEffect, useState } from "react";
import { usePrivacy } from "../contexts/PrivacyContext";
import { THEMES as SF_THEMES, useTheme } from "../contexts/ThemeContext";
import { useInternetIdentity } from "../hooks/useInternetIdentity";

interface AppSettingsSheetProps {
  open: boolean;
  onClose: () => void;
  initialTab?: string;
}

// Themes are imported from ThemeContext as SF_THEMES

const ACCENTS = [
  { id: "pink", color: "#ec4899" },
  { id: "purple", color: "#a855f7" },
  { id: "blue", color: "#3b82f6" },
  { id: "green", color: "#22c55e" },
  { id: "orange", color: "#f97316" },
  { id: "red", color: "#ef4444" },
];

function loadSetting<T>(key: string, fallback: T): T {
  try {
    const v = localStorage.getItem(key);
    if (v === null) return fallback;
    return JSON.parse(v) as T;
  } catch {
    return fallback;
  }
}

function saveSetting(key: string, value: unknown) {
  localStorage.setItem(key, JSON.stringify(value));
}

function applyTheme(bg: string, accent: string) {
  document.documentElement.style.setProperty("--app-bg", bg);
  document.documentElement.style.setProperty("--accent-primary", accent);
}

export function AppSettingsSheet({
  open,
  onClose,
  initialTab,
}: AppSettingsSheetProps) {
  const [theme, setTheme] = useState(() => loadSetting("sf_theme", "dark"));
  const [accent, setAccent] = useState(() =>
    loadSetting("sf_accent", "#ec4899"),
  );
  const [fontSize, setFontSize] = useState(() =>
    loadSetting("sf_fontsize", "medium"),
  );
  const [bubbleStyle, setBubbleStyle] = useState(() =>
    loadSetting("sf_bubble", "rounded"),
  );

  const [profileVisibility, setProfileVisibility] = useState(() =>
    loadSetting("sf_profile_visibility", "public"),
  );
  const [whoCanMessage, setWhoCanMessage] = useState(() =>
    loadSetting("sf_who_message", "everyone"),
  );
  const [showLastSeen, setShowLastSeen] = useState(() =>
    loadSetting("sf_last_seen", "everyone"),
  );
  const [readReceipts, setReadReceipts] = useState(() =>
    loadSetting("sf_read_receipts", true),
  );
  const [incognito, setIncognito] = useState(() =>
    loadSetting("sf_incognito", false),
  );

  const [pushNotif, setPushNotif] = useState(() =>
    loadSetting("sf_push_notif", true),
  );
  const [notifMatches, setNotifMatches] = useState(() =>
    loadSetting("sf_notif_matches", true),
  );
  const [notifMessages, setNotifMessages] = useState(() =>
    loadSetting("sf_notif_messages", true),
  );
  const [notifLikes, setNotifLikes] = useState(() =>
    loadSetting("sf_notif_likes", true),
  );
  const [notifComments, setNotifComments] = useState(() =>
    loadSetting("sf_notif_comments", true),
  );
  const [notifFollows, setNotifFollows] = useState(() =>
    loadSetting("sf_notif_follows", true),
  );
  const [notifLive, setNotifLive] = useState(() =>
    loadSetting("sf_notif_live", true),
  );
  const [notifSuperLikes, setNotifSuperLikes] = useState(() =>
    loadSetting("sf_notif_superlikes", true),
  );

  const [deleteConfirm, setDeleteConfirm] = useState(false);
  const [deactivateConfirm, setDeactivateConfirm] = useState(false);
  // Advanced Settings
  const [boostScheduler, setBoostScheduler] = useState(() =>
    loadSetting("adv_boostScheduler", false),
  );
  const [boostTime, setBoostTime] = useState(() =>
    loadSetting("adv_boostTime", "20:00-22:00"),
  );
  const [advReadReceipts, setAdvReadReceipts] = useState(() =>
    loadSetting("adv_readReceipts", true),
  );
  const [incognitoMode, setIncognitoMode] = useState(() =>
    loadSetting("adv_incognito", false),
  );
  const [autoTranslate, setAutoTranslate] = useState(() =>
    loadSetting("adv_autoTranslate", false),
  );
  const [smartReply, setSmartReply] = useState(() =>
    loadSetting("adv_smartReply", true),
  );
  const [dailyMatchLimit, setDailyMatchLimit] = useState<number[]>(() =>
    loadSetting("adv_dailyMatch", [20]),
  );
  const [distanceUnit, setDistanceUnit] = useState<"km" | "miles">(() =>
    loadSetting("adv_distUnit", "km"),
  );
  const [activityStatus, setActivityStatus] = useState(() =>
    loadSetting("adv_actStatus", "Everyone"),
  );
  const [dataSheetOpen, setDataSheetOpen] = useState(false);
  // ── New settings state ──
  // Notification settings (sf_notif_settings)
  const [notifSaveState, setNotifSaveState] = useState<"idle" | "saved">(
    "idle",
  );
  const [notifMatchesNew, setNotifMatchesNew] = useState(
    () => loadSetting("sf_notif_settings", { matches: true }).matches ?? true,
  );
  const [notifNewMessages, setNotifNewMessages] = useState(
    () =>
      loadSetting("sf_notif_settings", { newMessages: true }).newMessages ??
      true,
  );
  const [notifStoryLikes, setNotifStoryLikes] = useState(
    () =>
      loadSetting("sf_notif_settings", { storyLikes: true }).storyLikes ?? true,
  );
  const [notifProfileViews, setNotifProfileViews] = useState(
    () =>
      loadSetting("sf_notif_settings", { profileViews: false }).profileViews ??
      false,
  );
  const [notifEventInvites, setNotifEventInvites] = useState(
    () =>
      loadSetting("sf_notif_settings", { eventInvites: true }).eventInvites ??
      true,
  );
  // Privacy settings (sf_privacy_settings)
  const [privSaveState, setPrivSaveState] = useState<"idle" | "saved">("idle");
  // Chat settings (sf_chat_settings)
  const [chatWhoCanMsg, setChatWhoCanMsg] = useState<string>(
    () =>
      loadSetting("sf_chat_settings", { whoCanMessage: "everyone" })
        .whoCanMessage ?? "everyone",
  );
  const [chatReadReceipts, setChatReadReceipts] = useState(
    () =>
      loadSetting("sf_chat_settings", { showReadReceipts: true })
        .showReadReceipts ?? true,
  );
  const [chatTypingIndicator, setChatTypingIndicator] = useState(
    () =>
      loadSetting("sf_chat_settings", { showTypingIndicator: true })
        .showTypingIndicator ?? true,
  );
  const [chatMsgApproval, setChatMsgApproval] = useState(
    () =>
      loadSetting("sf_chat_settings", { requireMessageApproval: false })
        .requireMessageApproval ?? false,
  );
  const [chatSaveState, setChatSaveState] = useState<"idle" | "saved">("idle");
  // App Preferences (sf_app_prefs)
  const [prefLanguage, setPrefLanguage] = useState(
    () =>
      loadSetting("sf_app_prefs", { language: "English" }).language ??
      "English",
  );
  const [prefDistUnit, setPrefDistUnit] = useState(
    () => loadSetting("sf_app_prefs", { distUnit: "km" }).distUnit ?? "km",
  );
  const [prefAutoTrans, setPrefAutoTrans] = useState(
    () =>
      loadSetting("sf_app_prefs", { autoTranslate: false }).autoTranslate ??
      false,
  );
  const [prefSaveState, setPrefSaveState] = useState<"idle" | "saved">("idle");
  // Boost settings (sf_boost_settings)
  const [boostOn, setBoostOn] = useState(
    () => loadSetting("sf_boost_settings", { boost: false }).boost ?? false,
  );
  const [boostSchedule, setBoostSchedule] = useState<string>(
    () =>
      loadSetting("sf_boost_settings", { schedule: "Morning" }).schedule ??
      "Morning",
  );
  const [boostDuration, setBoostDuration] = useState<string>(
    () =>
      loadSetting("sf_boost_settings", { duration: "1 hour" }).duration ??
      "1 hour",
  );
  const [boostSaveState, setBoostSaveState] = useState<"idle" | "saved">(
    "idle",
  );
  // Theme save state
  const [themeSaveState, setThemeSaveState] = useState<"idle" | "saved">(
    "idle",
  );
  // Account display name
  const [displayNameInput, setDisplayNameInput] = useState("");
  // Data & storage clear state
  const [cacheCleared, setCacheCleared] = useState(false);
  // FAQ open
  const [openFaq, setOpenFaq] = useState<string | null>(null);
  const [appLock, setAppLock] = useState(() =>
    loadSetting("adv_appLock", false),
  );
  const [pinSetup, setPinSetup] = useState("");
  const [pinOpen, setPinOpen] = useState(false);

  const { setTheme: setGlobalTheme, themeId: globalThemeId } = useTheme();
  const { setMyPrivacy } = usePrivacy();
  const { identity } = useInternetIdentity();

  useEffect(() => {
    const themeBg = SF_THEMES.find((t) => t.id === theme)?.bg ?? "#0a0a0f";
    applyTheme(themeBg, accent);
  }, [accent, theme]);

  function setAndSaveTheme(id: string) {
    setTheme(id);
    saveSetting("sf_theme", id);
    setGlobalTheme(id as any);
  }

  function setAndSaveAccent(color: string) {
    setAccent(color);
    saveSetting("sf_accent", color);
  }

  // Sync privacy with PrivacyContext
  useEffect(() => {
    const principal = identity?.getPrincipal()?.toString();
    if (!principal) return;
    setMyPrivacy(principal, profileVisibility === "private");
  }, [profileVisibility, identity, setMyPrivacy]);

  const ToggleRow = ({
    label,
    value,
    onChange,
    desc,
  }: {
    label: string;
    value: boolean;
    onChange: (v: boolean) => void;
    desc?: string;
  }) => (
    <div className="flex items-center justify-between py-3 border-b border-white/5">
      <div>
        <p className="text-white/90 text-sm">{label}</p>
        {desc && <p className="text-white/30 text-xs mt-0.5">{desc}</p>}
      </div>
      <Switch
        checked={value}
        onCheckedChange={(v) => {
          onChange(v);
          saveSetting(`sf_${label.toLowerCase().replace(/\s+/g, "_")}`, v);
        }}
      />
    </div>
  );

  const RadioGroup = ({
    label,
    options,
    value,
    onChange,
    storageKey,
  }: {
    label: string;
    options: string[];
    value: string;
    onChange: (v: string) => void;
    storageKey: string;
  }) => (
    <div className="py-3 border-b border-white/5">
      <p className="text-white/60 text-xs mb-2">{label}</p>
      <div className="flex gap-2 flex-wrap">
        {options.map((opt) => (
          <button
            key={opt}
            type="button"
            onClick={() => {
              onChange(opt);
              saveSetting(storageKey, opt);
            }}
            className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
              value === opt
                ? "text-white"
                : "bg-white/5 text-white/50 border border-white/10"
            }`}
            style={
              value === opt
                ? { background: "linear-gradient(to right, #ec4899, #a855f7)" }
                : undefined
            }
          >
            {opt.charAt(0).toUpperCase() + opt.slice(1)}
          </button>
        ))}
      </div>
    </div>
  );

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.5 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[90] bg-black"
            onClick={onClose}
          />
          <motion.div
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", damping: 30, stiffness: 400 }}
            className="fixed bottom-0 left-0 right-0 z-[95] flex flex-col bg-[#0f0f1a] rounded-t-3xl"
            style={{ height: "90vh" }}
            data-ocid="settings.sheet"
          >
            {/* Drag handle */}
            <div className="flex justify-center pt-3 pb-1 shrink-0">
              <div className="w-10 h-1 rounded-full bg-white/20" />
            </div>

            {/* Header */}
            <div className="flex items-center justify-between px-5 py-3 shrink-0 border-b border-white/10">
              <div className="flex items-center gap-2">
                <Settings2 className="w-5 h-5 text-pink-400" />
                <h2 className="text-white font-bold text-lg">Settings</h2>
              </div>
              <button
                type="button"
                data-ocid="settings.close_button"
                onClick={onClose}
                className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center"
              >
                <X className="w-4 h-4 text-white" />
              </button>
            </div>

            <Tabs
              defaultValue={initialTab ?? "customize"}
              className="flex-1 flex flex-col min-h-0"
            >
              <TabsList className="mx-4 mt-3 shrink-0 grid grid-cols-6 bg-white/5 h-10">
                <TabsTrigger value="customize" className="text-[10px] px-0.5">
                  <Palette className="w-3 h-3 mr-0.5" />
                  Theme
                </TabsTrigger>
                <TabsTrigger value="privacy" className="text-[10px] px-0.5">
                  <Lock className="w-3 h-3 mr-0.5" />
                  Privacy
                </TabsTrigger>
                <TabsTrigger
                  value="notifications"
                  className="text-[10px] px-0.5"
                >
                  <Bell className="w-3 h-3 mr-0.5" />
                  Notifs
                </TabsTrigger>
                <TabsTrigger value="chat" className="text-[10px] px-0.5">
                  <MessageSquare className="w-3 h-3 mr-0.5" />
                  Chat
                </TabsTrigger>
                <TabsTrigger value="account" className="text-[10px] px-0.5">
                  <User className="w-3 h-3 mr-0.5" />
                  Account
                </TabsTrigger>
                <TabsTrigger value="advanced" className="text-[10px] px-0.5">
                  <Sliders className="w-3 h-3 mr-0.5" />
                  More
                </TabsTrigger>
              </TabsList>

              {/* Customize Tab */}
              <TabsContent
                value="customize"
                className="flex-1 overflow-y-auto px-4 pb-8"
              >
                <div className="mt-4">
                  {/* Theme */}
                  <div className="mb-5">
                    <div className="flex items-center gap-2 mb-3">
                      <Moon className="w-4 h-4 text-purple-400" />
                      <h3 className="text-white/80 text-sm font-semibold">
                        App Theme
                      </h3>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      {SF_THEMES.map((t) => (
                        <button
                          key={t.id}
                          type="button"
                          data-ocid="settings.toggle"
                          onClick={() => setAndSaveTheme(t.id)}
                          className={`flex items-center gap-2 p-3 rounded-xl border transition-all ${
                            theme === t.id || globalThemeId === t.id
                              ? "border-pink-500/60 bg-pink-500/10"
                              : "border-white/10 bg-white/5"
                          }`}
                        >
                          <div
                            className="w-6 h-6 rounded-full border border-white/20"
                            style={{ background: t.bg }}
                          />
                          <span className="text-white/80 text-sm">
                            {t.name}
                          </span>
                          {(theme === t.id || globalThemeId === t.id) && (
                            <CheckCircle2 className="w-4 h-4 text-pink-400 ml-auto" />
                          )}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Save Theme Button */}
                  <button
                    type="button"
                    data-ocid="settings.save_button"
                    onClick={() => {
                      saveSetting("sf_theme", theme);
                      setThemeSaveState("saved");
                      setTimeout(() => setThemeSaveState("idle"), 2000);
                    }}
                    className="w-full py-2.5 rounded-xl text-white font-semibold text-sm mb-4 transition-all"
                    style={{
                      background:
                        themeSaveState === "saved"
                          ? "linear-gradient(135deg,#10b981,#059669)"
                          : "linear-gradient(135deg,#ec4899,#a855f7)",
                    }}
                  >
                    {themeSaveState === "saved"
                      ? "✓ Theme Saved!"
                      : "Save Theme"}
                  </button>

                  {/* Accent Color */}
                  <div className="mb-5">
                    <div className="flex items-center gap-2 mb-3">
                      <Palette className="w-4 h-4 text-pink-400" />
                      <h3 className="text-white/80 text-sm font-semibold">
                        Accent Color
                      </h3>
                    </div>
                    <div className="flex gap-3">
                      {ACCENTS.map((a) => (
                        <button
                          key={a.id}
                          type="button"
                          data-ocid="settings.toggle"
                          onClick={() => setAndSaveAccent(a.color)}
                          className="relative w-9 h-9 rounded-full transition-transform active:scale-90"
                          style={{ background: a.color }}
                        >
                          {accent === a.color && (
                            <span className="absolute inset-0 flex items-center justify-center">
                              <CheckCircle2 className="w-4 h-4 text-white" />
                            </span>
                          )}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Font Size */}
                  <div className="mb-5">
                    <div className="flex items-center gap-2 mb-3">
                      <Type className="w-4 h-4 text-blue-400" />
                      <h3 className="text-white/80 text-sm font-semibold">
                        Font Size
                      </h3>
                    </div>
                    <div className="flex gap-2">
                      {["small", "medium", "large"].map((s) => (
                        <button
                          key={s}
                          type="button"
                          data-ocid="settings.radio"
                          onClick={() => {
                            setFontSize(s);
                            saveSetting("sf_fontsize", s);
                          }}
                          className={`px-4 py-2 rounded-full text-sm border transition-all ${
                            fontSize === s
                              ? "text-white border-transparent"
                              : "text-white/50 border-white/10 bg-white/5"
                          }`}
                          style={
                            fontSize === s
                              ? {
                                  background:
                                    "linear-gradient(to right, #ec4899, #a855f7)",
                                }
                              : undefined
                          }
                        >
                          {s.charAt(0).toUpperCase() + s.slice(1)}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Chat Bubble Style */}
                  <div>
                    <div className="flex items-center gap-2 mb-3">
                      <MessageSquare className="w-4 h-4 text-green-400" />
                      <h3 className="text-white/80 text-sm font-semibold">
                        Chat Bubble Style
                      </h3>
                    </div>
                    <div className="flex gap-2">
                      {["rounded", "square", "bubble"].map((s) => (
                        <button
                          key={s}
                          type="button"
                          data-ocid="settings.radio"
                          onClick={() => {
                            setBubbleStyle(s);
                            saveSetting("sf_bubble", s);
                          }}
                          className={`px-4 py-2 rounded-full text-sm border transition-all ${
                            bubbleStyle === s
                              ? "text-white border-transparent"
                              : "text-white/50 border-white/10 bg-white/5"
                          }`}
                          style={
                            bubbleStyle === s
                              ? {
                                  background:
                                    "linear-gradient(to right, #ec4899, #a855f7)",
                                }
                              : undefined
                          }
                        >
                          {s.charAt(0).toUpperCase() + s.slice(1)}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Profile Layout Styles */}
                  <div className="mt-5">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <Sparkles className="w-4 h-4 text-yellow-400" />
                        <h3 className="text-white/80 text-sm font-semibold">
                          Profile Layout Style
                        </h3>
                      </div>
                      <span
                        className="text-xs px-2 py-0.5 rounded-full text-yellow-300 font-semibold"
                        style={{ background: "rgba(245,158,11,0.2)" }}
                      >
                        Premium
                      </span>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      {[
                        {
                          id: "classic",
                          label: "Classic",
                          icon: "🎭",
                          desc: "Clean & elegant",
                        },
                        {
                          id: "editorial",
                          label: "Editorial",
                          icon: "📰",
                          desc: "Bold & typographic",
                        },
                        {
                          id: "luxury",
                          label: "Luxury",
                          icon: "👑",
                          desc: "Gold & premium",
                        },
                        {
                          id: "minimal",
                          label: "Minimal",
                          icon: "⬜",
                          desc: "Pure simplicity",
                        },
                        {
                          id: "vibrant",
                          label: "Vibrant",
                          icon: "🌈",
                          desc: "Colorful & expressive",
                        },
                        {
                          id: "neon",
                          label: "Neon",
                          icon: "⚡",
                          desc: "Electric glow",
                        },
                        {
                          id: "retro",
                          label: "Retro",
                          icon: "📺",
                          desc: "Vintage vibes",
                        },
                        {
                          id: "nature",
                          label: "Nature",
                          icon: "🌿",
                          desc: "Earthy & organic",
                        },
                        {
                          id: "cosmic",
                          label: "Cosmic",
                          icon: "🌌",
                          desc: "Space & stars",
                        },
                        {
                          id: "glassmorphic",
                          label: "Glass",
                          icon: "💎",
                          desc: "Frosted glass",
                        },
                        {
                          id: "brutalist",
                          label: "Brutalist",
                          icon: "🧱",
                          desc: "Bold & raw",
                        },
                        {
                          id: "watercolor",
                          label: "Watercolor",
                          icon: "🎨",
                          desc: "Soft & artistic",
                        },
                      ].map((style) => {
                        const isPremiumUser = (() => {
                          try {
                            const d = JSON.parse(
                              localStorage.getItem("socialFusionPremium") ||
                                "null",
                            );
                            return d?.isPremium && d.expiry > Date.now();
                          } catch {
                            return false;
                          }
                        })();
                        const isLocked =
                          !isPremiumUser &&
                          [
                            "editorial",
                            "luxury",
                            "vibrant",
                            "neon",
                            "retro",
                            "nature",
                            "cosmic",
                            "glassmorphic",
                            "brutalist",
                            "watercolor",
                          ].includes(style.id);
                        return (
                          <button
                            key={style.id}
                            type="button"
                            data-ocid="settings.toggle"
                            onClick={() => {
                              if (isLocked) return;
                              saveSetting("sf_profile_style", style.id);
                            }}
                            className="flex items-center gap-2 p-3 rounded-xl border transition-all relative overflow-hidden"
                            style={{
                              borderColor: isLocked
                                ? "rgba(255,255,255,0.08)"
                                : "rgba(236,72,153,0.3)",
                              background: isLocked
                                ? "rgba(255,255,255,0.03)"
                                : "rgba(236,72,153,0.08)",
                            }}
                          >
                            <span className="text-lg shrink-0">
                              {style.icon}
                            </span>
                            <div className="flex flex-col items-start">
                              <span className="text-white/80 text-xs font-semibold">
                                {style.label}
                              </span>
                              <span className="text-white/30 text-[10px]">
                                {style.desc}
                              </span>
                            </div>
                            {isLocked && (
                              <span className="absolute top-1 right-1 text-[8px] text-yellow-400 font-bold">
                                PRO
                              </span>
                            )}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </TabsContent>

              {/* Privacy Tab */}
              <TabsContent
                value="privacy"
                className="flex-1 overflow-y-auto px-4 pb-8"
              >
                <div className="mt-4">
                  <RadioGroup
                    label="Profile Visibility"
                    options={["public", "matches", "private"]}
                    value={profileVisibility}
                    onChange={setProfileVisibility}
                    storageKey="sf_profile_visibility"
                  />
                  <RadioGroup
                    label="Who Can Message Me"
                    options={["everyone", "matches", "nobody"]}
                    value={whoCanMessage}
                    onChange={setWhoCanMessage}
                    storageKey="sf_who_message"
                  />
                  <RadioGroup
                    label="Show Last Seen"
                    options={["everyone", "matches", "nobody"]}
                    value={showLastSeen}
                    onChange={setShowLastSeen}
                    storageKey="sf_last_seen"
                  />
                  <ToggleRow
                    label="Read Receipts"
                    value={readReceipts}
                    onChange={setReadReceipts}
                    desc="Let others know when you've read their messages"
                  />
                  <ToggleRow
                    label="Incognito Browse"
                    value={incognito}
                    onChange={setIncognito}
                    desc="Browse profiles without appearing in their views"
                  />

                  <div className="mt-4 flex flex-col gap-2">
                    <button
                      type="button"
                      data-ocid="settings.button"
                      className="flex items-center justify-between w-full p-4 bg-white/5 border border-white/10 rounded-xl"
                    >
                      <div className="flex items-center gap-3">
                        <ShieldOff className="w-4 h-4 text-red-400" />
                        <span className="text-white/80 text-sm">
                          Block List
                        </span>
                      </div>
                      <ChevronRight className="w-4 h-4 text-white/30" />
                    </button>
                    <button
                      type="button"
                      data-ocid="settings.button"
                      className="flex items-center justify-between w-full p-4 bg-white/5 border border-white/10 rounded-xl"
                    >
                      <div className="flex items-center gap-3">
                        <Download className="w-4 h-4 text-blue-400" />
                        <span className="text-white/80 text-sm">
                          Download My Data
                        </span>
                      </div>
                      <ChevronRight className="w-4 h-4 text-white/30" />
                    </button>
                  </div>
                </div>
                {/* Save Privacy Settings Button */}
                <button
                  type="button"
                  data-ocid="settings.save_button"
                  onClick={() => {
                    saveSetting("sf_privacy_settings", {
                      profileVisibility,
                      whoCanMessage,
                      showOnlineStatus: showLastSeen,
                    });
                    try {
                      window.dispatchEvent(
                        new CustomEvent("sf:privacy-changed"),
                      );
                    } catch {}
                    setPrivSaveState("saved");
                    setTimeout(() => setPrivSaveState("idle"), 2000);
                  }}
                  className="mt-4 w-full py-3 rounded-2xl text-white font-semibold text-sm transition-all"
                  style={{
                    background:
                      privSaveState === "saved"
                        ? "linear-gradient(135deg,#10b981,#059669)"
                        : "linear-gradient(135deg,#ec4899,#a855f7)",
                  }}
                >
                  {privSaveState === "saved"
                    ? "✓ Saved!"
                    : "Save Privacy Settings"}
                </button>
              </TabsContent>

              {/* Notifications Tab */}
              <TabsContent
                value="notifications"
                className="flex-1 overflow-y-auto px-4 pb-8"
              >
                <div className="mt-4">
                  <ToggleRow
                    label="Push Notifications"
                    value={pushNotif}
                    onChange={setPushNotif}
                    desc="Master toggle for all notifications"
                  />
                  <div className="mt-2 pl-2 border-l-2 border-white/10">
                    <ToggleRow
                      label="New Matches"
                      value={notifMatches && pushNotif}
                      onChange={(v) => setNotifMatches(v)}
                    />
                    <ToggleRow
                      label="Messages"
                      value={notifMessages && pushNotif}
                      onChange={(v) => setNotifMessages(v)}
                    />
                    <ToggleRow
                      label="Likes"
                      value={notifLikes && pushNotif}
                      onChange={(v) => setNotifLikes(v)}
                    />
                    <ToggleRow
                      label="Comments"
                      value={notifComments && pushNotif}
                      onChange={(v) => setNotifComments(v)}
                    />
                    <ToggleRow
                      label="Follows"
                      value={notifFollows && pushNotif}
                      onChange={(v) => setNotifFollows(v)}
                    />
                    <ToggleRow
                      label="Live Streams"
                      value={notifLive && pushNotif}
                      onChange={(v) => setNotifLive(v)}
                    />
                    <ToggleRow
                      label="Super Likes"
                      value={notifSuperLikes && pushNotif}
                      onChange={(v) => setNotifSuperLikes(v)}
                    />
                  </div>
                </div>
                {/* Save Notifications Button */}
                <button
                  type="button"
                  data-ocid="settings.save_button"
                  onClick={() => {
                    saveSetting("sf_notif_settings", {
                      matches: notifMatchesNew,
                      newMessages: notifNewMessages,
                      storyLikes: notifStoryLikes,
                      profileViews: notifProfileViews,
                      eventInvites: notifEventInvites,
                    });
                    saveSetting("sf_notif_matches", notifMatchesNew);
                    saveSetting("sf_notif_messages", notifNewMessages);
                    setNotifSaveState("saved");
                    setTimeout(() => setNotifSaveState("idle"), 2000);
                  }}
                  className="mt-4 w-full py-3 rounded-2xl text-white font-semibold text-sm transition-all"
                  style={{
                    background:
                      notifSaveState === "saved"
                        ? "linear-gradient(135deg,#10b981,#059669)"
                        : "linear-gradient(135deg,#ec4899,#a855f7)",
                  }}
                >
                  {notifSaveState === "saved"
                    ? "✓ Saved!"
                    : "Save Notification Settings"}
                </button>
                {/* Additional granular notif toggles */}
                <div className="mt-4 p-3 bg-white/5 rounded-xl border border-white/10">
                  <p className="text-white/50 text-xs font-semibold mb-3 uppercase tracking-wider">
                    Granular Controls
                  </p>
                  {[
                    {
                      label: "Matches",
                      value: notifMatchesNew,
                      onChange: setNotifMatchesNew,
                    },
                    {
                      label: "New Messages",
                      value: notifNewMessages,
                      onChange: setNotifNewMessages,
                    },
                    {
                      label: "Story Likes",
                      value: notifStoryLikes,
                      onChange: setNotifStoryLikes,
                    },
                    {
                      label: "Profile Views",
                      value: notifProfileViews,
                      onChange: setNotifProfileViews,
                    },
                    {
                      label: "Event Invites",
                      value: notifEventInvites,
                      onChange: setNotifEventInvites,
                    },
                  ].map(({ label, value, onChange }) => (
                    <div
                      key={label}
                      className="flex items-center justify-between py-2 border-b border-white/5 last:border-0"
                    >
                      <span className="text-white/80 text-sm">{label}</span>
                      <Switch checked={value} onCheckedChange={onChange} />
                    </div>
                  ))}
                </div>
              </TabsContent>

              {/* Chat Tab */}
              <TabsContent
                value="chat"
                className="flex-1 overflow-y-auto px-4 pb-8"
              >
                <div className="mt-4">
                  <p className="text-white/40 text-xs uppercase tracking-wider font-semibold mb-3">
                    Chat Privacy
                  </p>
                  <div className="p-3 bg-white/5 rounded-xl border border-white/10 mb-3">
                    <p className="text-white/60 text-xs mb-2">
                      Who can message me
                    </p>
                    <div className="flex gap-2">
                      {["everyone", "matchesOnly", "nobody"].map((opt) => (
                        <button
                          key={opt}
                          type="button"
                          onClick={() => setChatWhoCanMsg(opt)}
                          className="flex-1 py-2 rounded-full text-xs font-medium transition-all"
                          style={
                            chatWhoCanMsg === opt
                              ? {
                                  background:
                                    "linear-gradient(to right, #ec4899, #a855f7)",
                                  color: "white",
                                }
                              : {
                                  background: "rgba(255,255,255,0.05)",
                                  color: "rgba(255,255,255,0.5)",
                                  border: "1px solid rgba(255,255,255,0.1)",
                                }
                          }
                        >
                          {opt === "matchesOnly"
                            ? "Matches"
                            : opt.charAt(0).toUpperCase() + opt.slice(1)}
                        </button>
                      ))}
                    </div>
                  </div>
                  {[
                    {
                      label: "Show Read Receipts",
                      desc: "Let others know when you read their messages",
                      value: chatReadReceipts,
                      onChange: setChatReadReceipts,
                    },
                    {
                      label: "Typing Indicator",
                      desc: "Show when you're typing a reply",
                      value: chatTypingIndicator,
                      onChange: setChatTypingIndicator,
                    },
                    {
                      label: "Message Request Approval",
                      desc: "Strangers go to pending before chatting",
                      value: chatMsgApproval,
                      onChange: setChatMsgApproval,
                    },
                  ].map(({ label, desc, value, onChange }) => (
                    <div
                      key={label}
                      className="flex items-center justify-between py-3 border-b border-white/5"
                    >
                      <div>
                        <p className="text-white/90 text-sm">{label}</p>
                        <p className="text-white/30 text-xs mt-0.5">{desc}</p>
                      </div>
                      <Switch checked={value} onCheckedChange={onChange} />
                    </div>
                  ))}
                  <button
                    type="button"
                    data-ocid="settings.save_button"
                    onClick={() => {
                      saveSetting("sf_chat_settings", {
                        whoCanMessage: chatWhoCanMsg,
                        showReadReceipts: chatReadReceipts,
                        showTypingIndicator: chatTypingIndicator,
                        requireMessageApproval: chatMsgApproval,
                      });
                      saveSetting("sf_who_message", chatWhoCanMsg);
                      setChatSaveState("saved");
                      setTimeout(() => setChatSaveState("idle"), 2000);
                    }}
                    className="mt-4 w-full py-3 rounded-2xl text-white font-semibold text-sm transition-all"
                    style={{
                      background:
                        chatSaveState === "saved"
                          ? "linear-gradient(135deg,#10b981,#059669)"
                          : "linear-gradient(135deg,#ec4899,#a855f7)",
                    }}
                  >
                    {chatSaveState === "saved"
                      ? "✓ Saved!"
                      : "Save Chat Settings"}
                  </button>
                </div>
              </TabsContent>

              {/* Account Tab */}
              <TabsContent
                value="account"
                className="flex-1 overflow-y-auto px-4 pb-8"
              >
                <div className="mt-4 flex flex-col gap-2">
                  {[
                    {
                      icon: User,
                      label: "Edit Profile",
                      color: "text-pink-400",
                    },
                    {
                      icon: Lock,
                      label: "Change Password",
                      color: "text-purple-400",
                    },
                    {
                      icon: CheckCircle2,
                      label: "Linked Accounts",
                      color: "text-green-400",
                      sub: "Internet Identity ● Connected",
                    },
                    {
                      icon: HelpCircle,
                      label: "Help & Support",
                      color: "text-blue-400",
                    },
                  ].map(({ icon: Icon, label, color, sub }) => (
                    <button
                      key={label}
                      type="button"
                      data-ocid="settings.button"
                      className="flex items-center justify-between w-full p-4 bg-white/5 border border-white/10 rounded-xl"
                    >
                      <div className="flex items-center gap-3">
                        <Icon className={`w-4 h-4 ${color}`} />
                        <div className="text-left">
                          <p className="text-white/80 text-sm">{label}</p>
                          {sub && (
                            <p className="text-white/30 text-xs">{sub}</p>
                          )}
                        </div>
                      </div>
                      <ChevronRight className="w-4 h-4 text-white/30" />
                    </button>
                  ))}

                  <div className="mt-2 flex items-center gap-2 p-3 bg-white/5 border border-white/10 rounded-xl">
                    <Info className="w-4 h-4 text-white/30" />
                    <div>
                      <p className="text-white/50 text-xs">v28.0.0</p>
                      <p className="text-white/30 text-[10px]">
                        Built with caffeine.ai
                      </p>
                    </div>
                  </div>

                  {/* Danger Zone */}
                  <div className="mt-4">
                    <p className="text-red-400/60 text-xs mb-2 font-semibold uppercase tracking-wider">
                      Danger Zone
                    </p>
                    {!deactivateConfirm ? (
                      <button
                        type="button"
                        data-ocid="settings.button"
                        onClick={() => setDeactivateConfirm(true)}
                        className="w-full p-4 bg-orange-500/10 border border-orange-500/30 rounded-xl text-orange-400 text-sm text-left"
                      >
                        Deactivate Account
                      </button>
                    ) : (
                      <div className="p-4 bg-orange-500/10 border border-orange-500/40 rounded-xl">
                        <p className="text-white/70 text-sm mb-3">
                          Are you sure you want to deactivate?
                        </p>
                        <div className="flex gap-2">
                          <button
                            type="button"
                            data-ocid="settings.confirm_button"
                            className="flex-1 py-2 rounded-xl bg-orange-500 text-white text-sm font-semibold"
                          >
                            Confirm
                          </button>
                          <button
                            type="button"
                            data-ocid="settings.cancel_button"
                            onClick={() => setDeactivateConfirm(false)}
                            className="flex-1 py-2 rounded-xl bg-white/10 text-white/70 text-sm"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    )}

                    {!deleteConfirm ? (
                      <button
                        type="button"
                        data-ocid="settings.delete_button"
                        onClick={() => setDeleteConfirm(true)}
                        className="w-full p-4 mt-2 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-sm text-left"
                      >
                        Delete Account
                      </button>
                    ) : (
                      <div className="mt-2 p-4 bg-red-500/10 border border-red-500/40 rounded-xl">
                        <p className="text-white/70 text-sm mb-3">
                          This action is permanent and cannot be undone.
                        </p>
                        <div className="flex gap-2">
                          <button
                            type="button"
                            data-ocid="settings.confirm_button"
                            className="flex-1 py-2 rounded-xl bg-red-500 text-white text-sm font-semibold"
                          >
                            Delete Forever
                          </button>
                          <button
                            type="button"
                            data-ocid="settings.cancel_button"
                            onClick={() => setDeleteConfirm(false)}
                            className="flex-1 py-2 rounded-xl bg-white/10 text-white/70 text-sm"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </TabsContent>
              {/* Advanced Settings Tab */}
              <TabsContent
                value="advanced"
                className="flex-1 overflow-y-auto px-4 pb-8"
              >
                <div className="mt-4 flex flex-col gap-3">
                  <p className="text-white/40 text-xs uppercase tracking-wider font-semibold mb-1 flex items-center gap-2">
                    <Zap className="w-3.5 h-3.5 text-yellow-400" /> Advanced
                    Settings
                  </p>

                  {/* 1. Profile Boost Scheduler */}
                  <div className="p-3 bg-white/5 rounded-xl border border-white/10">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4 text-yellow-400" />
                        <div>
                          <p className="text-white/80 text-sm font-medium">
                            Profile Boost Scheduler
                          </p>
                          <p className="text-white/40 text-xs">
                            {boostScheduler
                              ? `Boost active ${boostTime} daily`
                              : "Schedule daily boost window"}
                          </p>
                        </div>
                      </div>
                      <Switch
                        data-ocid="settings.switch"
                        checked={boostScheduler}
                        onCheckedChange={(v) => {
                          setBoostScheduler(v);
                          saveSetting("adv_boostScheduler", v);
                        }}
                      />
                    </div>
                    {boostScheduler && (
                      <div className="mt-2 flex gap-2">
                        <select
                          value={boostTime}
                          onChange={(e) => {
                            setBoostTime(e.target.value);
                            saveSetting("adv_boostTime", e.target.value);
                          }}
                          className="flex-1 bg-white/10 text-white text-xs rounded-lg px-2 py-1.5 outline-none border border-white/10"
                        >
                          <option value="08:00-10:00">8am – 10am</option>
                          <option value="12:00-14:00">12pm – 2pm</option>
                          <option value="18:00-20:00">6pm – 8pm</option>
                          <option value="20:00-22:00">8pm – 10pm</option>
                          <option value="22:00-00:00">10pm – 12am</option>
                        </select>
                      </div>
                    )}
                  </div>

                  {/* 2. Read Receipts */}
                  <div className="p-3 bg-white/5 rounded-xl border border-white/10 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-green-400" />
                      <div>
                        <p className="text-white/80 text-sm font-medium">
                          Read Receipts
                        </p>
                        <p className="text-white/40 text-xs">
                          Show double-tick read receipts in chat
                        </p>
                      </div>
                    </div>
                    <Switch
                      data-ocid="settings.switch"
                      checked={advReadReceipts}
                      onCheckedChange={(v) => {
                        setAdvReadReceipts(v);
                        saveSetting("adv_readReceipts", v);
                      }}
                    />
                  </div>

                  {/* 3. Incognito Mode */}
                  <div className="p-3 bg-white/5 rounded-xl border border-white/10 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <ShieldCheck className="w-4 h-4 text-purple-400" />
                      <div>
                        <p className="text-white/80 text-sm font-medium">
                          Incognito Mode
                        </p>
                        <p className="text-white/40 text-xs">
                          Browse without showing in "Who Viewed Me"
                        </p>
                      </div>
                    </div>
                    <Switch
                      data-ocid="settings.switch"
                      checked={incognitoMode}
                      onCheckedChange={(v) => {
                        setIncognitoMode(v);
                        saveSetting("adv_incognito", v);
                      }}
                    />
                  </div>

                  {/* 4. Auto-Translate */}
                  <div className="p-3 bg-white/5 rounded-xl border border-white/10 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Globe className="w-4 h-4 text-blue-400" />
                      <div>
                        <p className="text-white/80 text-sm font-medium">
                          Auto-Translate Messages
                        </p>
                        <p className="text-white/40 text-xs">
                          Translate incoming messages to your language
                        </p>
                      </div>
                    </div>
                    <Switch
                      data-ocid="settings.switch"
                      checked={autoTranslate}
                      onCheckedChange={(v) => {
                        setAutoTranslate(v);
                        saveSetting("adv_autoTranslate", v);
                      }}
                    />
                  </div>

                  {/* 5. Smart Reply Suggestions */}
                  <div className="p-3 bg-white/5 rounded-xl border border-white/10 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <MessageSquare className="w-4 h-4 text-pink-400" />
                      <div>
                        <p className="text-white/80 text-sm font-medium">
                          Smart Reply Suggestions
                        </p>
                        <p className="text-white/40 text-xs">
                          Show AI-suggested quick replies above input
                        </p>
                      </div>
                    </div>
                    <Switch
                      data-ocid="settings.switch"
                      checked={smartReply}
                      onCheckedChange={(v) => {
                        setSmartReply(v);
                        saveSetting("adv_smartReply", v);
                      }}
                    />
                  </div>

                  {/* 6. Daily Match Limit */}
                  <div className="p-3 bg-white/5 rounded-xl border border-white/10">
                    <div className="flex items-center gap-2 mb-3">
                      <Zap className="w-4 h-4 text-orange-400" />
                      <div className="flex-1">
                        <p className="text-white/80 text-sm font-medium">
                          Daily Match Limit
                        </p>
                        <p className="text-white/40 text-xs">
                          Max {dailyMatchLimit[0]} likes/swipes per day
                        </p>
                      </div>
                      <span className="text-white font-bold text-sm">
                        {dailyMatchLimit[0]}
                      </span>
                    </div>
                    <Slider
                      data-ocid="settings.toggle"
                      min={5}
                      max={50}
                      step={5}
                      value={dailyMatchLimit}
                      onValueChange={(v) => {
                        setDailyMatchLimit(v);
                        saveSetting("adv_dailyMatch", v);
                      }}
                      className="w-full"
                    />
                    <div className="flex justify-between text-white/30 text-[10px] mt-1">
                      <span>5</span>
                      <span>50</span>
                    </div>
                  </div>

                  {/* 7. Distance Unit */}
                  <div className="p-3 bg-white/5 rounded-xl border border-white/10">
                    <div className="flex items-center gap-2 mb-2">
                      <Sliders className="w-4 h-4 text-cyan-400" />
                      <p className="text-white/80 text-sm font-medium">
                        Distance Unit
                      </p>
                    </div>
                    <div className="flex gap-2">
                      {(["km", "miles"] as const).map((u) => (
                        <button
                          key={u}
                          type="button"
                          data-ocid="settings.toggle"
                          onClick={() => {
                            setDistanceUnit(u);
                            saveSetting("adv_distUnit", u);
                          }}
                          className="flex-1 py-2 rounded-lg text-sm font-medium transition-colors"
                          style={
                            distanceUnit === u
                              ? {
                                  background:
                                    "linear-gradient(135deg, #ec4899, #a855f7)",
                                  color: "white",
                                }
                              : {
                                  background: "rgba(255,255,255,0.05)",
                                  color: "rgba(255,255,255,0.5)",
                                }
                          }
                        >
                          {u === "km" ? "Kilometers" : "Miles"}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* 8. Activity Status */}
                  <div className="p-3 bg-white/5 rounded-xl border border-white/10">
                    <div className="flex items-center gap-2 mb-2">
                      <User className="w-4 h-4 text-emerald-400" />
                      <p className="text-white/80 text-sm font-medium">
                        Activity Status
                      </p>
                      <p className="text-white/40 text-xs ml-auto">
                        Who sees you as online
                      </p>
                    </div>
                    <div className="flex flex-col gap-1.5">
                      {["Everyone", "Matches Only", "Nobody"].map((opt) => (
                        <button
                          key={opt}
                          type="button"
                          data-ocid="settings.radio"
                          onClick={() => {
                            setActivityStatus(opt);
                            saveSetting("adv_actStatus", opt);
                          }}
                          className="flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors"
                          style={
                            activityStatus === opt
                              ? {
                                  background: "rgba(236,72,153,0.15)",
                                  border: "1px solid rgba(236,72,153,0.4)",
                                }
                              : {
                                  background: "rgba(255,255,255,0.03)",
                                  border: "1px solid rgba(255,255,255,0.08)",
                                }
                          }
                        >
                          <div
                            className="w-4 h-4 rounded-full border-2 flex items-center justify-center"
                            style={{
                              borderColor:
                                activityStatus === opt
                                  ? "#ec4899"
                                  : "rgba(255,255,255,0.3)",
                            }}
                          >
                            {activityStatus === opt && (
                              <div className="w-2 h-2 rounded-full bg-pink-400" />
                            )}
                          </div>
                          <span className="text-white/80 text-sm">{opt}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* 9. Data & Storage */}
                  <button
                    type="button"
                    data-ocid="settings.button"
                    onClick={() => setDataSheetOpen(true)}
                    className="p-3 bg-white/5 rounded-xl border border-white/10 flex items-center justify-between w-full"
                  >
                    <div className="flex items-center gap-2">
                      <Database className="w-4 h-4 text-indigo-400" />
                      <div className="text-left">
                        <p className="text-white/80 text-sm font-medium">
                          Data & Storage
                        </p>
                        <p className="text-white/40 text-xs">
                          Cache: ~4.2 MB · Tap to manage
                        </p>
                      </div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-white/30" />
                  </button>
                  {dataSheetOpen && (
                    <div className="p-4 bg-indigo-500/10 rounded-xl border border-indigo-500/20">
                      <p className="text-white/70 text-sm font-medium mb-3">
                        Cache & Storage
                      </p>
                      <div className="flex justify-between text-xs text-white/50 mb-3">
                        <span>App Cache</span>
                        <span>4.2 MB</span>
                      </div>
                      <div className="flex justify-between text-xs text-white/50 mb-3">
                        <span>Media Cache</span>
                        <span>18.7 MB</span>
                      </div>
                      <button
                        type="button"
                        data-ocid="settings.delete_button"
                        onClick={() => {
                          const keys = Object.keys(localStorage).filter(
                            (k) =>
                              !k.startsWith("principal") &&
                              !k.startsWith("delegation"),
                          );
                          for (const k of keys) localStorage.removeItem(k);
                          setCacheCleared(true);
                          setDataSheetOpen(false);
                          setTimeout(() => setCacheCleared(false), 3000);
                        }}
                        className="w-full py-2 rounded-lg bg-red-500/20 border border-red-500/30 text-red-400 text-sm font-medium"
                      >
                        {cacheCleared ? "✓ Cache Cleared!" : "Clear All Cache"}
                      </button>
                      <button
                        type="button"
                        onClick={() => setDataSheetOpen(false)}
                        className="w-full py-2 mt-2 text-white/40 text-xs"
                      >
                        Cancel
                      </button>
                    </div>
                  )}

                  {/* 10. App Lock */}
                  <div className="p-3 bg-white/5 rounded-xl border border-white/10">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <KeyRound className="w-4 h-4 text-amber-400" />
                        <div>
                          <p className="text-white/80 text-sm font-medium">
                            App Lock
                          </p>
                          <p className="text-white/40 text-xs">
                            {appLock
                              ? "PIN enabled · tap to change"
                              : "Require PIN to open app"}
                          </p>
                        </div>
                      </div>
                      <Switch
                        data-ocid="settings.switch"
                        checked={appLock}
                        onCheckedChange={(v) => {
                          setAppLock(v);
                          saveSetting("adv_appLock", v);
                          if (v) setPinOpen(true);
                        }}
                      />
                    </div>
                    {pinOpen && (
                      <div className="mt-3">
                        <p className="text-white/50 text-xs mb-2">
                          Enter 4-digit PIN:
                        </p>
                        <input
                          type="password"
                          maxLength={4}
                          value={pinSetup}
                          onChange={(e) =>
                            setPinSetup(
                              e.target.value.replace(/\D/g, "").slice(0, 4),
                            )
                          }
                          placeholder="••••"
                          className="w-full bg-white/10 text-white text-center text-xl tracking-[0.5em] rounded-lg px-3 py-2 outline-none border border-white/20 focus:border-pink-500/50"
                        />
                        {pinSetup.length === 4 && (
                          <button
                            type="button"
                            data-ocid="settings.confirm_button"
                            onClick={() => {
                              saveSetting("adv_pin", pinSetup);
                              setPinOpen(false);
                              setPinSetup("");
                            }}
                            className="w-full mt-2 py-2 rounded-lg text-sm font-semibold text-white"
                            style={{
                              background:
                                "linear-gradient(135deg, #ec4899, #a855f7)",
                            }}
                          >
                            Set PIN
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                  {/* ── BLOCKED USERS ── */}
                  <div className="p-3 bg-white/5 rounded-xl border border-white/10">
                    <div className="flex items-center gap-2 mb-3">
                      <ShieldOff className="w-4 h-4 text-red-400" />
                      <p className="text-white/80 text-sm font-medium">
                        Blocked Users
                      </p>
                    </div>
                    <p className="text-white/30 text-xs text-center py-3">
                      No blocked users
                    </p>
                  </div>

                  {/* ── APP PREFERENCES ── */}
                  <div className="p-3 bg-white/5 rounded-xl border border-white/10">
                    <div className="flex items-center gap-2 mb-3">
                      <Globe className="w-4 h-4 text-blue-400" />
                      <p className="text-white/80 text-sm font-medium">
                        App Preferences
                      </p>
                    </div>
                    <div className="mb-2">
                      <p className="text-white/50 text-xs mb-1.5">Language</p>
                      <select
                        value={prefLanguage}
                        onChange={(e) => setPrefLanguage(e.target.value)}
                        className="w-full bg-white/10 text-white text-xs rounded-lg px-2 py-2 outline-none border border-white/10"
                      >
                        {[
                          "English",
                          "Hindi",
                          "Spanish",
                          "French",
                          "Arabic",
                        ].map((l) => (
                          <option key={l} value={l}>
                            {l}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="flex items-center justify-between py-2">
                      <p className="text-white/70 text-sm">Distance Unit</p>
                      <div className="flex gap-1">
                        {["km", "miles"].map((u) => (
                          <button
                            key={u}
                            type="button"
                            onClick={() => setPrefDistUnit(u)}
                            className="px-3 py-1 rounded-full text-xs font-medium"
                            style={
                              prefDistUnit === u
                                ? {
                                    background:
                                      "linear-gradient(to right,#ec4899,#a855f7)",
                                    color: "white",
                                  }
                                : {
                                    background: "rgba(255,255,255,0.05)",
                                    color: "rgba(255,255,255,0.4)",
                                    border: "1px solid rgba(255,255,255,0.1)",
                                  }
                            }
                          >
                            {u}
                          </button>
                        ))}
                      </div>
                    </div>
                    <div className="flex items-center justify-between py-2 border-t border-white/5">
                      <div>
                        <p className="text-white/70 text-sm">Auto-Translate</p>
                        <p className="text-white/30 text-xs">
                          Translate incoming messages
                        </p>
                      </div>
                      <Switch
                        checked={prefAutoTrans}
                        onCheckedChange={setPrefAutoTrans}
                      />
                    </div>
                    <button
                      type="button"
                      data-ocid="settings.save_button"
                      onClick={() => {
                        saveSetting("sf_app_prefs", {
                          language: prefLanguage,
                          distUnit: prefDistUnit,
                          autoTranslate: prefAutoTrans,
                        });
                        setPrefSaveState("saved");
                        setTimeout(() => setPrefSaveState("idle"), 2000);
                      }}
                      className="mt-2 w-full py-2 rounded-xl text-white text-xs font-semibold transition-all"
                      style={{
                        background:
                          prefSaveState === "saved"
                            ? "linear-gradient(135deg,#10b981,#059669)"
                            : "linear-gradient(135deg,#ec4899,#a855f7)",
                      }}
                    >
                      {prefSaveState === "saved"
                        ? "✓ Saved!"
                        : "Save Preferences"}
                    </button>
                  </div>

                  {/* ── PROFILE BOOST ── */}
                  <div className="p-3 bg-white/5 rounded-xl border border-white/10">
                    <div className="flex items-center gap-2 mb-3">
                      <Zap className="w-4 h-4 text-yellow-400" />
                      <p className="text-white/80 text-sm font-medium">
                        Profile Boost
                      </p>
                    </div>
                    <div className="flex items-center justify-between py-2 border-b border-white/5">
                      <p className="text-white/70 text-sm">Enable Boost</p>
                      <Switch checked={boostOn} onCheckedChange={setBoostOn} />
                    </div>
                    {boostOn && (
                      <>
                        <div className="mt-2 mb-2">
                          <p className="text-white/50 text-xs mb-1.5">
                            Schedule
                          </p>
                          <div className="flex gap-1">
                            {["Morning", "Evening", "Night"].map((s) => (
                              <button
                                key={s}
                                type="button"
                                onClick={() => setBoostSchedule(s)}
                                className="flex-1 py-1.5 rounded-lg text-xs font-medium"
                                style={
                                  boostSchedule === s
                                    ? {
                                        background:
                                          "linear-gradient(to right,#ec4899,#a855f7)",
                                        color: "white",
                                      }
                                    : {
                                        background: "rgba(255,255,255,0.05)",
                                        color: "rgba(255,255,255,0.4)",
                                        border:
                                          "1px solid rgba(255,255,255,0.1)",
                                      }
                                }
                              >
                                {s}
                              </button>
                            ))}
                          </div>
                        </div>
                        <div>
                          <p className="text-white/50 text-xs mb-1.5">
                            Duration
                          </p>
                          <div className="flex gap-1">
                            {["1 hour", "3 hours", "6 hours"].map((d) => (
                              <button
                                key={d}
                                type="button"
                                onClick={() => setBoostDuration(d)}
                                className="flex-1 py-1.5 rounded-lg text-xs font-medium"
                                style={
                                  boostDuration === d
                                    ? {
                                        background:
                                          "linear-gradient(to right,#ec4899,#a855f7)",
                                        color: "white",
                                      }
                                    : {
                                        background: "rgba(255,255,255,0.05)",
                                        color: "rgba(255,255,255,0.4)",
                                        border:
                                          "1px solid rgba(255,255,255,0.1)",
                                      }
                                }
                              >
                                {d}
                              </button>
                            ))}
                          </div>
                        </div>
                      </>
                    )}
                    <button
                      type="button"
                      data-ocid="settings.save_button"
                      onClick={() => {
                        saveSetting("sf_boost_settings", {
                          boost: boostOn,
                          schedule: boostSchedule,
                          duration: boostDuration,
                        });
                        setBoostSaveState("saved");
                        setTimeout(() => setBoostSaveState("idle"), 2000);
                      }}
                      className="mt-3 w-full py-2 rounded-xl text-white text-xs font-semibold transition-all"
                      style={{
                        background:
                          boostSaveState === "saved"
                            ? "linear-gradient(135deg,#10b981,#059669)"
                            : "linear-gradient(135deg,#ec4899,#a855f7)",
                      }}
                    >
                      {boostSaveState === "saved"
                        ? "✓ Saved!"
                        : "Save Boost Settings"}
                    </button>
                  </div>

                  {/* ── ACCOUNT SECURITY ── */}
                  <div className="p-3 bg-white/5 rounded-xl border border-white/10">
                    <div className="flex items-center gap-2 mb-3">
                      <KeyRound className="w-4 h-4 text-amber-400" />
                      <p className="text-white/80 text-sm font-medium">
                        Account Security
                      </p>
                    </div>
                    <div className="mb-2">
                      <p className="text-white/50 text-xs mb-1">Display Name</p>
                      <input
                        type="text"
                        value={displayNameInput}
                        onChange={(e) => setDisplayNameInput(e.target.value)}
                        placeholder="Enter new display name..."
                        className="w-full bg-white/10 text-white text-sm rounded-xl px-3 py-2 outline-none border border-white/10 focus:border-pink-500/50"
                      />
                    </div>
                    {displayNameInput.length > 0 && (
                      <button
                        type="button"
                        data-ocid="settings.save_button"
                        onClick={() => {
                          saveSetting("sf_account_settings", {
                            displayName: displayNameInput,
                          });
                          setDisplayNameInput("");
                        }}
                        className="w-full py-2 rounded-xl text-white text-xs font-semibold mb-2"
                        style={{
                          background: "linear-gradient(135deg,#ec4899,#a855f7)",
                        }}
                      >
                        Save Name
                      </button>
                    )}
                  </div>

                  {/* ── HELP & SUPPORT ── */}
                  <div className="p-3 bg-white/5 rounded-xl border border-white/10">
                    <div className="flex items-center gap-2 mb-3">
                      <HelpCircle className="w-4 h-4 text-blue-400" />
                      <p className="text-white/80 text-sm font-medium">
                        Help & Support
                      </p>
                    </div>
                    {[
                      {
                        q: "How does matching work?",
                        a: "We use a smart algorithm based on your interests, location, and behavior to suggest compatible profiles.",
                      },
                      {
                        q: "How to delete account?",
                        a: "Go to Account tab → Danger Zone → Delete Account. This action is permanent.",
                      },
                      {
                        q: "Is my data private?",
                        a: "Yes. Your data is stored on the Internet Computer blockchain and only you control access.",
                      },
                      {
                        q: "How to upgrade to Premium?",
                        a: "Tap your profile → Go Premium → Choose Gold or Diamond plan.",
                      },
                    ].map(({ q, a }) => (
                      <div
                        key={q}
                        className="border-b border-white/5 last:border-0"
                      >
                        <button
                          type="button"
                          onClick={() => setOpenFaq(openFaq === q ? null : q)}
                          className="w-full flex items-center justify-between py-2.5 text-left"
                        >
                          <span className="text-white/80 text-sm">{q}</span>
                          <span className="text-white/40 text-sm">
                            {openFaq === q ? "−" : "+"}
                          </span>
                        </button>
                        {openFaq === q && (
                          <p className="text-white/40 text-xs pb-2 leading-relaxed">
                            {a}
                          </p>
                        )}
                      </div>
                    ))}
                    <div className="flex gap-2 mt-3">
                      <button
                        type="button"
                        data-ocid="settings.button"
                        className="flex-1 py-2 rounded-xl bg-pink-500/10 border border-pink-500/20 text-pink-300 text-xs font-medium"
                      >
                        Contact Support
                      </button>
                      <button
                        type="button"
                        data-ocid="settings.button"
                        className="flex-1 py-2 rounded-xl bg-white/5 border border-white/10 text-white/50 text-xs font-medium"
                      >
                        Report a Bug
                      </button>
                    </div>
                    <p className="text-white/20 text-[10px] text-center mt-3">
                      v28.0
                    </p>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
