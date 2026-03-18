# Social Fusion — v18

## Current State
Full matrimonial social app with Browse/Requests/Matches/Chats/Profile tabs, real WebRTC calls, stories, reels, Love Track animation, premium features, block user, daily picks, read receipts, and gradient pill chips. Theme switcher and privacy toggle exist in AppSettingsSheet but may not fully propagate or persist.

## Requested Changes (Diff)

### Add
- Theme context that applies selected theme CSS variables app-wide instantly and persists to localStorage
- Profile privacy public/private setting: private profiles excluded from Browse discover, search results, and all profile listings
- Chat: voice message recording and send (MediaRecorder)
- Chat: sticker panel (emoji stickers in addition to emoji picker)
- Chat: file/image/video preview before sending
- Chat: avatar click opens user profile
- Chat settings panel: message request accept/delete, block user, who-can-message, who-can-see-status, who-can-send-requests, who-can-search
- Chat social: view star givers list, view special thanks/gifts received, reply to thanks
- Search: search icon click shows input + filter icon in one row; filter icon opens bottom sheet with filter options
- Notifications: mark all as read button; show-all view with filter tabs (Comments, Replies, Requests, Matches, Calls, Thanks, Stars)

### Modify
- AppSettingsSheet: theme selection must update a ThemeContext that wraps the whole app; selection saved to localStorage
- DiscoverTab: filter out private profiles
- SearchScreen: filter out private profiles from results
- NotificationsPanel: add mark-all-read and filterable notification view
- MessagesTab: add chat settings sheet, sticker panel, voice message support, file preview, avatar-click-to-profile

### Remove
- Nothing — all existing features must be preserved

## Implementation Plan
1. Create `ThemeContext` (src/frontend/src/contexts/ThemeContext.tsx) with theme tokens for dark/pink/gold/blue themes, apply as CSS variables on `<html>`, persist to localStorage
2. Wrap App in ThemeProvider; update AppSettingsSheet to use ThemeContext
3. Add `isPrivate` field to backend profile (already exists as privacyMode); in DiscoverTab and SearchScreen filter out profiles where privacyMode === 'private'
4. In MessagesTab/ChatThread: add voice message recording using MediaRecorder API; add sticker panel alongside emoji panel; wire avatar click to open UserProfileView
5. Add ChatSettingsSheet component with message-request controls, block, privacy controls, star/thanks/gifts views
6. Update SearchScreen: show search input + filter icon in a single row; FilterSheet bottom drawer with age/location/interests filters
7. Update NotificationsPanel: add mark-all-read button; add filter chip row (All, Comments, Replies, Requests, Matches, Calls, Thanks, Stars); filter displayed notifications by selected chip
