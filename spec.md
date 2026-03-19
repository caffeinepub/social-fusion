# Social Fusion

## Current State
v28 is the last successful build. v29 failed during generation. The app is a comprehensive social/matrimonial app with: Discover tab (header, stories, Tinder cards, Today's Picks, You May Like), Requests tab (Spotlight + requests), Matches tab (grid with online/offline), Chat/Messages tab (full chat with WebRTC calls), Profile tab (settings, biometric lock, privacy, premium). All features from v12-v28 are present.

## Requested Changes (Diff)

### Add
- N/A (rebuild existing v28 to get it working)

### Modify
- Re-apply all v29 requested changes that failed:
  1. Browser/Discover screen: header → all stories (with image/video/music upload, view comments/likes) → Tinder profiles with send options → Today's Picks → You May Like. Vertically scrollable, hidden scrollbar.
  2. Stories: when adding image/video, actual media shows (not just text). Story owner can see comments/likes.
  3. Request screen: accepting a request deletes it automatically.
  4. Calls: real WebRTC calls between two users; callee gets incoming call overlay.
  5. Matches screen: clicking heart icon sends notification to that user's notification section.
  6. Gift sending: gift sent in chat screen.
  7. Remove ♥ symbol from UI (random heart symbol).
  8. Chat story click: opens story creator (add story), not dummy content.
  9. Call history: show related user image.
  10. Chat header: remove wallpaper and theme toggle features.
  11. Chat bubbles: 70% of screen width for both sender and receiver.
  12. Remove thumb icon and "swipe up to turn on vanish mode" text.
  13. Plus icon in chat: send images/video that receiver can see; reactions show on both sides.
  14. WebRTC voice/video call in chat working properly.
  15. New message (pencil icon): background transparent, input text white.
  16. Profile screen: remove theme toggle, remove share option, thoughts not auto-scroll (static), remove Go Premium button, remove mood board, remove Go Live suggestions, only gifts shown in centre, sending gift goes to that user, remove Set Status option, remove QR code.
  17. Profile screen: add Music, Voice Introduction, Voice Note Story, Refer a Friend, Notification icon.
  18. Profile screen: Privacy section shows only "Privacy & Membership" (remove other privacy access items).
  19. Profile screen: uploaded images shown in carousel.
  20. Profile screen: remove Posts and Reels tab options.
  21. Profile details: thoughts shown above follow/followers box (not auto-scrolling at top).
  22. Remove theme options light/dark toggle.

### Remove
- N/A

## Implementation Plan
1. Update DiscoverTab: ensure story row shows all users with real media, fix scroll sequence, hide scrollbar.
2. Update StoryCreatorSheet: properly embed actual image/video in story data.
3. Update StoryViewer: show actual media (image/video), show owner's comments/likes panel.
4. Update RequestsTab: auto-remove accepted requests.
5. Update call signaling: ensure callee gets incoming overlay via localStorage event.
6. Update MatchesTab: heart icon triggers notification to matched user.
7. Update GiftSheet/chat: gift send writes to recipient's chat.
8. Remove stray ♥ symbol from UI.
9. Update ChatScreen/MessagesTab: remove wallpaper/theme from header, fix bubble width to 70%, remove thumb/vanish mode, fix reactions to show both sides, fix media send/receive, fix WebRTC calls.
10. Update new message screen: transparent background, white text input.
11. Update ProfileTab: remove theme toggle, share, Go Premium, mood board, Go Live suggestions, Set Status, QR code; add Music/Voice Intro/Voice Note Story/Refer a Friend/Notification icon; show only Privacy & Membership in privacy section; carousel for uploaded images; remove posts/reels tabs; thoughts shown above follow/followers (static).
12. Remove light/dark theme toggle globally.
