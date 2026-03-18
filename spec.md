# Social Fusion

## Current State
Full-stack social app with: home feed (posts + stories), discover (user list + follow), create post, messages (DM), profile (edit name/bio/avatar). Backend has profiles, posts, stories, messages, follow/unfollow. Profile type has: displayName, bio, avatar.

## Requested Changes (Diff)

### Add
- **Tinder-style Discover tab**: Swipeable profile cards (swipe right = like, swipe left = pass). Show profile photo, name, bio, age, location. Matches list when both users like each other.
- **Notifications panel**: Instagram-style notification bell in home header with badge count. Panel shows: new followers, post likes, comments, matches.
- **Profile expanded fields**: website, location, gender, birthday, relationship status displayed on profile. Edit dialog includes these new fields.
- **Call UI**: Voice call and video call overlay screens. Buttons in conversation header (phone + video icons). Simulated call screen with accept/end/mute controls.
- **Facebook-style features**: Friend requests (separate from follow), online status indicator in messages, "People You May Know" section.
- **Backend**: Expanded Profile type, Notification type/storage, Tinder like/pass/matches, notifications generated on follow/like/comment/match.

### Modify
- DiscoverTab: Replace plain list with Tinder card stack (swipe gestures) + matches section below.
- ProfileTab: Show more fields, richer header matching Instagram screenshots.
- MessagesTab: Add call/video buttons in conversation header, online status dots.
- BottomNav: Add notification badge dot on the home icon when unread notifications exist.
- HomeTab: Add notification bell icon in header.

### Remove
- Nothing removed.

## Implementation Plan
1. Generate updated Motoko backend (expanded Profile, Notification system, tinderLike/pass, getMatches).
2. Update DiscoverTab with swipe card UI and matches list.
3. Add NotificationsPanel component and wire to HomeTab header bell.
4. Update ProfileTab with all new fields.
5. Update MessagesTab with call/video call UI overlay.
6. Update BottomNav with notification badge.
