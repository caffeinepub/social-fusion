# Social Fusion

## Current State
Version 6 is fully deployed with all features. Data loads via React Query with staleTime of 30s. Toast notifications (sonner) appear throughout the app on actions. Data fetching starts only after actor is initialized, causing perceived slow loading of profiles.

## Requested Changes (Diff)

### Add
- Prefetch critical queries (tinderQueue, allProfiles, notifications, callerProfile) immediately when actor is ready to eliminate loading spinners

### Modify
- Remove `<Toaster>` component from App.tsx so no toast messages appear
- Replace all `toast.success` and `toast.error` calls with silent no-ops (remove them entirely) across all components
- Increase staleTime in QueryClient to reduce re-fetches
- Add prefetching hook that fires all key queries in parallel as soon as actor is available

### Remove
- All visible toast/notification pop-ups from the UI

## Implementation Plan
1. Remove `<Toaster>` from App.tsx
2. Remove all `import { toast } from 'sonner'` and `toast.*` calls from every component file
3. Add a `usePrefetchAll` hook that prefetches tinderQueue, allProfiles, notifications, callerProfile in parallel when actor is ready
4. Call `usePrefetchAll` in AppInner so data is warm before the user sees any screen
5. Increase staleTime to 60s in QueryClient config
