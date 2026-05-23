# Frontend Tasks

**Design**: `.specs/features/frontend/design.md`
**Status**: Draft

---

## Execution Plan

### Phase 1: Foundation (Sequential)
Setup the base project, core global contexts (Auth, Toast), routing, layout structures, and reusable base UI elements.

```
T1 ──→ T2 ──→ T3 ──→ T4 ──→ T5 ──→ T6 ──→ T7 ──→ T8
```

### Phase 2: Core Hooks & UI Components (Parallel OK)
Build isolated components and custom hooks for music rendering, transposition, and scroll mechanics.

```
Phase 1 complete, then:
    ├── T9 [P]
    ├── T10 [P]
    ├── T11 [P]
    ├── T12 [P]
    └── T14 [P]
```

### Phase 3: Auth Pages & Song CRUD Pages (Parallel OK)
Develop standard pages and forms for user authentication and song management, utilizing the Phase 2 components.

```
Phase 2 complete, then:
    ├── T13 [P]  (TheaterControls - depends on T10)
    ├── T15 [P]  (LoginPage)
    ├── T16 [P]  (RegisterPage)
    ├── T17 [P]  (DashboardPage - depends on T9, T14)
    ├── T18 [P]  (SongsListPage - depends on T9, T14)
    ├── T19 [P]  (SongFormPage)
    └── T20 [P]  (SongViewPage - depends on T10, T11)
```

### Phase 4: Playlists & Theater Integration (Sequential)
Wire up playlists, drag-and-drop reordering, full-screen theatrical mode, and global search pages.

```
Phase 3 complete, then:
  T21 ──→ T22 ──→ T23 ──→ T24
```

### Phase 5: P2 & P3 Features (Sequential)
Incorporate groups, sharing, enarmonics/default scroll speed configuration settings, and favoriting logic.

```
Phase 4 complete, then:
  T25 ──→ T26 ──→ T27 ──→ T28
```

---

## Task Breakdown

### Phase 1: Foundation

#### T1: [Project Setup]
**What**: Setup Vite React + TypeScript app with Tailwind CSS, React Router v6, Axios, react-window, and Lucide React.
**Where**: `/`
**Depends on**: None
**Reuses**: None
**Requirement**: None (Infrastructure)
**Tools**:
- MCP: `filesystem`
- Skill: NONE
**Done when**:
- [x] Vite React + TS application initialized and builds without errors
- [x] Tailwind CSS configured and loaded in `index.css`
- [x] React Router routing tree placeholder established in `src/App.tsx`
- [x] Gate check passes: `npm run build`
**Tests**: none
**Gate**: build

#### T2: [ToastNotification Context & Component]
**What**: Create ToastContext, hook, and CSS transition notification cards for displaying feedback message banners (success, warning, error).
**Where**: `src/context/ToastContext.tsx`, `src/components/ui/ToastNotification.tsx`
**Depends on**: T1
**Reuses**: Design System §12.1 colors and timing
**Requirement**: FE-SONG-03 (Toast notification after save)
**Tools**:
- MCP: `filesystem`
- Skill: NONE
**Done when**:
- [x] ToastContext and `useToast` hook implemented
- [x] ToastNotification component supports success (`#10B981`), warning (`#F59E0B`), and error (`#EF4444`) states
- [x] Toast auto-dismisses after 3000ms with fade animation (200ms)
- [x] Unit tests verify toast triggering, rendering, and auto-dismiss
- [x] Test count: 3 tests pass
**Tests**: unit
**Gate**: quick

#### T3: [ConfirmModal Component]
**What**: Build a generic modal overlay component with confirmation actions for destructions (deletes) and unsaved changes warnings.
**Where**: `src/components/modals/ConfirmModal.tsx`
**Depends on**: T1
**Reuses**: Design System §6.4, §12.2
**Requirement**: FE-SONG-04 (unsaved changes edit cancel check)
**Tools**:
- MCP: `filesystem`
- Skill: NONE
**Done when**:
- [x] Modal overlay renders centered with dark dim backdrop
- [x] Supports variant 'danger' (`#EF4444` confirm button) and 'warning' (`#F59E0B`)
- [x] Keyboard navigation: Escape key closes modal
- [x] Unit tests verify modal triggers callbacks correctly and handles keyboard escape
- [x] Test count: 3 tests pass
**Tests**: unit
**Gate**: quick

