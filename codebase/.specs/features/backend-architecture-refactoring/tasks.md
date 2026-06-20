# Backend Architecture Refactoring Tasks

**Design**: `.specs/features/backend-architecture-refactoring/spec.md`
**Status**: Draft

---

## Execution Plan

### Phase 1: Package Reorganization (Parallel OK)
**[COMPLETED]**
Restructure the physical folders for each module to match the new architecture.

```
T1 [P] - T5 [P]
```

### Phase 2: Domain vs Entity Separation (Parallel OK)

Separate pure POJOs (Domain Models) from JPA Entities (Persistence). Create `Entity` classes in `infra/persistence/entity` and `Mappers` in `infra/persistence/mapper`.

```
T6 [P] (Song Model/Entity)
T7 [P] (Playlist Model/Entity)
T8 [P] (Group Model/Entity)
T9 [P] (Auth/User Model/Entity)
```

### Phase 3: Core Refactoring (Parallel OK)

Extract logic from Services into Application Use Cases, wire them with the new Mappers/Entities, and update the Resources.

```
T6 ─→ T10 (Song UseCases) ─→ T11 (Song Resource)
T7 ─→ T12 (Playlist UseCases) ─→ T13 (Playlist Resource)
T8 ─→ T14 (Group UseCases) ─→ T15 (Group Resource)
T9 ─→ T16 (Auth/User UseCases) ─→ T17 (Auth/User Resource)
```

---

## Task Breakdown

*(Tasks T1-T5 omitted for brevity as they are already completed)*

### T6: Separate Song Model and Entity [P]

**What**: Remove Panache/JPA annotations from `Song` model. Create `SongEntity` in `infra/persistence/entity` and `SongMapper` in `infra/persistence/mapper`. Update `SongRepository` to use `SongEntity`.
**Where**: `src/main/java/br/com/cifras/song/`
**Depends on**: T2 (Completed)
**Reuses**: Existing JPA mappings.
**Requirement**: ARCH-05

**Tools**:
- MCP: `filesystem`
- Skill: NONE

**Done when**:
- [ ] `Song` class has no JPA annotations.
- [ ] `SongEntity` correctly maps to the database.
- [ ] `SongMapper` translates between them.
- [ ] Gate check passes: `./mvnw test`
- [ ] Test count: >0 tests pass

**Tests**: unit
**Gate**: quick

---

### T7: Separate Playlist Model and Entity [P]

**What**: Remove Panache/JPA annotations from `Playlist` model. Create `PlaylistEntity` and `PlaylistMapper`. Update `PlaylistRepository`.
**Where**: `src/main/java/br/com/cifras/playlist/`
**Depends on**: T3 (Completed)
**Reuses**: Existing JPA mappings.
**Requirement**: ARCH-05

**Tools**:
- MCP: `filesystem`
- Skill: NONE

**Done when**:
- [ ] `Playlist` class has no JPA annotations.
- [ ] `PlaylistEntity` correctly maps to the database.
- [ ] `PlaylistMapper` translates between them.
- [ ] Gate check passes: `./mvnw test`
- [ ] Test count: >0 tests pass

**Tests**: unit
**Gate**: quick

---

### T8: Separate Group Model and Entity [P]

**What**: Remove JPA annotations from `Group` and `GroupInvitation`. Create Entities and Mappers in `infra`.
**Where**: `src/main/java/br/com/cifras/group/`
**Depends on**: T4 (Completed)
**Reuses**: Existing JPA mappings.
**Requirement**: ARCH-05

**Tools**:
- MCP: `filesystem`
- Skill: NONE

**Done when**:
- [ ] Group models have no JPA annotations.
- [ ] Entities and Mappers are created.
- [ ] Gate check passes: `./mvnw test`
- [ ] Test count: >0 tests pass

**Tests**: unit
**Gate**: quick

---

### T9: Separate Auth/User Model and Entity [P]

**What**: Remove JPA annotations from `UserPreference`. Create `UserPreferenceEntity` and Mapper.
**Where**: `src/main/java/br/com/cifras/user/`
**Depends on**: T5 (Completed)
**Reuses**: Existing JPA mappings.
**Requirement**: ARCH-05

**Tools**:
- MCP: `filesystem`
- Skill: NONE

**Done when**:
- [ ] `UserPreference` has no JPA annotations.
- [ ] Entity and Mapper created.
- [ ] Gate check passes: `./mvnw test`
- [ ] Test count: >0 tests pass

**Tests**: unit
**Gate**: quick

---

### T10: Extract Song Use Cases

**What**: Extract methods from `SongService` into Use Case classes. Delete `SongService`. Wire repositories via Mappers.
**Where**: `src/main/java/br/com/cifras/song/application/usecase/`
**Depends on**: T6
**Reuses**: Logic from `SongService`
**Requirement**: ARCH-02, ARCH-03

