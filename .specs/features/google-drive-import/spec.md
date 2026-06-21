# Google Drive Import Specification

## Problem Statement

Users often have their chords stored in `.doc` or `.docx` files in their Google Drive accounts, which may be different from the email they used to sign up (e.g., via Supabase). The platform currently lacks a seamless way to import these existing documents into the structured CifrAS JSON format without manual copy-pasting. We need an integration to link a Google account exclusively for importing `.doc` files from Drive.

## Goals

- [ ] Users can connect a Google Drive account (independent of their login session) via OAuth.
- [ ] Users can browse or pick `.doc` / `.docx` files from their connected Google Drive.
- [ ] Users can select files to automatically import and parse them into the CifrAS structured JSON format.

## Out of Scope

| Feature     | Reason         |
| ----------- | -------------- |
| Two-way Sync | MVP is one-way import only. Exporting changes back to Google Drive is excluded. |
| PDF or Image Parsing | `.doc` and `.docx` (or plain `.txt`) are the targets for MVP; PDF/OCR parsing is too complex for now. |

---

## User Stories

### P1: Link Google Drive Account ⭐ MVP

**User Story**: As a user, I want to connect a Google Drive account (distinct from my login account) so that I can grant read access to my chord files.

**Why P1**: Core enabler for the import feature.

**Acceptance Criteria**:

1. WHEN the user clicks "Connect Google Drive" THEN system SHALL redirect to the Google OAuth flow requesting Drive read scopes.
2. WHEN the user completes the flow THEN system SHALL securely store the integration token and show "Connected as [email]" in the UI.

**Independent Test**: The user can see their Google Drive account linked in their settings or integrations page.

---

### P1: Import `.doc` files ⭐ MVP

**User Story**: As a user, I want to select a `.doc` file from my connected Drive and import it so that I don't have to manually type the chords.

**Why P1**: This is the main value proposition of the feature.

**Acceptance Criteria**:

1. WHEN the user clicks "Import from Drive" THEN system SHALL display a file picker with their `.doc`/`.docx` files.
2. WHEN the user selects a file THEN system SHALL download the file, extract the text, and parse it into the CifrAS structured format.
3. WHEN the import succeeds THEN system SHALL redirect the user to the edit/view page of the newly created song.

**Independent Test**: A `.doc` file with a known chord structure can be successfully imported and displayed in the app.

---

## Edge Cases

- WHEN the Google Drive token expires THEN system SHALL prompt the user to re-authenticate or transparently refresh if offline access is granted.
- WHEN the `.doc` file contains unsupported formatting or no parseable chords THEN system SHALL import it as plain text and notify the user to format it manually.
- WHEN the user revokes access from their Google Account THEN system SHALL handle the unauthorized error gracefully and update the integration status.

---

## Requirement Traceability

| Requirement ID | Story       | Phase  | Status  |
| -------------- | ----------- | ------ | ------- |
| GDRIVE-01      | P1: Link Google Drive Account | Design | Pending |
| GDRIVE-02      | P1: Import `.doc` files       | Design | Pending |

**Coverage:** 2 total, 0 mapped to tasks, 2 unmapped ⚠️

---

## Success Criteria

How we know the feature is successful:

- [ ] User can successfully authenticate with Google Drive independently of their CifrAS login.
- [ ] User can import a `.doc` file and see the result in the CifrAS viewer.
