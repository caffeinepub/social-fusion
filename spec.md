# Social Fusion v6

## Current State
Full social media app with Browse/Requests/Matches/Chats/Profile tabs. Global header shows "Social Fusion" logo + bell icon. Discover (Browse) tab has its own internal layout. MessagesTab has a chat list and opens individual chats. ProfileTab has user info and settings.

## Requested Changes (Diff)

### Add
- Browse tab header: search icon + heart icon (replaces global header on browse tab). Heart icon click opens NotificationsPanel.
- Chat settings panel: opens when settings icon clicked in MessagesTab. Contains tabs: Chat Settings, Privacy, Inbox, Pending Requests, Stars (who starred me), Online Users list below search box.
- Full-screen chat: when a conversation is open, hide bottom navbar completely. Chat UI like Facebook Messenger (bubbles, reactions, seen/delivered, online dot, call/video icons in header).
- Profile: add more info fields — interests, hobbies, favourite movies, favourite songs, education, thoughts/thinking about. Support 7 photos. Add background/cover image upload at top of profile.

### Modify
- Browse tab: remove global header when on browse tab; show inline header with search icon + heart icon only.
- Profile: expand profile card to show new fields and cover photo upload.
- MessagesTab: full-screen chat hides BottomNav; chat settings panel accessible from settings icon.

### Remove
- Global header hidden when on Browse tab (shown only for other tabs or removed entirely if browse always shows inline header).

## Implementation Plan
1. App.tsx: conditionally hide global header when activeTab === 'browse'; pass setNotifOpen + chat open state up so BottomNav can be hidden when chat is open.
2. DiscoverTab: add header row with Search icon + Heart icon (heart opens notifications).
3. MessagesTab: add settings icon that opens ChatSettingsPanel; track chatOpen state and pass up to hide BottomNav; full-screen chat view with Facebook Messenger style.
4. ChatSettingsPanel: new component with tabs (Settings, Privacy, Inbox, Pending, Stars, Online).
5. ProfileTab: add cover image upload, 7 profile photos, and new fields (interests, hobbies, fav movies, fav songs, education, thoughts).