#### T4: [SkeletonCard Component]
**What**: Create dynamic card skeleton placeholder with pulse animation.
**Where**: `src/components/ui/SkeletonCard.tsx`
**Depends on**: T1
**Reuses**: Design System §12.3
**Requirement**: FE-SONG-01
**Tools**:
- MCP: `filesystem`
- Skill: NONE
**Done when**:
- [x] SkeletonCard component created using Tailwind `animate-pulse`
- [x] Responsive grid container setup (3 cols desktop, 2 cols tablet, 1 col mobile)
- [x] Unit tests verify component renders specified card count
- [x] Test count: 2 tests pass
**Tests**: unit
**Gate**: quick

#### T5: [authService Client]
**What**: Implement Axios client wrapper with requests interceptors to inject JWT and response interceptors for silent token refresh.
**Where**: `src/services/authService.ts`
**Depends on**: T1
**Reuses**: None
**Requirement**: FE-AUTH-03
**Tools**:
- MCP: `filesystem`
- Skill: NONE
**Done when**:
- [x] Axios client intercepts 401s and attempts refreshing token via token endpoint
- [x] Stores credentials in localStorage
- [x] Unit tests mock Axios and verify token insertion and token refresh retry logic
- [x] Test count: 4 tests pass
**Tests**: unit
**Gate**: quick

#### T6: [AuthContext Provider]
**What**: Setup AuthContext with `login`, `register`, and `logout` wrappers communicating with authService and updating global state.
**Where**: `src/context/AuthContext.tsx`
**Depends on**: T5
**Reuses**: None
**Requirement**: FE-AUTH-01, FE-AUTH-02, FE-AUTH-03
**Tools**:
- MCP: `filesystem`
- Skill: NONE
**Done when**:
- [x] Context provider wraps application and exposes token, user details, and auth state
- [x] Silent refresh occurs on application reload if valid refresh token exists in localStorage
- [x] Integration tests verify AuthContext updates user state on successful login/logout and rejects with errors on failure
- [x] Test count: 3 tests pass
**Tests**: integration
**Gate**: quick

#### T7: [PrivateRoute Route Protection]
**What**: Create a Higher-Order Component routing guard that checks AuthContext for active session, redirecting to `/login` if invalid.
**Where**: `src/components/auth/PrivateRoute.tsx`
**Depends on**: T6
**Reuses**: None
**Requirement**: FE-AUTH-03
**Tools**:
- MCP: `filesystem`
- Skill: NONE
**Done when**:
- [x] HOC checks auth status, redirects unauthorized to `/login` using React Router `<Navigate>`
- [x] Preserves location path to redirect back after login
- [x] Integration tests check route rendering block and redirects
- [x] Test count: 2 tests pass
**Tests**: integration
**Gate**: quick

#### T8: [Sidebar and BottomNav Layout]
**What**: Implement navigation layouts: desktop sidebar and mobile bottom navigation tab bar conforming to breakpoints.
**Where**: `src/components/layout/Sidebar.tsx`, `src/components/layout/BottomNav.tsx`
**Depends on**: T1
**Reuses**: Design System §6.5, §9.2
**Requirement**: FE-SONG-01
**Tools**:
- MCP: `filesystem`
- Skill: NONE
**Done when**:
- [x] Sidebar permanently visible on Desktop (`>=1025px`), collapsible on Tablet (`641-1024px`)
- [x] BottomNav active on Mobile (`<=640px`)
- [x] Focus states and ARIA navigation tags verified
- [x] Unit tests check layout visibility transitions on simulated window size changes
- [x] Test count: 3 tests pass
**Tests**: unit
**Gate**: quick

---

### Phase 2: Core Hooks & UI Components

#### T9: [MusicCard Component] [P]
**What**: Build responsive music card displaying title, artist, tom badge, category chips, favorite toggle and dropdown action menu.
**Where**: `src/components/cards/MusicCard.tsx`
**Depends on**: T4, T8
**Reuses**: Design System §6.3
**Requirement**: FE-SONG-01
**Tools**:
- MCP: `filesystem`
- Skill: NONE
**Done when**:
- [x] Card implements all hover shadow states and border highlights
- [x] Dropdown displays actions: Edit, Share, Delete
- [x] Touch target areas for toggles are minimum 48px
- [x] Unit tests verify click actions and prop data mapping
- [x] Test count: 4 tests pass
**Tests**: unit
**Gate**: quick

