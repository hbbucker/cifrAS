# Tasks: UI Patterns Refactor

## Scope
Applying the `react-ui-patterns` best practices across the frontend application.

## Tasks

### [x] TASK-1: Create Standardized UI Primitives
**What:** Create reusable standard UI components that enforce correct UI patterns.
**Where:** `frontend/src/components/ui/`
**Depends on:** None
**Reuses:** None
**Steps:**
1. Create `Button.tsx`: Supports `isLoading`, `disabled`, `variant` (primary, secondary, danger) properties. Shows a spinner if `isLoading` is true and disables the button.
2. Create `ErrorState.tsx`: An error banner/screen component that displays an error message and a retry action.
3. Create `EmptyState.tsx`: A component with an icon, title, description, and an optional call-to-action button.
4. Create `Spinner.tsx`: A simple inline loading spinner.
**Done when:** All 4 components exist, compile cleanly, and support the properties dictated by the React UI Patterns skill.

### [x] TASK-2: Refactor Error Handling & Toasts
**What:** Replace all silent `.catch(console.error)` usages with actual user-facing errors using `ToastNotification` or `ErrorState`.
**Where:** `frontend/src/pages/`
**Depends on:** TASK-1
**Steps:**
1. Search and replace `.catch(console.error)` instances in `GroupsPage.tsx`, `PlaylistViewPage.tsx`, `TheaterModePage.tsx`, `SongsListPage.tsx`, `PlaylistsPage.tsx`, `DashboardPage.tsx`.
2. For mutations (Create, Delete, Update), show a toast error notification on failure.
3. For queries (Initial Page Fetch), set an `error` state and display the `ErrorState` component.
**Done when:** No `.catch(console.error)` is used without showing an appropriate user-facing message or UI state.

### [x] TASK-3: Refactor Loading States & Empty States
**What:** Ensure loading states only appear when there is no data, and empty states use the new `EmptyState` component.
**Where:** `frontend/src/pages/`
**Depends on:** TASK-1
**Steps:**
1. Refactor `if (loading) return <div...Loading...</div>` to only render when `loading && !data`. Use the `SkeletonCard` or a general `Spinner` instead of plain text.
2. Apply `EmptyState` to lists like groups (`GroupsPage.tsx`), playlists (`PlaylistsPage.tsx`, `SharedWithMePage.tsx`), and songs (`SongsListPage.tsx`).
3. Ensure no flashes occur during refetching.
**Done when:** Empty lists show the `EmptyState` component and initial loading uses proper visual placeholders (Skeletons/Spinners) without wiping cached data on refresh.

### [x] TASK-4: Refactor Button Action States
**What:** Use the new `Button` component to automatically handle disable-on-load states for all async actions.
**Where:** Across `frontend/src/pages/` and `frontend/src/components/`
**Depends on:** TASK-1
**Steps:**
1. Replace standard `<button>` tags triggering network requests with the new `<Button>` component.
2. Ensure properties like `isLoading={isSubmitting}` and `disabled={isSubmitting}` are mapped properly in areas like modals (`LinkPlaylistModal.tsx`, Invite/Create Modals in `GroupsPage.tsx`).
3. Bind state correctly so actions like `handleCreateGroup` activate the loading spinner.
**Done when:** Users cannot double-click to submit forms and visual feedback is presented natively in the action buttons.
