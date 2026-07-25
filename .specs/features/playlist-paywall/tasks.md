# Tasks: Playlist Paywall

| ID | Title | Description | Dependencies | Status |
|---|---|---|---|---|
| **TASK-1** | Create `SignUpWallModal` | Implement the modal UI component following the Pinterest-like design system, with the required text and styling. | None | Pending |
| **TASK-2** | Deep Link Redirect Logic | Implement saving intent (e.g. `returnTo` URL) prior to login and recovering it in `/auth/callback` after Supabase auth. | None | Pending |
| **TASK-3** | `PlaylistViewer` Interceptor | Integrate the modal and auth check in `PlaylistViewer`. Prevent unauthenticated access to `songIndex >= 1` or Theater Mode. Trigger the Deep Link logic on CTA click. | TASK-1, TASK-2 | Pending |
| **TASK-4** | Write E2E Tests | Implement Playwright tests verifying the sign-up wall presentation on the 2nd song and the successful deep link redirect after login. | TASK-3 | Pending |

## Execution Notes
- Execute phase should run these sequentially and verify against the requirements in `spec.md`.
- Do not make application code changes until these tasks are reviewed.