#### T10: [TransposePad Component] [P]
**What**: Implement the `[-] [Tom] [+]` transposition controller.
**Where**: `src/components/music/TransposePad.tsx`
**Depends on**: T8
**Reuses**: Design System §6.1, `button_states.png`
**Requirement**: FE-TRANSP-01
**Tools**:
- MCP: `filesystem`
- Skill: NONE
**Done when**:
- [x] Pads show current transposed key
- [x] Button states hover, active, and disabled match mockup styling
- [x] Unit tests verify clicks trigger semitones adjustment callback
- [x] Test count: 3 tests pass
**Tests**: unit
**Gate**: quick

#### T11: [ChordSheet Renderer Component] [P]
**What**: Create a chord sheet formatter rendering chords aligned above text in Courier New monospace, using `react-window` for virtualizing long files.
**Where**: `src/components/music/ChordSheet.tsx`
**Depends on**: T8
**Reuses**: Design System §5.2, §5.3 (Cifra)
**Requirement**: FE-SONG-02
**Tools**:
- MCP: `filesystem`
- Skill: NONE
**Done when**:
- [x] Render structures aligned chords exactly over character index
- [x] React-window virtualization handles >500 lines seamlessly without lag
- [x] Font size adjustable (18px-24px)
- [x] Unit tests check layout rendering, alignment accuracy, and virtualization mounting
- [x] Test count: 4 tests pass
**Tests**: unit
**Gate**: quick

#### T12: [useAutoScroll Custom Hook] [P]
**What**: Develop custom window/container scroll engine hook utilizing `requestAnimationFrame`.
**Where**: `src/hooks/useAutoScroll.ts`
**Depends on**: T8
**Reuses**: Design System §11.3
**Requirement**: FE-THEATER-02
**Tools**:
- MCP: `filesystem`
- Skill: NONE
**Done when**:
- [x] Hook provides `isScrolling`, `speed` (1-10 scale), `play`, `pause`, and container reference
- [x] Smooth scrolling operates continuously without page stuttering
- [x] Scroll halts immediately upon manual user touch drag and resumes safely
- [x] Unit tests verify state updates and timers/scroll triggers
- [x] Test count: 3 tests pass
**Tests**: unit
**Gate**: quick

#### T14: [SearchBar Input Dropdown] [P]
**What**: Setup header search bar with debouncing (300ms) fetching matches and presenting a dropdown lists of options.
**Where**: `src/components/search/SearchBar.tsx`
**Depends on**: T8
**Reuses**: Design System §6.2, §6.5
**Requirement**: FE-SEARCH-01
**Tools**:
- MCP: `filesystem`
- Skill: NONE
**Done when**:
- [x] Search executes only after 300ms of typing
- [x] Renders dropdown listing matches (Title, Artist, Key)
- [x] Typing Enter redirects user to full search page `/search?q={term}`
- [x] Unit tests mock API and verify debouncing delays and keypress redirections
- [x] Test count: 3 tests pass
**Tests**: unit
**Gate**: quick

---

### Phase 3: Auth Pages & Song CRUD Pages

#### T13: [TheaterControls Overlay Component] [P]
**What**: Build theater overlay control deck for performance settings (scroll toggle, speed slider, transpose buttons, nav buttons).
**Where**: `src/components/theater/TheaterControls.tsx`
**Depends on**: T10
**Reuses**: Design System §7.2
**Requirement**: FE-THEATER-01, FE-THEATER-03, FE-THEATER-04
**Tools**:
- MCP: `filesystem`
- Skill: NONE
**Done when**:
- [ ] Dark semi-transparent (`rgba(0,0,0,0.6)`) float deck created
- [ ] Nav buttons Prev/Next and scroll speed slider work
- [ ] Touch targets verified to be at least 48px
- [ ] Unit tests verify action dispatching on buttons and slider changes
- [ ] Test count: 3 tests pass
**Tests**: unit
**Gate**: quick