**Tools**:
- MCP: `filesystem`
- Skill: NONE

**Done when**:
- [ ] Use Cases orchestrate the flow.
- [ ] `SongService.java` is deleted.
- [ ] Gate check passes: `./mvnw test`
- [ ] Test count: >0 tests pass

**Tests**: unit
**Gate**: quick

---

### T11: Update Song Resource

**What**: Refactor `SongResource` to call Use Cases.
**Where**: `src/main/java/br/com/cifras/song/resource/SongResource.java`
**Depends on**: T10
**Reuses**: N/A
**Requirement**: ARCH-04

**Done when**:
- [ ] Resource methods call Use Cases directly.
- [ ] Gate check passes: `./mvnw test`

**Tests**: unit
**Gate**: quick

---

### T12: Extract Playlist Use Cases

**What**: Extract Use Cases from `PlaylistService`. Delete `PlaylistService`. Use Mappers.
**Where**: `src/main/java/br/com/cifras/playlist/application/usecase/`
**Depends on**: T7
**Reuses**: Logic from `PlaylistService`
**Requirement**: ARCH-02, ARCH-03

**Done when**:
- [ ] Use Cases handle flow.
- [ ] `PlaylistService.java` is deleted.
- [ ] Gate check passes: `./mvnw test`

**Tests**: unit
**Gate**: quick

---

### T13: Update Playlist Resource

**What**: Refactor `PlaylistResource` to use Use Cases.
**Where**: `src/main/java/br/com/cifras/playlist/resource/PlaylistResource.java`
**Depends on**: T12
**Requirement**: ARCH-04

**Done when**:
- [ ] Resource methods call Use Cases directly.
- [ ] Gate check passes: `./mvnw test`

**Tests**: unit
**Gate**: quick

---

### T14: Extract Group Use Cases

**What**: Extract Use Cases from `GroupService`. Delete `GroupService`. Use Mappers.
**Where**: `src/main/java/br/com/cifras/group/application/usecase/`
**Depends on**: T8
**Requirement**: ARCH-02, ARCH-03

**Done when**:
- [ ] Use Cases handle flow.
- [ ] `GroupService.java` deleted.
- [ ] Gate check passes: `./mvnw test`

**Tests**: unit
**Gate**: quick

---

### T15: Update Group Resources

**What**: Refactor `GroupResource` and `InvitationResource`.
**Where**: `src/main/java/br/com/cifras/group/resource/`
**Depends on**: T14
**Requirement**: ARCH-04

**Done when**:
- [ ] Resources delegate to Use Cases.
- [ ] Gate check passes: `./mvnw test`

**Tests**: unit
**Gate**: quick

---

### T16: Extract Auth & User Use Cases

**What**: Extract Use Cases from `AuthService`.
**Where**: `src/main/java/br/com/cifras/auth/application/usecase/`
**Depends on**: T9
**Requirement**: ARCH-02, ARCH-03

**Done when**:
- [ ] Use Cases handle flow.
- [ ] `AuthService.java` deleted.
- [ ] Gate check passes: `./mvnw test`

**Tests**: unit
**Gate**: quick

---

### T17: Update Auth & User Resources

**What**: Refactor `AuthResource` and `UserPreferenceResource`.
**Where**: `src/main/java/br/com/cifras/auth/resource/AuthResource.java`
**Depends on**: T16
**Requirement**: ARCH-04

**Done when**:
- [ ] Resources delegate to Use Cases.
- [ ] Gate check passes: `./mvnw test`

**Tests**: unit
**Gate**: quick

---

## Validation Checks

### Diagram-Definition Cross-Check

| Task | Depends On (body) | Diagram Shows | Status |
| --- | --- | --- | --- |
| T6-T9 | T2-T5 (Completed) | None | ✅ Match |
| T10 | T6 | T6 -> T10 | ✅ Match |
| T11 | T10 | T10 -> T11 | ✅ Match |
| T12 | T7 | T7 -> T12 | ✅ Match |
| T13 | T12 | T12 -> T13 | ✅ Match |
| T14 | T8 | T8 -> T14 | ✅ Match |
| T15 | T14 | T14 -> T15 | ✅ Match |
| T16 | T9 | T9 -> T16 | ✅ Match |
| T17 | T16 | T16 -> T17 | ✅ Match |

### Test Co-location Validation

| Task | Code Layer Created/Modified | Matrix Requires | Task Says | Status |
| --- | --- | --- | --- | --- |
| T6-T9 | Model / Entity | unit | unit | ✅ OK |
| T10, T12, T14, T16 | Application | unit | unit | ✅ OK |
| T11, T13, T15, T17 | Resource | unit | unit | ✅ OK |
