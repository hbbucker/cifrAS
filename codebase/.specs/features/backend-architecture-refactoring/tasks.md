# Backend Architecture Refactoring Tasks

**Design**: `.specs/features/backend-architecture-refactoring/spec.md`
**Status**: Draft

---

## Execution Plan

### Phase 1: Package Reorganization (Parallel OK)

Restructure the physical folders for each module to match the new architecture (creating `model`, `infra/persistence/repository`, and `application/usecase`), without changing the actual class logic yet.

```
T1 [P]
T2 [P]
T3 [P]
T4 [P]
T5 [P]
```

### Phase 2: Core Refactoring (Parallel OK)

Extract logic from Services into Application Use Cases and Domain Models, then update the Resources. Each module can be refactored independently.

```
T2 ─→ T6 ─→ T7
T3 ─→ T8 ─→ T9
T4 ─→ T10 ─→ T11
T5 ─→ T12 ─→ T13
```

---

## Task Breakdown

### T1: Restructure Shared Package [P]

**What**: Reorganize the `shared` package to isolate exceptions, configurations, security, and utils into their respective sub-packages.
**Where**: `src/main/java/br/com/cifras/shared/`
**Depends on**: None
**Reuses**: Existing classes
**Requirement**: ARCH-01

**Tools**:
- MCP: `filesystem`
- Skill: NONE

**Done when**:
- [ ] Directory structure matches architecture guidelines for `shared`.
- [ ] Imports are updated project-wide.
- [ ] Gate check passes: `./mvnw clean compile`

**Tests**: none
**Gate**: build

---

### T2: Restructure Song Package [P]

**What**: Rename `domain` to `model`, move `repository` to `infra/persistence/repository`, and create `application/usecase` for the Song module.
**Where**: `src/main/java/br/com/cifras/song/`
**Depends on**: None
**Reuses**: Existing classes
**Requirement**: ARCH-01

**Tools**:
- MCP: `filesystem`
- Skill: NONE

**Done when**:
- [ ] Directories are renamed and classes moved.
- [ ] Imports are updated project-wide.
- [ ] Gate check passes: `./mvnw clean compile`

**Tests**: none
**Gate**: build

---

### T3: Restructure Playlist Package [P]

**What**: Rename `domain` to `model`, move `repository` to `infra/persistence/repository`, and create `application/usecase` for the Playlist module.
**Where**: `src/main/java/br/com/cifras/playlist/`
**Depends on**: None
**Reuses**: Existing classes
**Requirement**: ARCH-01

**Tools**:
- MCP: `filesystem`
- Skill: NONE

**Done when**:
- [ ] Directories are renamed and classes moved.
- [ ] Imports are updated project-wide.
- [ ] Gate check passes: `./mvnw clean compile`

**Tests**: none
**Gate**: build

---

### T4: Restructure Group Package [P]

**What**: Rename `domain` to `model`, move `repository` to `infra/persistence/repository`, and create `application/usecase` for the Group module.
**Where**: `src/main/java/br/com/cifras/group/`
**Depends on**: None
**Reuses**: Existing classes
**Requirement**: ARCH-01

**Tools**:
- MCP: `filesystem`
- Skill: NONE

**Done when**:
- [ ] Directories are renamed and classes moved.
- [ ] Imports are updated project-wide.
- [ ] Gate check passes: `./mvnw clean compile`

**Tests**: none
**Gate**: build

---

### T5: Restructure Auth & User Packages [P]

**What**: Rename `domain` to `model` and create `application/usecase` for both Auth and User modules.
**Where**: `src/main/java/br/com/cifras/auth/` and `src/main/java/br/com/cifras/user/`
**Depends on**: None
**Reuses**: Existing classes
**Requirement**: ARCH-01

**Tools**:
- MCP: `filesystem`
- Skill: NONE

**Done when**:
- [ ] Directories are renamed and classes moved.
- [ ] Imports are updated project-wide.
- [ ] Gate check passes: `./mvnw clean compile`

**Tests**: none
**Gate**: build

---

### T6: Extract Song Use Cases & Domain Logic

**What**: Extract methods from `SongService` into specific Use Case classes (e.g., `SaveSongUseCase`, `ListSongsUseCase`) and push any business validations into the `Song` entity. Delete `SongService`.
**Where**: `src/main/java/br/com/cifras/song/application/usecase/` and `src/main/java/br/com/cifras/song/model/Song.java`
**Depends on**: T2
**Reuses**: Logic from `SongService`
**Requirement**: ARCH-02, ARCH-03

**Tools**:
- MCP: `filesystem`
- Skill: NONE

**Done when**:
- [ ] Use Cases are created and annotated with `@ApplicationScoped`.
- [ ] Business logic (invariants, checks) is encapsulated in the `Song` entity.
- [ ] `SongService.java` is deleted.
- [ ] Gate check passes: `./mvnw test`
- [ ] Test count: >0 tests pass

**Tests**: unit
**Gate**: quick

---

### T7: Update Song Resource

**What**: Refactor `SongResource` to inject and call the new Use Cases instead of the old `SongService`.
**Where**: `src/main/java/br/com/cifras/song/resource/SongResource.java`
**Depends on**: T6
**Reuses**: N/A
**Requirement**: ARCH-04

**Tools**:
- MCP: `filesystem`
- Skill: NONE

**Done when**:
- [ ] Resource methods call Use Cases directly.
- [ ] No business logic exists in the resource.
- [ ] Gate check passes: `./mvnw test`
- [ ] Test count: >0 tests pass

**Tests**: unit
**Gate**: quick

---

### T8: Extract Playlist Use Cases & Domain Logic