#### T15: [LoginPage Page] [P]
**What**: Implement login page with validation styling.
**Where**: `src/pages/LoginPage.tsx`
**Depends on**: T6, T2
**Reuses**: Design System §4 (Neutro 900 background), §6.2
**Requirement**: FE-AUTH-01
**Tools**:
- MCP: `filesystem`
- Skill: NONE
**Done when**:
- [x] Validates email format and password presence inline
- [x] Directs to `/dashboard` upon successful login, displaying toast notice
- [x] integration tests verify error displays on invalid submissions and routing on success
- [x] Test count: 3 tests pass
**Tests**: integration
**Gate**: quick

#### T16: [RegisterPage Page] [P]
**What**: Implement sign-up page validating fields on blur.
**Where**: `src/pages/RegisterPage.tsx`
**Depends on**: T6, T2
**Reuses**: Design System §4, §6.2
**Requirement**: FE-AUTH-02
**Tools**:
- MCP: `filesystem`
- Skill: NONE
**Done when**:
- [x] Compares passwords match inline
- [x] Handles registration API calls, redirecting on success
- [x] Integration tests verify validations and submission handlers
- [x] Test count: 3 tests pass
**Tests**: integration
**Gate**: quick

#### T17: [DashboardPage Page] [P]
**What**: Build dashboard page showcasing recent songs, skeleton loaders, and empty states.
**Where**: `src/pages/DashboardPage.tsx`
**Depends on**: T9, T14, T7
**Reuses**: Design System §7.1
**Requirement**: FE-SONG-01
**Tools**:
- MCP: `filesystem`
- Skill: NONE
**Done when**:
- [x] Grid of cards loads, displaying skeleton loader beforehand
- [x] Empty state rendered when no songs exist, showing action to add new songs
- [x] Integration tests check card rendering and skeleton states
- [x] Test count: 3 tests pass
**Tests**: integration
**Gate**: quick

#### T18: [SongsListPage Page] [P]
**What**: Build full repertoire list page featuring card grids and filter selectors.
**Where**: `src/pages/SongsListPage.tsx`
**Depends on**: T9, T14, T7
**Reuses**: Design System §7.1
**Requirement**: FE-SONG-01
**Tools**:
- MCP: `filesystem`
- Skill: NONE
**Done when**:
- [x] Displays all user songs in responsive card layouts
- [x] Integration tests verify grid mapping and list filtering
- [x] Test count: 2 tests pass
**Tests**: integration
**Gate**: quick

#### T19: [SongFormPage Page] [P]
**What**: Implement create and edit forms for songs, with bracket parsing inputs.
**Where**: `src/pages/SongFormPage.tsx`
**Depends on**: T2, T7
**Reuses**: Design System §6.2
**Requirement**: FE-SONG-03, FE-SONG-04
**Tools**:
- MCP: `filesystem`
- Skill: NONE
**Done when**:
- [x] monopace text editor accepts `[Chord]Text` formatting
- [x] Displays confirmation modal if navigation occurs while form has unsaved modifications
- [x] Integration tests check parsing translation outputs and cancellation prompt modals
- [x] Test count: 3 tests pass
**Tests**: integration
**Gate**: quick

#### T20: [SongViewPage Page] [P]
**What**: Build song detail view integrating TransposePad, ChordSheet, and action triggers.
**Where**: `src/pages/SongViewPage.tsx`
**Depends on**: T10, T11, T2, T7
**Reuses**: Design System §7.3
**Requirement**: FE-SONG-02, FE-TRANSP-02
**Tools**:
- MCP: `filesystem`
- Skill: NONE
**Done when**:
- [x] Integrates TransposePad, updating chord display instantly (optimistic updates under 200ms)
- [x] Navigation button to TheaterMode and Add to Playlist modal active
- [x] Integration tests verify transpose cycles and layout rendering
- [x] Test count: 3 tests pass
**Tests**: integration
**Gate**: quick

---

### Phase 4: Playlists & Theater Integration

#### T21: [PlaylistsPage Page]
**What**: Create playlist list view displaying grid cards and new playlist creation modal.
**Where**: `src/pages/PlaylistsPage.tsx`
**Depends on**: T7, T3
**Reuses**: Design System §6.3, §6.4
**Requirement**: FE-PLAYLIST-01, FE-PLAYLIST-02
**Tools**:
- MCP: `filesystem`
- Skill: NONE
**Done when**:
- [x] Grid listings show title, counts, type badges (Private/Collab)
- [x] Modal captures names, creation type, and targets creation actions to API
- [x] Integration tests check list renders and modal submissions
- [x] Test count: 3 tests pass
**Tests**: integration
**Gate**: quick

