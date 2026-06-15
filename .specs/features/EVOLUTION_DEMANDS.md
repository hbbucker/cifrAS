# Evolution Demands - CifrAS

This document outlines the planned evolution of CifrAS for Milestones 2 and 3, focusing on advanced features, collaboration, and personalization. All demands follow the **Rich Domain Model** and **Spec-driven workflow** conventions.

---

## Epic 1: Advanced Search (PostgreSQL Full-Text Search)
**Context:** Transition from simple `ILIKE` filters to a robust search engine capable of handling typos, ranking, and large-scale data.

### User Story: Search by Content
As a **musician**, I want to **search for songs using snippets of lyrics or specific artist names** so that **I can find the right song even when I don't remember the exact title.**

### Acceptance Criteria
- [ ] Implement `tsvector` and `tsquery` in the PostgreSQL database for `title`, `artist`, and `lyrics` (JSON content).
- [ ] Backend: Create a `SearchService` that abstracts the PostgreSQL FTS logic.
- [ ] Domain: The `Song` model should remain clean, while the `SongRepository` handles the complex SQL/HQL for ranking.
- [ ] Frontend: Implement a "Quick Search" component with highlighting for matched snippets.
- [ ] Performance: Search results should return in under 200ms for a database of 10,000+ songs.

---

## Epic 2: Collaboration & Groups
**Context:** Enabling bands and musical groups to manage shared repertoires.

### User Story: Band Repertoire Management
As a **group leader**, I want to **create a group and invite other musicians** so that **we can maintain a shared list of songs and playlists for our performances.**

### Acceptance Criteria
- [ ] Domain: Implement `Group` and `Membership` (Owner, Admin, Member) entities with rich behavioral methods (e.g., `group.invite(email)`, `group.promote(member)`).
- [ ] invitations: Support invitation links and email-based invites with expiration logic.
- [ ] Shared Playlists: Playlists associated with a group allow any member with "Admin" or "Editor" permissions to add, remove, and reorder songs (Drag-and-Drop).
- [ ] Audit: Keep track of who made changes to a shared playlist.

---

## Epic 3: User Personalization
**Context:** Making the app adapt to the specific needs of each musician.

### User Story: Song Preferences Persistence
As a **performer**, I want the app to **remember the key I usually play a specific song in** so that **I don't have to manually transpose it every time I open it.**

### Acceptance Criteria
- [ ] Domain: Create a `UserSongPreference` entity to store `preferredKey` (relative to original), `preferredEnharmonic` (Sharps vs. Flats), and `autoScrollSpeed`.
- [ ] Persistence: Save these settings automatically when changed in the UI (debounced PATCH requests).
- [ ] Global Settings: Implement user-level preferences for UI Theme (Light/Dark/System) and default transposition behavior.
- [ ] Integration: The `SongResource` must merge the base `Song` data with the authenticated user's `UserSongPreference`.

---

## Epic 4: Theater Mode v2
**Context:** Professionalizing the live performance experience with persistence and better interaction.

### User Story: Persistent Performance Session
As a **musician on stage**, I want to **resume my Theater Mode session exactly where I left off, even if I change devices** so that **I can have a backup tablet ready without losing my place in the playlist.**

### Acceptance Criteria
- [ ] Backend: Implement `SessionState` persistence (Current Playlist, Current Song Index, Scroll Position).
- [ ] Real-time: (Optional/Stretch) Use WebSockets or long-polling to sync state across devices logged into the same account.
- [ ] UX: Implement gestural controls:
    - [ ] Horizontal swipe to change songs.
    - [ ] Pinch-to-zoom for font size adjustment.
    - [ ] Double-tap to pause/resume auto-scroll.
- [ ] UI: Add a "Battery Saver" mode for Theater Mode (high contrast, reduced animations).

---

## Epic 5: Internationalization (i18n)
**Context:** Preparing CifrAS for a global audience.

### User Story: Multi-language Support
As a **non-Portuguese speaking musician**, I want to **use the application in my native language (English or Spanish)** so that **I can navigate the interface without barriers.**

### Acceptance Criteria
- [ ] Frontend: Integrate `react-i18next` and move all hardcoded strings to translation files (`pt-BR.json`, `en-US.json`, `es-ES.json`).
- [ ] Backend: Support `Accept-Language` headers for error messages and system notifications.
- [ ] Persistence: Save the user's preferred language in their profile.
- [ ] Dynamic Content: Ensure that music categories or system tags can be translated.

---

## Technical Alignment & Constraints
1. **Rich Domain Model:** Business logic for group invites and preference merging must reside in Domain Services or Models, not in REST Resources.
2. **Spec-Driven:** Each of these Epics requires a detailed `spec.md` in its respective feature folder before implementation.
3. **Database Migration:** Use Flyway or Supabase migrations for all schema changes (tsvector, new entities).
