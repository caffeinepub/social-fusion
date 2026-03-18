# Social Fusion v24

## Current State
Full-featured social/matrimonial app with Browse, Requests, Matches, Chats, Profile tabs. v23 has 30+ features, WebRTC calls, stories, Love Track, themes, premium, onboarding, etc.

## Requested Changes (Diff)

### Add
- **Discover header**: Only "Discover" gradient text + inline live search input + notification bell (no other elements)
- **Stories row**: Horizontal scroll row right below header with Add Story circle first, then other users' story rings
- **Main Tinder card**: Large swipeable profile card (full-width, tall) with photo carousel, name, age, location, match %, action buttons
- **Other profiles row**: Below main card, horizontal scrolling row of smaller profile cards ("People Nearby", "Top Picks" etc.)
- **Requests tab top**: Spotlight section (horizontal scroll of boosted/featured profiles) at the very top
- **Requests tab sections**: Event Match, Couple Match, and Others sections below spotlight
- **Settings screen**: 10 new features: (1) Profile Boost scheduler, (2) Read receipts toggle, (3) Incognito browsing mode, (4) Auto-translate messages, (5) Smart reply suggestions toggle, (6) Daily match limit control, (7) Distance unit (km/miles), (8) Activity status granularity, (9) Data & storage manager, (10) App lock with PIN/biometric
- **Chat screen**: Add message scheduling, quick emoji reactions bar, chat search, reply-to-message thread view, chat wallpaper picker
- **Performance**: Prefetch all data in parallel at mount, use optimistic cache, reduce stale time to 30s with aggressive background refetch, skeleton loaders for instant perceived performance

### Modify
- DiscoverTab: Restructure layout — header (Discover + search + notif) → stories row → main Tinder card → horizontal other profiles row
- RequestsTab: Add spotlight row at top, then section headers for Event/Couple/Others
- MessagesTab: Add chat search bar, message scheduling UI, wallpaper picker in chat settings
- ProfileTab/Settings: Add 10 new settings items in their own section

### Remove
- Nothing removed

## Implementation Plan
1. Rewrite DiscoverTab header + layout structure
2. Add spotlight + event/couple/others sections to RequestsTab
3. Add 10 settings items to ProfileTab settings sheet
4. Enhance MessagesTab with 5 new chat features
5. Optimize query prefetch for sub-1s data load with skeleton placeholders