#### T22: [PlaylistViewPage Page]
**What**: Build playlist details viewer featuring ordered lists of songs and DnD reordering.
**Where**: `src/pages/PlaylistViewPage.tsx`
**Depends on**: T21
**Reuses**: Design System §7.3
**Requirement**: FE-PLAYLIST-03
**Tools**:
- MCP: `filesystem`
- Skill: NONE
**Done when**:
- [x] Lists songs sequentially
- [x] Implements drag-and-drop reordering for Desktop, and fallback move controls (↑↓) for touch screen mobile
- [x] Integration tests verify drag ordering updates state correctly
- [x] Test count: 2 tests pass
**Tests**: integration
**Gate**: quick

#### T23: [TheaterModePage Page]
**What**: Implement fullscreen Modo Teatro containing active sheet auto-scroll, overlay speed deck, and playlist song switching.
**Where**: `src/pages/TheaterModePage.tsx`
**Depends on**: T22, T12, T13
**Reuses**: Design System §7.2
**Requirement**: FE-THEATER-01, FE-THEATER-02, FE-THEATER-03, FE-THEATER-04
**Tools**:
- MCP: `filesystem`
- Skill: NONE
**Done when**:
- [x] Fullscreen API activates, locking page to dark landscape/portrait sheets
- [x] Integrates auto-scroll custom hook speed slider controls
- [x] Transposition buttons update chord keys instantly within the scrolling viewer
- [x] Integration tests verify full playback lifecycle (start, pause, page transition, exit)
- [x] Test count: 4 tests pass
**Tests**: integration
**Gate**: quick

#### T24: [SearchPage Page]
**What**: Create global query result detail page.
**Where**: `src/pages/SearchPage.tsx`
**Depends on**: T14
**Reuses**: Design System §7.1
**Requirement**: FE-SEARCH-01
**Tools**:
- MCP: `filesystem`
- Skill: NONE
**Done when**:
- [x] Parses query strings, calling full-text fetch endpoints
- [x] Displays matches in grids with highlighting markers or empty state screens
- [x] Integration tests verify search fetch triggers and grid bindings
- [x] Test count: 2 tests pass
**Tests**: integration
**Gate**: quick

---

### Phase 5: P2 & P3 Features

#### T25: [GroupsPage Page & GroupCard Component]
**What**: Build groups directory listing members and shared playlist decks, including invite modals.
**Where**: `src/pages/GroupsPage.tsx`, `src/components/cards/GroupCard.tsx`
**Depends on**: T7, T3
**Reuses**: Design System §6.3, §6.4
**Requirement**: FE-GROUP-01, FE-COLLAB-01
**Tools**:
- MCP: `filesystem`
- Skill: NONE
**Done when**:
- [x] Lists active user bands/groups
- [x] Modals permit entering emails to invite new members
- [x] Integration tests verify modal dispatching and card layout mappings
- [x] Test count: 3 tests pass
**Tests**: integration
**Gate**: quick

#### T26: [SharedWithMePage Page]
**What**: Implement folder displaying songs and playlists shared from other accounts.
**Where**: `src/pages/SharedWithMePage.tsx`
**Depends on**: T7
**Reuses**: Design System §7.1
**Requirement**: FE-COLLAB-01, FE-FAV-01
**Tools**:
- MCP: `filesystem`
- Skill: NONE
**Done when**:
- [x] Displays grid cards showing sender avatar tags
- [x] Integration tests verify render filters
- [x] Test count: 2 tests pass
**Tests**: integration
**Gate**: quick

#### T27: [SettingsPage Page]
**What**: Implement user profile enarmonics and scroll config form.
**Where**: `src/pages/SettingsPage.tsx`
**Depends on**: T7
**Reuses**: Design System §6.2
**Requirement**: FE-SETTINGS-01
**Tools**:
- MCP: `filesystem`
- Skill: NONE
**Done when**:
- [x] Form displays selectors for flat/sharp preferences, standard font scale, and scroll speeds
- [x] Persists updates to backend via profile update API call
- [x] Integration tests verify inputs update correctly and trigger save services
- [x] Test count: 2 tests pass
**Tests**: integration
**Gate**: quick

