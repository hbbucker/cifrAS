# UI Patterns Refactor Spec

## Description
This feature specification aims to resolve inconsistencies in the React frontend codebase by enforcing the `react-ui-patterns` guidelines. Currently, the project lacks standardized UI components for state management, leading to poor user experience, unhandled error states, and improper loading behaviors.

## Requirement IDs
- **REQ-UI-001**: Implement standard Loading State Components (e.g., `SkeletonCard`, `Spinner`) and ensure they only appear when data is absent (do not overwrite cached data with loading screens).
- **REQ-UI-002**: Implement standard Error Handling Components (`ErrorState`). Ensure all API calls (fetches, mutations) correctly handle errors and provide visual feedback to users via toasts or banners instead of swallowing them with `console.error()`.
- **REQ-UI-003**: Implement a reusable `Button` component that supports `isLoading` and `disabled` states, preventing multiple form submissions and providing visual feedback during async operations.
- **REQ-UI-004**: Implement a standard `EmptyState` component and apply it across all lists and collections (Songs, Groups, Playlists).

## Scope & Applicability
This refactor applies to the `frontend/src` directory, specifically targeting:
- `GroupsPage.tsx`
- `GroupDetailsPage.tsx`
- `PlaylistsPage.tsx`
- `PlaylistViewPage.tsx`
- `SongsListPage.tsx`
- `SharedWithMePage.tsx`
- Global API fetch/mutation wrappers and hooks

## Inconsistencies Found During Audit
1. **Loading State Patterns Violated**: `GroupDetailsPage`, `GroupsPage`, and others use `if (loading)` blocks that fully replace the UI with "Loading..." text or screens, instead of `loading && !data`.
2. **Error Handling Hierarchy Violated**: Network errors are routinely swallowed using `.catch(console.error)` (e.g., in `GroupsPage`, `PlaylistViewPage`, `TheaterModePage`). Errors are not surfaced to users.
3. **Button State Patterns Violated**: Async actions like `handleCreateGroup`, `handleInvite` do not disable buttons or show loading states. No standardized `Button` component exists.
4. **Empty State Patterns Violated**: Many lists either show nothing or plain text like "No groups found." when empty, instead of a visually pleasant, contextual Empty State component.
