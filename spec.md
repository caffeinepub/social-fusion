# Social Fusion — Love Track Feature

## Current State
MessagesTab has a Star icon button in the header (between Call History and Edit buttons) that has no action. The app has full chat, profile, and social features.

## Requested Changes (Diff)

### Add
- `LoveTrackScreen.tsx` — Full-page romantic train journey animation screen
  - Animated train moving along a track with multiple city stops
  - Location stops: Delhi, Mumbai, Jaipur, Kolkata, Chennai
  - When train arrives at a stop: love bubbles float up with user profiles
  - Heart ❤️ / Kiss 💋 floating animations
  - Love message tags ("Looking for soulmate", "Serious relationship", etc.)
  - Pause/resume button
  - Tap bubble to open profile detail
  - Glow highlight on selected bubble
  - Auto-loop journey
- `TrainAnimation.tsx` — Reusable animated train + track component
- `LoveBubble.tsx` — Reusable floating profile bubble with heart animations

### Modify
- `MessagesTab.tsx` — Replace Star icon with Train icon; wire onClick to open LoveTrackScreen

### Remove
- Nothing removed

## Implementation Plan
1. Create LoveBubble component with CSS keyframe float animation
2. Create TrainAnimation component with CSS translate animation on track
3. Create LoveTrackScreen orchestrating journey flow state machine
4. Update MessagesTab to import Train icon and open LoveTrackScreen