#### T28: [MusicCard Heart Integration]
**What**: Update MusicCard component and services to process P2 favorite heart clicks, persisting changes immediately.
**Where**: `src/components/cards/MusicCard.tsx` (modify), `src/services/songService.ts` (modify)
**Depends on**: T9
**Reuses**: Design System §4 (Secundária color `#EC4899`)
**Requirement**: FE-FAV-01
**Tools**:
- MCP: `filesystem`
- Skill: NONE
**Done when**:
- [x] Click fills heart icon with pink `#EC4899` and updates favorite status on API
- [x] Unit tests check click toggles state and invokes toggle service
- [x] Test count: 2 tests pass
**Tests**: unit
**Gate**: quick

---

## Parallel Execution Map

```
Phase 1 (Sequential):
  T1 ──→ T2 ──→ T3 ──→ T4 ──→ T5 ──→ T6 ──→ T7 ──→ T8

Phase 2 (Parallel):
  T8 complete, then:
    ├── T9 [P]
    ├── T10 [P]
    ├── T11 [P]
    ├── T12 [P]
    └── T14 [P]

Phase 3 (Parallel):
  Phase 2 complete, then:
    ├── T13 [P]
    ├── T15 [P]
    ├── T16 [P]
    ├── T17 [P]
    ├── T18 [P]
    ├── T19 [P]
    └── T20 [P]

Phase 4 (Sequential):
  Phase 3 complete, then:
    T21 ──→ T22 ──→ T23 ──→ T24

Phase 5 (Sequential):
  Phase 4 complete, then:
    T25 ──→ T26 ──→ T27 ──→ T28
```

**Parallelism constraint:** Tasks marked `[P]` do not depend on each other and use parallel-safe unit/integration isolation layers (mock environments).

---

## Task Granularity Check

| Task | Scope | Status |
| --- | --- | --- |
| T1: Project Setup | Setup configuration files and dependencies | ✅ Granular |
| T2: ToastNotification | 1 Context Provider & 1 UI Component | ✅ Granular |
| T3: ConfirmModal | 1 UI Component | ✅ Granular |
| T4: SkeletonCard | 1 UI Component | ✅ Granular |
| T5: authService | 1 API Client service | ✅ Granular |
| T6: AuthContext | 1 Global State context | ✅ Granular |
| T7: PrivateRoute | 1 Route Guard HOC | ✅ Granular |
| T8: Sidebar & BottomNav | 2 Navigation Layouts | ✅ Granular (Cohesive navigation) |
| T9: MusicCard | 1 UI Component card | ✅ Granular |
| T10: TransposePad | 1 UI Component selector | ✅ Granular |
| T11: ChordSheet | 1 UI Component formatter | ✅ Granular |
| T12: useAutoScroll | 1 Custom Hook scroll controller | ✅ Granular |
| T13: TheaterControls | 1 UI Component control deck | ✅ Granular |
| T14: SearchBar | 1 UI Component input | ✅ Granular |
| T15: LoginPage | 1 Page | ✅ Granular |
| T16: RegisterPage | 1 Page | ✅ Granular |
| T17: DashboardPage | 1 Page | ✅ Granular |
| T18: SongsListPage | 1 Page | ✅ Granular |
| T19: SongFormPage | 1 Page (handles create & edit) | ✅ Granular (Cohesive forms) |
| T20: SongViewPage | 1 Page | ✅ Granular |
| T21: PlaylistsPage | 1 Page | ✅ Granular |
| T22: PlaylistViewPage | 1 Page | ✅ Granular |
| T23: TheaterModePage | 1 Page | ✅ Granular |
| T24: SearchPage | 1 Page | ✅ Granular |
| T25: GroupsPage | 1 Page & 1 UI Component card | ✅ Granular (Cohesive module) |
| T26: SharedWithMePage | 1 Page | ✅ Granular |
| T27: SettingsPage | 1 Page | ✅ Granular |
| T28: MusicCard Heart | Add click behavior toggling to component | ✅ Granular |

---

## Diagram-Definition Cross-Check

