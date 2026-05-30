# Song Edit Button Specification

## Problem Statement

Users currently viewing a song on the `/song/{id}` screen need a quick and intuitive way to edit the song. An edit button is required in the song's action bar that not only initiates the edit flow but also preserves any transposition context when opening the edit screen.

## Goals

- [ ] Add an edit button to the `/song/{id}` screen in the top-left corner, positioned between the Transpose and Theater Mode controls.
- [ ] Ensure that clicking the edit button opens the song editing screen.
- [ ] Maintain the applied transposition (if any) when opening the edit screen, so the user edits the song in the currently selected key.

## Out of Scope

Explicitly excluded. Documented to prevent scope creep.

| Feature | Reason |
| --- | --- |
| Creating the edit screen | The edit screen is assumed to exist; this feature just links to it with the correct context. |
| Implementing the actual save logic | Handled by the existing edit functionalities. |

---

## User Stories

### P1: Edit Button Navigation ⭐ MVP

**User Story**: As a user viewing a song, I want an edit button between the transpose and theater mode controls so that I can easily navigate to the edit screen.

**Why P1**: Core requirement to initiate the edit flow from the song view.

**Acceptance Criteria**:

1. WHEN the user is on the `/song/{id}` screen THEN the system SHALL display an edit button in the top-left corner (between transpose and theater mode).
2. WHEN the user clicks the edit button THEN the system SHALL navigate to the edit screen for that specific song.

**Independent Test**: Can demo by opening a song, clicking the edit button, and verifying the edit screen loads for the correct song.

---

### P1: Transpose Context Preservation ⭐ MVP

**User Story**: As a user who has transposed a song, I want the edit screen to open with the transposed key applied so that I don't have to manually adjust the key before editing.

**Why P1**: Ensures a seamless experience and fulfills the core requirement of preserving context between view and edit modes.

**Acceptance Criteria**:

1. WHEN a transposition is applied and the edit button is clicked THEN the system SHALL pass the transposed key to the edit screen.
2. WHEN no transposition is applied and the edit button is clicked THEN the system SHALL pass the original key to the edit screen.

**Independent Test**: Can demo by changing the key via transpose, clicking edit, and verifying the edit screen displays the song in the newly selected transposed key.

---

## Edge Cases

- WHEN the user has no permissions to edit the song THEN the system SHALL hide the edit button or show an appropriate feedback message (if permission checks are applicable).
- WHEN the transpose state is rapidly changed before clicking edit THEN the system SHALL pass the most recently settled transpose value.

---

## Requirement Traceability

Each requirement gets a unique ID for tracking across design, tasks, and validation.

| Requirement ID | Story | Phase | Status |
| --- | --- | --- | --- |
| SONGEDIT-01 | P1: Edit Button Navigation | Execute | Implemented |
| SONGEDIT-02 | P1: Transpose Context Preservation | Execute | Implemented |

**Coverage:** 2 total, 0 mapped to tasks, 0 unmapped ⚠️

---

## Success Criteria

How we know the feature is successful:

- [ ] The edit button is visually present in the specified location on the song view page.
- [ ] Clicking the button navigates to the correct edit URL with the correct transposition context applied.
