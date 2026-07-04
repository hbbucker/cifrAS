# Song Edit Screen Refactor Specification

## Problem Statement

The current song editing screen has small input fields and wastes too much screen real estate with empty space. This makes it difficult for users to visualize and edit the whole song (lyrics and chords) quickly and comfortably. Furthermore, the lack of agile shortcuts slows down the process of formatting and saving songs. 

## Goals

- [ ] Maximize the editing area for chords and lyrics (make it take up most of the screen).
- [ ] Implement touch-friendly quick action buttons (e.g., "Refrão", line break, separator) to speed up editing on tablets and mobile devices.
- [ ] Maintain 100% compatibility with existing backend endpoints (`POST` and `PUT` for songs).

## Out of Scope

Explicitly excluded. Documented to prevent scope creep.

| Feature     | Reason         |
| ----------- | -------------- |
| Backend API modifications | The goal is purely UI/UX improvements. The backend functionality and endpoints must remain untouched. |
| Automatic chord parsing | Out of scope for this UI/UX refactor. |

---

## User Stories

### P1: Maximize Editing Area ⭐ MVP

**User Story**: As a musician, I want the chords and lyrics text area to take up maximum screen space so that I can easily see and edit the whole song without excessive scrolling.

**Why P1**: Solves the primary complaint of inputs being too small and too much empty space on the screen.

**Acceptance Criteria**:

1. WHEN the user opens the Song Edit/New page THEN the layout SHALL use a visually appealing, Tailwind-based design following the project's design system. The metadata fields (Title, Artist, Key) SHALL be compact, with the "Tom" (Key) input being significantly narrower (e.g. `w-16` or `w-20`) since it only needs to hold a couple of letters.
2. WHEN the user views the main content area THEN the "Chords & Lyrics" textarea SHALL occupy the majority of the remaining vertical and horizontal screen space, removing unnecessary margins.
3. WHEN the screen is resized THEN the textarea SHALL resize responsively to maintain maximum fill.

**Independent Test**: Open the edit screen on desktop and mobile and verify the textarea occupies at least 70% of the viewport height.

---

### P1: Quick Action Buttons (Tablet/Touch Friendly) ⭐ MVP

**User Story**: As a user editing on a tablet or mobile, I want one-click buttons for common song structures (Chorus, Line Break, Separator) so that I can format the song quickly without typing brackets or repetitive words.

**Why P1**: Greatly improves the editing experience on touch devices where typing brackets or specific formatting tokens is slow.

**Acceptance Criteria**:

1. WHEN the user views the editing screen THEN the system SHALL display a quick-access toolbar with buttons for structural elements (e.g., "Refrão", "Quebra de linha", "Separador", "Tablatura").
2. WHEN the user clicks a quick action button THEN the system SHALL insert the corresponding formatting token/text (e.g., Tablature base lines: `e|---\nB|---\n...`) into the textarea at the current cursor position.
3. (Optional but recommended) WHEN on a desktop device, `Ctrl+S` SHALL still save the song for keyboard agility.

**Independent Test**: Tap the "Refrão" button on a tablet/mobile view and verify the token (e.g. `[Refrão]`) is inserted into the text at the cursor position.

---

## Edge Cases

- WHEN the screen is very small (mobile) THEN the system SHALL still prioritize the lyrics textarea height over empty space.
- WHEN the user presses the save shortcut but there are validation errors (e.g., empty title) THEN the system SHALL display the toast warning and NOT save.

---

## Requirement Traceability

Each requirement gets a unique ID for tracking across design, tasks, and validation.

| Requirement ID | Story       | Phase  | Status  |
| -------------- | ----------- | ------ | ------- |
| SEDIT-01       | P1: Maximize Editing Area | Design | Pending |
| SEDIT-02       | P1: Quick Action Buttons | Design | Pending |

**Coverage:** 2 total, 0 mapped to tasks, 2 unmapped ⚠️

---

## Success Criteria

How we know the feature is successful:

- [ ] The "Chords & Lyrics" textarea occupies significantly more viewport space than before.
- [ ] Users can quickly insert structural elements ("Refrão", breaks) using one-click buttons.
- [ ] Existing endpoints still function correctly for saving/updating songs.
