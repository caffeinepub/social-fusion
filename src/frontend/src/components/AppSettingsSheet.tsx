import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Bell,
  CheckCircle2,
  ChevronRight,
  Download,
  HelpCircle,
  Info,
  Lock,
  MessageSquare,
  Moon,
  Palette,
  Settings2,
  ShieldOff,
  Trash2,
  Type,
  User,
  X,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useEffect, useState } from "react";
import { usePrivacy } from "../contexts/PrivacyContext";
import { THEMES as SF_THEMES, useTheme } from "../contexts/ThemeContext";
import { useInternetIdentity } from "../hooks/useInternetIdentity";

interface AppSettingsSheetProps {
  open: boolean;
  onClose: () => void;
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

export function AppSettingsSheet({ open, onClose }: AppSettingsSheetProps) {
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
              defaultValue="customize"
              className="flex-1 flex flex-col min-h-0"
            >
              <TabsList className="mx-4 mt-3 shrink-0 grid grid-cols-4 bg-white/5 h-10">
                <TabsTrigger value="customize" className="text-[11px] px-1">
                  <Palette className="w-3 h-3 mr-1" />
                  Theme
                </TabsTrigger>
                <TabsTrigger value="privacy" className="text-[11px] px-1">
                  <Lock className="w-3 h-3 mr-1" />
                  Privacy
                </TabsTrigger>
                <TabsTrigger value="notifications" className="text-[11px] px-1">
                  <Bell className="w-3 h-3 mr-1" />
                  Notifs
                </TabsTrigger>
                <TabsTrigger value="account" className="text-[11px] px-1">
                  <User className="w-3 h-3 mr-1" />
                  Account
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
                      <p className="text-white/50 text-xs">Social Fusion</p>
                      <p className="text-white/30 text-[10px]">
                        Version 14.0.0 · Built with caffeine.ai
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
            </Tabs>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