| Task | Depends On (task body) | Diagram Shows | Status |
| --- | --- | --- | --- |
| T1 | None | Starts Phase 1 | ✅ Match |
| T2 | T1 | T1 → T2 | ✅ Match |
| T3 | T1 | T2 → T3 | ✅ Match |
| T4 | T1 | T3 → T4 | ✅ Match |
| T5 | T1 | T4 → T5 | ✅ Match |
| T6 | T5 | T5 → T6 | ✅ Match |
| T7 | T6 | T6 → T7 | ✅ Match |
| T8 | T1 | T7 → T8 | ✅ Match |
| T9 | T4, T8 | Phase 1 complete → T9 | ✅ Match |
| T10 | T8 | Phase 1 complete → T10 | ✅ Match |
| T11 | T8 | Phase 1 complete → T11 | ✅ Match |
| T12 | T8 | Phase 1 complete → T12 | ✅ Match |
| T13 | T10 | Phase 2 complete → T13 | ✅ Match (T10 is Phase 2, T13 is Phase 3) |
| T14 | T8 | Phase 1 complete → T14 | ✅ Match |
| T15 | T6, T2 | Phase 2 complete → T15 | ✅ Match |
| T16 | T6, T2 | Phase 2 complete → T16 | ✅ Match |
| T17 | T9, T14, T7 | Phase 2 complete → T17 | ✅ Match (T9, T14 are Phase 2) |
| T18 | T9, T14, T7 | Phase 2 complete → T18 | ✅ Match (T9, T14 are Phase 2) |
| T19 | T2, T7 | Phase 2 complete → T19 | ✅ Match (T2, T7 are Phase 1) |
| T20 | T10, T11, T2, T7 | Phase 2 complete → T20 | ✅ Match (T10, T11 are Phase 2) |
| T21 | T7, T3 | Phase 3 complete → T21 | ✅ Match |
| T22 | T21 | T21 → T22 | ✅ Match |
| T23 | T22, T12, T13 | T22 → T23 | ✅ Match (T12, T13 are prerequisite layers) |
| T24 | T14 | T23 → T24 | ✅ Match (T14 is prerequisite layer) |
| T25 | T7, T3 | Phase 4 complete → T25 | ✅ Match |
| T26 | T7 | T25 → T26 | ✅ Match |
| T27 | T7 | T26 → T27 | ✅ Match |
| T28 | T9 | T27 → T28 | ✅ Match (T9 is prerequisite layer) |

---

## Test Co-location Validation

| Task | Code Layer Created/Modified | Matrix Requires | Task Says | Status |
| --- | --- | --- | --- | --- |
| T1 | None (Infrastructure) | none | none | ✅ OK |
| T2 | UI Components / Contexts | unit/integration | unit | ✅ OK |
| T3 | UI Components | unit | unit | ✅ OK |
| T4 | UI Components | unit | unit | ✅ OK |
| T5 | Services & Hooks | unit | unit | ✅ OK |
| T6 | Routing / Contexts | integration | integration | ✅ OK |
| T7 | Routing / Contexts | integration | integration | ✅ OK |
| T8 | UI Components | unit | unit | ✅ OK |
| T9 | UI Components | unit | unit | ✅ OK |
| T10 | UI Components | unit | unit | ✅ OK |
| T11 | UI Components | unit | unit | ✅ OK |
| T12 | Services & Hooks | unit | unit | ✅ OK |
| T13 | UI Components | unit | unit | ✅ OK |
| T14 | UI Components | unit | unit | ✅ OK |
| T15 | Pages | integration | integration | ✅ OK |
| T16 | Pages | integration | integration | ✅ OK |
| T17 | Pages | integration | integration | ✅ OK |
| T18 | Pages | integration | integration | ✅ OK |
| T19 | Pages | integration | integration | ✅ OK |
| T20 | Pages | integration | integration | ✅ OK |
| T21 | Pages | integration | integration | ✅ OK |
| T22 | Pages | integration | integration | ✅ OK |
| T23 | Pages | integration | integration | ✅ OK |
| T24 | Pages | integration | integration | ✅ OK |
| T25 | Pages / UI Components | integration | integration | ✅ OK |
| T26 | Pages | integration | integration | ✅ OK |
| T27 | Pages | integration | integration | ✅ OK |
| T28 | UI Components | unit | unit | ✅ OK |
