# Bug Fix: Song Edit Form Not Saving Changes

## What
The `SongFormPage.tsx` currently uses mocked data and its `handleSave` method merely triggers a success toast and redirects, without actually persisting the changes. Now that the Quarkus backend is ready and the Vite proxy is configured, we need to wire the form to the real API.

## Where
- `src/pages/SongFormPage.tsx`
- (Optional but necessary for visibility) `src/services/songService.ts` or direct `axios` calls in the page to fetch and mutate the actual backend data.

## Done when
- [x] Editing an existing song fetches its real data from `GET /api/songs/{id}`.
- [x] Clicking "Save" calls `PUT /api/songs/{id}` (or `POST /api/songs` for new songs) with the updated payload.
- [x] The user is notified of the actual backend success/failure.
- [x] The app navigates back to the list and the newly saved changes persist.

## Phase 2: Auth Integration Fix (401 Error)

### What
The frontend pages now properly hit the backend `/api/songs` endpoints, but are returning `401 Unauthorized`. This occurs because `LoginPage.tsx` is still heavily mocked: it catches login errors and sets `localStorage.setItem('token', 'mock-token')`. The Quarkus backend strictly validates JWTs against Supabase's public keys, so it rejects the `"mock-token"` string.

### Where
- `src/pages/auth/LoginPage.tsx`
- `src/pages/auth/RegisterPage.tsx`
- `src/context/AuthContext.tsx`

### Done when
- [x] `LoginPage.tsx` calls `POST /api/auth/login` and strictly uses the real `token` returned by the backend. The fallback to `mock-token` is completely removed.
- [x] `RegisterPage.tsx` calls `POST /api/auth/register` and redirects to login on success.
- [x] `AuthContext.tsx` validates the real token.
- [x] Backend requests succeed with `200 OK` using the genuine JWT.
