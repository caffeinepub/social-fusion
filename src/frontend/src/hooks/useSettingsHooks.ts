// Hooks for reading settings from localStorage

export interface NotifSettings {
  matches: boolean;
  newMessages: boolean;
  storyLikes: boolean;
  profileViews: boolean;
  eventInvites: boolean;
}

const NOTIF_DEFAULTS: NotifSettings = {
  matches: true,
  newMessages: true,
  storyLikes: true,
  profileViews: false,
  eventInvites: true,
};

export function useNotifSettings(): NotifSettings {
  try {
    const v = localStorage.getItem("sf_notif_settings");
    if (!v) return NOTIF_DEFAULTS;
    return { ...NOTIF_DEFAULTS, ...JSON.parse(v) };
  } catch {
    return NOTIF_DEFAULTS;
  }
}

export interface ChatPrivacySettings {
  whoCanMessage: "everyone" | "matchesOnly" | "nobody";
  showReadReceipts: boolean;
  showTypingIndicator: boolean;
  requireMessageApproval: boolean;
}

const CHAT_DEFAULTS: ChatPrivacySettings = {
  whoCanMessage: "everyone",
  showReadReceipts: true,
  showTypingIndicator: true,
  requireMessageApproval: false,
};

export function useChatPrivacySettings(): ChatPrivacySettings {
  try {
    const v = localStorage.getItem("sf_chat_settings");
    if (!v) return CHAT_DEFAULTS;
    return { ...CHAT_DEFAULTS, ...JSON.parse(v) };
  } catch {
    return CHAT_DEFAULTS;
  }
}