**What**: Extract methods from `PlaylistService` into specific Use Case classes and push any business validations into the `Playlist` entity. Delete `PlaylistService`.
**Where**: `src/main/java/br/com/cifras/playlist/application/usecase/` and `src/main/java/br/com/cifras/playlist/model/Playlist.java`
**Depends on**: T3
**Reuses**: Logic from `PlaylistService`
**Requirement**: ARCH-02, ARCH-03

**Tools**:
- MCP: `filesystem`
- Skill: NONE

**Done when**:
- [ ] Use Cases are created and handle transactions.
- [ ] Business logic is inside `Playlist`.
- [ ] `PlaylistService.java` is deleted.
- [ ] Gate check passes: `./mvnw test`
- [ ] Test count: >0 tests pass

**Tests**: unit
**Gate**: quick

---

### T9: Update Playlist Resource

**What**: Refactor `PlaylistResource` to use the new Use Cases instead of the old `PlaylistService`.
**Where**: `src/main/java/br/com/cifras/playlist/resource/PlaylistResource.java`
**Depends on**: T8
**Reuses**: N/A
**Requirement**: ARCH-04

**Tools**:
- MCP: `filesystem`
- Skill: NONE

**Done when**:
- [ ] Resource methods call Use Cases directly.
- [ ] Gate check passes: `./mvnw test`
- [ ] Test count: >0 tests pass

**Tests**: unit
**Gate**: quick

---

### T10: Extract Group Use Cases & Domain Logic

**What**: Extract methods from `GroupService` into specific Use Case classes and push validations into `Group` / `Invitation` entities. Delete `GroupService`.
**Where**: `src/main/java/br/com/cifras/group/application/usecase/` and `src/main/java/br/com/cifras/group/model/`
**Depends on**: T4
**Reuses**: Logic from `GroupService`
**Requirement**: ARCH-02, ARCH-03

**Tools**:
- MCP: `filesystem`
- Skill: NONE

**Done when**:
- [ ] Use Cases are created.
- [ ] Domain logic is inside models.
- [ ] `GroupService.java` is deleted.
- [ ] Gate check passes: `./mvnw test`
- [ ] Test count: >0 tests pass

**Tests**: unit
**Gate**: quick

---

### T11: Update Group Resources

**What**: Refactor `GroupResource` and `InvitationResource` to use the new Use Cases.
**Where**: `src/main/java/br/com/cifras/group/resource/`
**Depends on**: T10
**Reuses**: N/A
**Requirement**: ARCH-04

**Tools**:
- MCP: `filesystem`
- Skill: NONE

**Done when**:
- [ ] Resources delegate to Use Cases.
- [ ] Gate check passes: `./mvnw test`
- [ ] Test count: >0 tests pass

**Tests**: unit
**Gate**: quick

---

### T12: Extract Auth & User Use Cases

**What**: Extract methods from `AuthService` into Use Cases (e.g., `LoginUseCase`, `UpdatePreferencesUseCase`).
**Where**: `src/main/java/br/com/cifras/auth/application/usecase/` and `src/main/java/br/com/cifras/user/application/usecase/`
**Depends on**: T5
**Reuses**: Logic from `AuthService`
**Requirement**: ARCH-02, ARCH-03

**Tools**:
- MCP: `filesystem`
- Skill: NONE

**Done when**:
- [ ] Use Cases are created.
- [ ] `AuthService.java` is deleted.
- [ ] Gate check passes: `./mvnw test`
- [ ] Test count: >0 tests pass

**Tests**: unit
**Gate**: quick

---

### T13: Update Auth & User Resources

**What**: Refactor `AuthResource` and `UserPreferenceResource` to use the new Use Cases.
**Where**: `src/main/java/br/com/cifras/auth/resource/AuthResource.java` and `src/main/java/br/com/cifras/user/resource/UserPreferenceResource.java`
**Depends on**: T12
**Reuses**: N/A
**Requirement**: ARCH-04

**Tools**:
- MCP: `filesystem`
- Skill: NONE

**Done when**:
- [ ] Resources delegate to Use Cases.
- [ ] Gate check passes: `./mvnw test`
- [ ] Test count: >0 tests pass

**Tests**: unit
**Gate**: quick

---

## Validation Checks

### Task Granularity Check

| Task | Scope | Status |
| --- | --- | --- |
| T1-T5 | Directory reorganizations | ✅ Granular |
| T6, T8, T10, T12 | Refactoring 1 Service to UseCases | ✅ Granular |
| T7, T9, T11, T13 | Updating 1-2 Resource classes | ✅ Granular |

### Diagram-Definition Cross-Check

| Task | Depends On (body) | Diagram Shows | Status |
| --- | --- | --- | --- |
| T1-T5 | None | None | ✅ Match |
| T6 | T2 | T2 -> T6 | ✅ Match |
| T7 | T6 | T6 -> T7 | ✅ Match |
| T8 | T3 | T3 -> T8 | ✅ Match |
| T9 | T8 | T8 -> T9 | ✅ Match |
| T10 | T4 | T4 -> T10 | ✅ Match |
| T11 | T10 | T10 -> T11 | ✅ Match |
| T12 | T5 | T5 -> T12 | ✅ Match |
| T13 | T12 | T12 -> T13 | ✅ Match |

### Test Co-location Validation

| Task | Code Layer Created/Modified | Matrix Requires | Task Says | Status |
| --- | --- | --- | --- | --- |
| T1-T5 | Directory Reorganization | none | none | ✅ OK |
| T6, T8, T10, T12 | Application / Domain | unit | unit | ✅ OK |
| T7, T9, T11, T13 | Resource | unit | unit | ✅ OK |
