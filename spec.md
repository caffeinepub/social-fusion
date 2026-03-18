# Social Fusion v22

## Current State
Social Fusion is a full-stack matrimonial/social app at v21 with: stories, reels, posts, Discover with carousels, Love Track animation, real-time chat, WebRTC calls, premium plans, 10 themes, onboarding stepper, recommendation system, profile privacy, animated profile page, notification filtering, chat settings, voice messages, stickers, emoji library, and more.

## Requested Changes (Diff)

### Add
1. **Status / Away Message** — Users can set a short custom status text (e.g. "Looking for soulmate") shown under their avatar in chat list and profile.
2. **Message Reactions** — Long-press a chat message to react with emoji (❤️ 😂 👍 😮 😢 🙏). Reactions shown as small bubbles under the message.
3. **Pinned Messages** — Pin important messages in a chat; a pinned banner appears at the top of the conversation.
4. **Chat Themes** — Each individual conversation can have its own color/gradient theme picked from a palette.
5. **Typing Indicator** — Animated 3-dot bubble shows when the other user is typing.
6. **Message Search** — Search bar inside a chat to find messages by keyword.
7. **Disappearing Messages** — Toggle per-chat to auto-delete messages after 24h / 7d / off.
8. **Profile Spotlight** — A featured "Spotlight" banner on the Browse screen that rotates premium profiles with a glow effect.
9. **Compatibility Score Ring** — Animated circular ring on swipe cards and profile view showing % compatibility with color gradient.
10. **Icebreaker Questions** — When two users match, a randomly selected icebreaker question is shown in the chat as the opening message.
11. **Profile Completion Meter** — Progress bar on profile page showing how complete the profile is (0–100%); tapping shows what's missing.
12. **Story Reactions** — Swipe up on a story to send a quick emoji reaction that appears as a floating animation.
13. **Mutual Friends / Connections** — On a profile view, show "X mutual connections" with avatars.
14. **Live Availability Badge** — Green dot with "Available now" badge for users actively online; shown in Discover and chat list.
15. **Mood Board** — A 3x3 image grid on the profile page where users can pin photos that represent their personality/lifestyle.
16. **Anniversary / Special Dates** — Users can add important dates (e.g. birthday); reminder badge shown on their profile on that date.
17. **Voice Note Transcription** — Voice messages show an auto-transcribed text preview below the waveform.
18. **Chat GIF Search** — A GIF picker (using a local curated set) in the chat input toolbar.
19. **Profile Visit Notifications** — Notify the user when someone views their profile; show a "Who viewed me" list in notifications.
20. **Quick Match Actions Bar** — Floating action bar on the Browse/Discover screen with: Super Like (⭐), Boost (🚀), Undo (↩️), and Skip (✕) buttons with animated press feedback.
21. **Dark/Light Mode Quick Toggle** — Floating moon/sun toggle button accessible from any screen for instant dark/light switch.
22. **Chat Forward Message** — Long-press a message to forward it to another conversation.

### Modify
- Chat input toolbar: add GIF button alongside existing emoji/sticker/voice buttons.
- Notification panel: add "Profile Views" filter tab.
- Profile page: add Mood Board grid section, Profile Completion Meter, Special Dates section.
- Browse/Discover: add Profile Spotlight banner at top, Compatibility Score Ring on cards, Quick Match Actions Bar.
- Story viewer: add swipe-up reaction animation.

### Remove
- Nothing removed.

## Implementation Plan
1. Add `userStatus` field to profile store; render in chat list row and profile header.
2. Build `MessageReactionPicker` component (emoji popover on long-press); store reactions in message objects.
3. Add `pinnedMessageId` per conversation; pinned banner in chat header.
4. `ChatThemePicker` — palette sheet, store per-conversation theme in local state.
5. Typing indicator: set/clear a `isTyping` flag on input focus/keystroke; render animated dots in chat.
6. `MessageSearch` overlay inside chat — filter messages array by keyword.
7. Disappearing messages toggle in chat settings; messages with expiry timestamp auto-removed on render.
8. `ProfileSpotlight` carousel at top of Browse — rotating premium cards with glow pulse animation.
9. `CompatibilityRing` SVG circle with animated stroke-dashoffset; color gradient green→pink by score.
10. Icebreaker question injected as first system message on new match.
11. `ProfileCompletionMeter` — count filled fields / total; progress bar + missing field chips.
12. Story swipe-up reaction — touch handler, floating emoji animation overlay.
13. `MutualConnections` — intersect followers arrays; show avatars + count on profile.
14. `LiveBadge` — online timestamp < 5min shows green "Available now" pill.
15. `MoodBoard` — 3x3 upload grid in profile edit + display section.
16. Special Dates field in profile edit; birthday badge logic.
17. Voice note transcription placeholder text (simulated) below waveform in chat bubbles.
18. `GifPicker` component with curated local GIF set; sends as image message.
19. Profile view tracking — record viewer in backend; "Who viewed me" section in notifications.
20. `QuickMatchBar` floating row at bottom of swipe card stack with Super Like/Boost/Undo/Skip.
21. Floating dark/light toggle FAB using existing theme system.
22. Forward message: long-press menu option → conversation picker sheet → sends copy.
