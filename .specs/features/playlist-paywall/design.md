# Design: Playlist Paywall

## Architecture & Components

### 1. `PlaylistViewer` Interceptor
- **Location:** Frontend `src/features/playlists/` or `src/components/`.
- **Logic:** Hook into the song selection handler and the Theater Mode activation. Check `isAuthenticated` (via `useSupabaseAuth` or similar global auth context). If `!isAuthenticated` and target is restricted (e.g. `songIndex >= 1`), prevent state change and open `SignUpWallModal`.

### 2. `SignUpWallModal` Component
- **UI:** A centered modal over a 50% opacity darkened background (the only component allowed to have a 16px shadow per AGENTS.md rules).
- **Styling (Tailwind):**
  - Background: `bg-white` (Canvas `#ffffff`)
  - Border Radius: `rounded-lg` (32px radius for modals)
  - CTA Button: `<Button variant="primary">` (Purple Primary `#aa3bff`, 16px radius).

### 3. Deep Linking & Redirect Strategy
- Before redirecting the user to the Supabase OAuth login page, store the current playlist URL (and potentially the intended `songIndex`) in `sessionStorage` or as a `returnTo` URL parameter.
- Upon successful authentication, the `/auth/callback` route (or the layout's auth state listener) will check for the stored intent.
- If found, it clears the stored intent and performs a React Router navigation to the original playlist URL.

### 4. End-to-End Testing (Playwright)
- Tests will mock the authentication state, simulate attempting to navigate to the 2nd song, verify the modal appears with correct text, simulate login bypass (via the `e2e` profile and mock JWT), and verify the user is returned to the playlist.
