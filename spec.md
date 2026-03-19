# Social Fusion v25

## Current State
- Discover tab: has header (Discover text + search + bell), story row, Today's Picks auto-scroll, SpotlightSection, TinderSection, QuickReactionRow, OtherProfilesRow
- Requests tab: shows all users with accept/decline, no spotlight row
- Matches tab: shows matches grid + tabs (Events, Couples, Activity, Saved)
- Settings: AppSettingsSheet with theme, privacy, notifications, account sections
- Chat/Messages: MessagesTab with full chat feature set
- Others (Profile, Create) screen: no changes needed

## Requested Changes (Diff)

### Add
- Discover header: add Love/Heart icon button after search bar (before bell) — opens a "Liked You" panel
- Discover: show all users' stories in the story row (currently only those with stories shown; ensure ALL registered users appear with add-story or story ring)
- Discover: Tinder main card stays as-is (already present)
- Discover: Today's Picks already auto-scrolls — verify and keep
- Discover: SpotlightSection already auto-scrolls horizontally — verify and keep
- Requests tab: Add horizontal auto-scrolling Spotlight row at the TOP before the requests list
- Requests tab: Show ALL pending requests below spotlight (not just a subset)
- Matches tab: Show ALL matchers as cards in a grid (already mostly done, verify completeness)
- Discover tab: In TinderSection show ONLY offline/new profiles (filter out recently seen)
- Tinder card style: Ensure Tinder-inspired full-card style (gradient overlay, name/age/location at bottom, action buttons)
- Main Tinder profile: multiple send options (Star, Heart, Kiss, Miss You, Thanks, Message) as action row
- Settings screen: add 10 new fully-working features:
  1. Notification Settings — granular toggles (matches, messages, story likes, profile views, events) with save button
  2. Privacy Settings — who can message (Everyone/Matches/Nobody), who can see online status, profile visibility (Public/Private) with save
  3. Theme selector — visual theme cards grid, instant preview, Save Theme button persists to localStorage
  4. Chat Settings — who can message, message requests toggle, read receipts, typing indicator
  5. Account Security — change display name, PIN lock toggle, deactivate option
  6. Blocked Users — list of blocked users with unblock action
  7. App Preferences — language, distance unit, auto-translate toggle
  8. Data & Storage — clear cache button, data usage info
  9. Profile Boost — toggle boost, schedule boost time
  10. Help & Support — FAQ, contact support, report bug
- All settings must have a working Save button that persists state to localStorage
- Theme change must apply instantly to the full UI when selected/saved
- Chat settings: who can message (Everyone/Matches/Nobody) must filter chat list
- Notification settings toggles must control whether notification badges/counts show

### Modify
- Discover header: reorder icons as: Discover text | search | heart/love icon | bell
- AppSettingsSheet: expand with 10 new setting sections (keeping all existing ones)
- Requests tab: add SpotlightRow at top, make full requests list visible below it
- Matches tab: ensure all matched users show as cards
- TinderSection: add offline-only filter (show profiles not in tinderQueue/recent likes as "new" profiles)

### Remove
- Nothing removed

## Implementation Plan
1. Update DiscoverTab header to add Heart/Love icon button between search and bell
2. Update DiscoverTab story row to show ALL users (not just those with stories) as story avatars
3. Update RequestsTab to add horizontal auto-scrolling SpotlightRow at top
4. Update MatchesTab to ensure all matchers show as full cards
5. Update TinderSection to show "offline/new" style filter
6. Add multiple send options row to Tinder card (Star, Heart, Kiss, Miss You, Thanks, Message)
7. Expand AppSettingsSheet with 10 new fully-working settings sections with save buttons
8. All theme changes apply instantly + Save button persists to localStorage
9. Chat settings: who-can-message filter wired to MessagesTab
10. Notification settings toggles wired to notification badge visibility
