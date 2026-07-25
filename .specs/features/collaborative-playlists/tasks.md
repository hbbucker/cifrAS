# Tasks: Collaborative Playlists & Sharing

## 1. Backend: Playlist Sharing Logic
**What:** Add `shareToken` field to Playlist entity and endpoints for generating and fetching by token.
**Where:** `src/main/java/br/com/cifras/[feature]/` (playlist module)
**Tests:** Add unit tests for `generateShareToken` and integration tests using REST Assured + Testcontainers for the endpoints. Coverage must be >= 95% for link generation and permissions.

## 2. Frontend: Share UI and Link Generation
**What:** Add a "Share" button to the Playlist view that calls the backend and displays the generated link.
**Where:** `src/main/webui/src/features/playlists/`
**Depends on:** 1

## 3. Frontend: Public Read-Only View
**What:** Create route and page for viewing a shared playlist via the token (`/shared/playlist/:token`).
**Where:** `src/main/webui/src/pages/` and `src/main/webui/src/features/playlists/`
**Depends on:** 1

## 4. Frontend: Sign-up Wall Interceptors
**What:** Intercept actions for bulk transpose and auto-scroll (Theater mode) on the public view to trigger a sign-up modal.
**Where:** `src/main/webui/src/components/` (modals) and the public playlist view.
**Depends on:** 3

## 5. Testing: Playwright E2E
**What:** Write E2E tests validating that the owner can generate a link, an anonymous user can view the playlist, and that clicking transpose/auto-scroll triggers the sign-up wall.
**Where:** `src/main/webui/e2e/`
**Depends on:** 2, 3, 4

## 6. Verification
**What:** Run all linters and tests to ensure 100% pass and >=95% coverage on link generation logic.
**Where:** Root directory
**Depends on:** 5
