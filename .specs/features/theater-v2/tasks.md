# Theater Mode v2 Tasks

**Design**: `.specs/features/theater-v2/design.md`
**Status**: Draft

---

## Execution Plan

### Phase 1: Backend Foundation (Sequential)

Tasks that setup the database layer and backend APIs.

```
T1 → T2
```

### Phase 2: Frontend Implementation (Parallel OK)

Tasks that add frontend hooks and visual components.

```
     ┌→ T4 ┐
T2 ──┼     ├─→ T5
     └→ T3 ┘
```

---

## Task Breakdown

### T1: [Backend] Create PerformanceSession Entity & Repository

**What**: Create the JPA Entity mapped to `performance_sessions` and its Panache Repository.
**Where**: `src/main/java/br/com/cifras/performance/infra/`
**Depends on**: None
**Reuses**: `PanacheRepository` existing patterns
**Requirement**: THEATER-01

**Tools**:
- MCP: `filesystem`
- Skill: NONE

**Done when**:
- [x] `PerformanceSessionEntity` created mapping `userId` as @Id.
- [x] `PerformanceSessionRepository` created.
- [x] Flyway/Supabase migration SQL created (if applicable in project structure).
- [x] Gate check passes: `./mvnw test`
- [x] Test count: 0 tests created here (Tested in T2 Integration tests).

**Tests**: none
**Gate**: quick

---

### T2: [Backend] Create PerformanceSession Service & Resource

**What**: Implement the REST API (GET, PATCH, DELETE) for session state.
**Where**: `src/main/java/br/com/cifras/performance/` (resource/service/dto)
**Depends on**: T1
**Reuses**: Existing `SecurityIdentity` for user auth extraction.
**Requirement**: THEATER-01

**Tools**:
- MCP: `filesystem`
- Skill: NONE

**Done when**:
- [x] `PATCH /api/performance/sessions/active` implemented (UPSERT logic).
- [x] `GET /api/performance/sessions/active` implemented.
- [x] Integration tests written using REST Assured and Testcontainers.
- [x] Gate check passes: `./mvnw test`
- [x] Test count: 2 tests pass (GET returns session, PATCH updates session).

**Tests**: integration
**Gate**: full

---

### T3: [Frontend] Create usePerformanceSession Hook [P]

**What**: Create React Hook for interacting with the backend session API.
**Where**: `src/main/webui/src/hooks/usePerformanceSession.ts`
**Depends on**: T2
**Reuses**: `apiClient.ts`
**Requirement**: THEATER-01

**Tools**:
- MCP: `filesystem`
- Skill: NONE

**Done when**:
- [ ] Returns `activeSession` state.
- [ ] Exposes a `saveProgress` function that calls the PATCH endpoint (debounced).
- [ ] Handles offline/error suppression gracefully.
- [ ] Gate check passes: `npm run lint` in webui.

**Tests**: none (Tested via E2E in T5)
**Gate**: quick

---

### T4: [Frontend] Add Lock Mode & Gestures to Theater [P]

**What**: Add UI components and native DOM touch listeners for gestures and lock mode.
**Where**: `src/main/webui/src/pages/TheaterMode.tsx` & `TheaterControls.tsx`
**Depends on**: None (UI only)
**Reuses**: Existing SVG icons and UI patterns.
**Requirement**: THEATER-02, THEATER-03

**Tools**:
- MCP: `filesystem`
- Skill: NONE

**Done when**:
- [ ] Swipe left/right changes songs.
- [ ] Lock icon added; long press activates/deactivates lock mode.
- [ ] Buttons are hidden/disabled when locked.
- [ ] Gate check passes: `npm run lint`

**Tests**: none (Tested via E2E in T5)
**Gate**: quick

---

### T5: [Frontend] Integrate Session Prompt and E2E Tests

**What**: Tie the hook into `TheaterMode`, display the "Resume?" prompt, and write the E2E tests.
**Where**: `src/main/webui/src/pages/TheaterMode.tsx` & `src/main/webui/e2e/`
**Depends on**: T3, T4
**Reuses**: React state and UI Modals/Dialogs.
**Requirement**: THEATER-01

**Tools**:
- MCP: `filesystem`
- Skill: NONE

**Done when**:
- [ ] Mounting `TheaterMode` triggers a prompt if an active session exists that is different from local state.
- [ ] Playwright E2E test written validating the resume flow and the lock mode.
- [ ] Gate check passes: `cd src/main/webui && npx playwright test`
- [ ] Test count: 2 tests pass (Playwright).

**Tests**: e2e
**Gate**: full

---

## Diagram-Definition Cross-Check

| Task | Depends On (task body) | Diagram Shows | Status |
| ---- | ---------------------- | ------------- | ------ |
| T1   | None                   | None          | ✅ Match |
| T2   | T1                     | T1            | ✅ Match |
| T3   | T2                     | T2            | ✅ Match |
| T4   | None                   | None (Or T2)  | ✅ Match |
| T5   | T3, T4                 | T3, T4        | ✅ Match |

## Test Co-location Validation

| Task | Code Layer Created/Modified | Matrix Requires | Task Says | Status |
| ---- | --------------------------- | --------------- | --------- | ------ |
| T1   | Backend Entity              | none            | none      | ✅ OK |
| T2   | Backend Resource            | integration     | integration | ✅ OK |
| T3   | Frontend Hook               | none            | none      | ✅ OK |
| T4   | Frontend UI                 | none            | none      | ✅ OK |
| T5   | Frontend Integration        | e2e             | e2e       | ✅ OK |
