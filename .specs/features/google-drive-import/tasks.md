# Google Drive Import Tasks

**Spec**: `.specs/features/google-drive-import/spec.md`
**Design**: `.specs/features/google-drive-import/design.md`

---

## Task Breakdown

### 1. Database & Domain Foundation
- **What**: Create the `user_integrations` table and domain layer.
- **Where**: `src/main/resources/db/migration/` and `src/main/java/br/com/cifras/user/`
- **Depends on**: None
- **Reuses**: Standard Panache repository patterns.
- **Done when**: Flyway migration runs successfully; domain model, entity, and repository are implemented with tests.
- **Gate**: `mvn clean test -Dtest=UserIntegrationRepositoryTest`

### 2. Backend Dependencies & Drive Service
- **What**: Add Google API and Apache POI dependencies. Implement `GoogleDriveService`.
- **Where**: `pom.xml`, `src/main/java/br/com/cifras/integration/`
- **Depends on**: Task 1
- **Reuses**: None
- **Done when**: Backend can generate OAuth URLs, exchange codes, list Drive files, and extract text from mocked .doc files.
- **Gate**: `mvn clean test -Dtest=GoogleDriveServiceTest`

### 3. Backend REST Endpoints
- **What**: Expose `GoogleDriveResource` for the frontend.
- **Where**: `src/main/java/br/com/cifras/integration/resource/GoogleDriveResource.java`
- **Depends on**: Task 2
- **Reuses**: Global exception handlers and JWT auth context.
- **Done when**: Endpoints return 200 OK and correct DTOs for authorized users.
- **Gate**: `mvn clean test -Dtest=GoogleDriveResourceTest` (REST Assured)

### 4. Frontend API Client & Auth UI
- **What**: Create axios client for Google endpoints and add the "Connect Drive" UI.
- **Where**: `src/main/webui/src/api/googleDrive.ts`, `src/main/webui/src/pages/IntegrationsSettingsPage.tsx`
- **Depends on**: Task 3
- **Reuses**: Tailwind UI components, `AuthContext`.
- **Done when**: User can click "Connect", authorize via Google, and see their connected email in the settings page.
- **Gate**: `npm run lint` and manual browser check.

### 5. Frontend Drive Picker & Import Flow
- **What**: Build the `DriveFilePicker` modal, fetch files, and pipe extracted text to `lyricsParser`.
- **Where**: `src/main/webui/src/components/DriveFilePicker.tsx`, `src/main/webui/src/pages/SongFormPage.tsx`
- **Depends on**: Task 4
- **Reuses**: `lyricsParser.ts` for converting raw text to structured JSON.
- **Done when**: User can open picker, select a `.doc`, see the text parsed into chords, and save the new song.
- **Gate**: Playwright E2E test for the import flow.

---

## Parallel Execution Plan

- Task 1 -> Task 2 -> Task 3 (Backend sequence)
- Task 4 -> Task 5 (Frontend sequence, can start UI mocking in parallel with Task 2/3)
