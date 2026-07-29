# Fix Theater Mode Interactions

## Describe
The Theater mode interactions are missing or incorrectly implemented:
1. Touch zones: Implement tap-based navigation (tap right side to go to next song, left side to previous, center to toggle controls) instead of just swiping.
2. Auto-hide UI: Implement a timeout to automatically hide the controls after a few seconds of inactivity or when playing.
3. Wake lock: Implement the Screen Wake Lock API (`navigator.wakeLock.request('screen')`) when `isLocked` is true to prevent the screen from sleeping.
4. Improve tests: Add tests in `usability.spec.ts` (or relevant E2E tests) to ensure these interactions work properly.

## Implement
- Update `TheaterModePage.tsx` to handle click/tap events based on screen coordinates (e.clientX).
- Update `TheaterModePage.tsx` with a `useEffect` for auto-hiding `showControls`.
- Update `TheaterModePage.tsx` to call `navigator.wakeLock.request('screen')` when `isLocked` is toggled.
- Update `usability.spec.ts` to test these scenarios.

## Verify
- Build and run playwright tests.

## Commit
- Commit the changes and close the quick task.
