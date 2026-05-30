# Song Preferences Menu Specification

## Problem Statement

Users need a way to customize their viewing experience for a song, specifically controlling auto-scroll speed and preferred chord notations (enharmonic equivalents like Bb vs A#, Eb vs D#). At the `/song/{id}` screen, there is an unused button between the transpose and edit buttons that should serve as the entry point for these settings.

## Goals

- [ ] Transform the unused button into a working preferences toggle.
- [ ] Display a top-to-bottom dropdown menu containing song viewing preferences.
- [ ] Provide an auto-scroll speed control.
- [ ] Provide a toggle for "Usar Bb" (substitutes A#).
- [ ] Provide a toggle for "Usar Eb" (substitutes D#).
- [ ] Apply these chord notation preferences to the currently displayed chords and during transposition operations.

## Out of Scope

| Feature     | Reason         |
| ----------- | -------------- |
| Global user preference syncing | Initially, these settings can be local/session-based to focus on the immediate UI and substitution logic. |

---

## User Stories

### P1: Preferences Menu UI ⭐ MVP

**User Story**: As a user, I want to click the settings button to access my song viewing preferences in a dropdown menu.

**Why P1**: Provides the interface for the features.

**Acceptance Criteria**:

1. WHEN the user clicks the settings button (between transpose and edit) THEN the system SHALL display a dropdown menu rolling from top to bottom.
2. WHEN the menu opens THEN the system SHALL display an auto-scroll speed control.
3. WHEN the menu opens THEN the system SHALL display a toggle labeled "Usar Bb".
4. WHEN the menu opens THEN the system SHALL display a toggle labeled "Usar Eb".

**Independent Test**: Click the button and visually confirm the dropdown menu and its elements appear correctly.

---

### P1: Enharmonic Substitutions ⭐ MVP

**User Story**: As a musician, I want to toggle between A#/Bb and D#/Eb so that the chords match my reading preference.

**Why P1**: Core functional requirement for accurate chord reading and transposition.

**Acceptance Criteria**:

1. WHEN the user enables "Usar Bb" THEN the system SHALL display Bb instead of A# in the song's chords and during any transpose operation.
2. WHEN the user disables "Usar Bb" THEN the system SHALL display A# (default) in the song's chords and during any transpose operation.
3. WHEN the user enables "Usar Eb" THEN the system SHALL display Eb instead of D# in the song's chords and during any transpose operation.
4. WHEN the user disables "Usar Eb" THEN the system SHALL display D# (default) in the song's chords and during any transpose operation.

**Independent Test**: Toggle the settings and observe the chords on the screen updating immediately. Verify that transposing the song up or down respects the active toggle.

---

### P2: Auto-scroll Speed Control

**User Story**: As a musician playing along, I want to set the auto-scroll speed so the song scrolls at my reading pace.

**Why P2**: Highly requested feature for hands-free playing.

**Acceptance Criteria**:

1. WHEN the user adjusts the auto-scroll speed control THEN the system SHALL update the automatic vertical scrolling rate of the song content.

**Independent Test**: Adjust the speed control and observe the scroll speed changing on the song lyrics/chords page.

---

## Edge Cases

- WHEN the user transposes the song to a key that naturally uses flats/sharps THEN the system SHALL still respect the explicit "Usar Bb" and "Usar Eb" overrides if enabled.

---

## Requirement Traceability

| Requirement ID | Story       | Phase  | Status  |
| -------------- | ----------- | ------ | ------- |
| PREF-01        | P1: Menu UI | Execute | Verified |
| PREF-02        | P1: Enharmonics | Execute | Verified |
| PREF-03        | P2: Auto-scroll | Execute | Verified |

---

## Success Criteria

- [ ] Dropdown menu smoothly opens/closes from the designated button.
- [ ] Toggling "Usar Bb" accurately swaps A# and Bb in real-time, including transpositions.
- [ ] Toggling "Usar Eb" accurately swaps D# and Eb in real-time, including transpositions.
- [ ] Auto-scroll speed can be adjusted effectively from the menu.
