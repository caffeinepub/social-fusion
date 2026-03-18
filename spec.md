# Social Fusion v21

## Current State
v20 is live with: story viewer, today's picks auto-scroll, post creation/deletion, profile grid borders, theme switching (7 themes), profile privacy toggle, enhanced chat (voice messages, stickers, file preview, avatar-to-profile), chat settings, search with filter sheet, filterable notifications, discover carousel + quick reactions, recommendation sorting, animated profile page, 5-step onboarding stepper, premium trial card, Love Track animation.

## Requested Changes (Diff)

### Add
- Theme: apply selected theme CSS variables instantly across ALL UI components; persist to localStorage; survive reload
- Privacy: filter private profiles out of Discover, Search results, and Recommendations at the UI layer
- Chat: file/image/video preview before send; emoji + sticker panel; voice message recording; avatar tap → profile; call ring tone on initiation; incoming call overlay (accept/reject) → WebRTC audio/video
- Chat settings: message request accept/delete; block user; who-can controls (send messages, see online status, send requests, search chats); stars viewer list; thanks/gifts viewer; reply to thanks
- Search: search icon expands inline row with input + filter icon; filter icon opens bottom sheet modal
- Notifications: mark-all-read button; "Show all" view with filter tabs: Comments, Replies, Requests, Matches, Calls, Thanks, Stars
- Discover: fast load (parallel fetch), auto-sliding image carousel per card, quick reaction buttons: Star, Heart, Kiss, Miss you, Thanks
- Premium: Free vs Premium account types; Premium unlocks verification badge, 10+ customization styles, stylish layouts, carousel uploads, profile boost
- Recommendations: sort/filter by opposite gender, location, qualification, interests, favorites, profile views, behavior
- Profile page: animated thoughts ticker, floating hobby bubbles animation, image+video carousel, premium badge, boost indicator
- Onboarding: 5-step stepper for new users; 2-month premium trial auto-activated on first profile save

### Modify
- All existing features remain intact; enhancements are additive only
- Theme context applies tokens to all components (not just a few)
- Profile privacy context filters at data-display layer

### Remove
- Nothing

## Implementation Plan
1. Strengthen ThemeContext so CSS variables cover all background, text, border, card, input, and button tokens — all components read from these variables
2. Strengthen PrivacyContext to filter private profiles from Discover, Search, and Recommendations
3. Chat enhancements: file preview modal before send, full emoji+sticker panel, voice recorder UI, avatar-click handler, call ring audio, incoming/outgoing call overlay
4. Chat settings panel: message requests list, block user action, who-can privacy toggles, stars list, thanks/gifts list with reply
5. Search bar: collapsed icon → expanded row with input + filter icon; filter bottom sheet
6. Notifications: mark-all-read, show-all sheet with 7 filter tabs
7. Discover: parallel profile fetch, per-card auto-sliding carousel, 5 quick reaction buttons
8. Premium: account type field, premium feature gates, 10+ layout/style options, boost toggle
9. Recommendations: scoring algorithm using gender, location, qualification, interests, views
10. Profile page: animated ticker for thoughts, CSS keyframe floating bubbles, image/video carousel
11. Onboarding stepper: 5 steps, auto-activate 2-month trial on completion
