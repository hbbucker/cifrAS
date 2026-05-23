# Backend Tasks

**Design**: `.specs/features/backend/design.md`
**Status**: Draft

---

## Execution Plan

### Phase 1: Foundation (Sequential)
Setup the base Quarkus project, database dependencies (PostgreSQL + Agroal connection pool), Supabase JWT security filters, and the global exception mapping mechanism.

```
T1 ──→ T2 ──→ T3 ──→ T4
```

### Phase 2: Transposition Engine (TDD - Sequential)
Implement the core domain model and value objects for chord sheets, followed by the highly critical `TranspositionService`. Test-Driven Development (TDD) is strictly enforced here: unit tests covering all 12 keys, compound chords, and enharmonics are created *before* the business logic.

```
Phase 1 complete, then:
  T5 ──→ T6
```

### Phase 3: Core API Services & Resources (Parallel OK)
Build Auth proxying to Supabase, and implement CRUD resources for Songs and Playlists. Each controller and service must have its JUnit integration tests written and failing prior to implementation.

```
Phase 2 complete, then:
    ├── T7 [P]  (AuthProxy / Authentication)
    ├── T8 [P]  (Song Database & CRUD Service)
    ├── T9 [P]  (Song REST Endpoints)
    ├── T10 [P] (Song Transposition API)
    ├── T11 [P] (Playlist & PlaylistSong Service)
    └── T12 [P] (Playlist REST Endpoints & Reordering)
```

### Phase 4: Collaboration & Access Control (Sequential)
Setup groups and collaborative playlists. Enforce access control checks where only members/owners can modify group resources.

```
Phase 3 complete, then:
  T13 ──→ T14
```

### Phase 5: P2 & P3 Features (Sequential)
Develop advanced search capabilities, user-preferred key persistence, and theater mode session states.

```
Phase 4 complete, then:
  T15 ──→ T16 ──→ T17
```

---

## Task Breakdown

### Phase 1: Foundation

#### T1: [Project Setup (Quarkus)]
**What**: Initialize a Quarkus 3.x Java 21 project with standard Maven layout, incorporating Resteasy Reactive Jackson, Hibernate ORM with Panache, JDBC PostgreSQL, and MicroProfile JWT dependencies.
**Where**: `/backend` or `/` (according to repository decision, root-level initialization)
**Depends on**: None
**Reuses**: None
**Requirement**: None (Infrastructure)
**Tools**:
- MCP: `filesystem`
- Skill: NONE
**Done when**:
- [ ] Quarkus project bootstrapped with Java 21 and Maven
- [ ] `pom.xml` contains: `quarkus-resteasy-reactive-jackson`, `quarkus-hibernate-orm-panache`, `quarkus-jdbc-postgresql`, `quarkus-smallrye-jwt`
- [ ] Basic skeleton builds successfully
- [ ] Gate check passes: `./mvnw clean compile` (or `rtk ./mvnw clean compile`)
**Tests**: none
**Gate**: build

#### T2: [Database Configuration & Dev Services]
**What**: Configure PostgreSQL datasource in `application.properties` and enable Quarkus Dev Services for database autoconfiguration in test/dev modes.
**Where**: `src/main/resources/application.properties`
**Depends on**: T1
**Reuses**: None
**Requirement**: None (Infrastructure)
**Tools**:
- MCP: `filesystem`
- Skill: NONE
**Done when**:
- [ ] Datasource and Hibernate config added to `application.properties`
- [ ] Quarkus Dev Services for PostgreSQL verified working (spins up Testcontainers DB on dev/test execution)
- [ ] Soft delete database audit columns (`deletedAt`) configured default mappings
- [ ] Gate check passes: `./mvnw test-compile`
**Tests**: none
**Gate**: quick

#### T3: [Supabase JWT Validation & Filter]
**What**: Configure SmallRye JWT to point to Supabase JWKS endpoint and create `JwtValidationFilter` to extract `sub` claim (userId) and inject it into the security context.
**Where**: `src/main/resources/application.properties`, `src/main/java/br/com/cifras/shared/security/JwtValidationFilter.java`
**Depends on**: T1
**Reuses**: Design §84-85
**Requirement**: AUTH-02
**Tools**:
- MCP: `filesystem`
- Skill: NONE
**Done when**:
- [ ] JWT JWKS URL configuration added to `application.properties`
- [ ] `JwtValidationFilter` intercepts requests, extracts authorization header, and populates `SecurityIdentity`
- [ ] Unit/Integration tests verify that:
  - [ ] Requests without token are rejected with `401 Unauthorized` (on secured endpoints)
  - [ ] Expired/Invalid tokens return `401 Unauthorized` with body `{"error": "Token inválido ou expirado"}`
  - [ ] Valid tokens successfully inject user identity into request context
- [ ] Test count: 3 tests pass
**Tests**: integration
**Gate**: quick

#### T4: [Global Exception Mapper]
**What**: Implement global provider `GlobalExceptionMapper` that catches all domain and framework exceptions, logging 500s with unique UUID `traceId` and formatting response payloads as JSON.
**Where**: `src/main/java/br/com/cifras/shared/exception/GlobalExceptionMapper.java`
**Depends on**: T1
**Reuses**: Design §425-439
**Requirement**: None (Edge Cases)
**Tools**:
- MCP: `filesystem`
- Skill: NONE
**Done when**:
- [ ] `GlobalExceptionMapper` handles all `Throwable` instances
- [ ] Database error exceptions return `500 Internal error` with a unique `traceId` and stack trace gets logged (never sent in response)
- [ ] Standard validation exceptions return `400 Bad Request` containing specific field errors
- [ ] Domain exceptions (like `ForbiddenException`) return correct status codes (`403`)
- [ ] Unit tests verify mapping correctness for generic throwables, validation errors, and domain errors
- [ ] Test count: 3 tests pass
**Tests**: unit
**Gate**: quick

---

### Phase 2: Transposition Engine (TDD)

#### T5: [Transposition Engine Models (TDD)]
**What**: Write unit tests for chord representations and parse structures (e.g. sections, lines, chord positions), then develop domain classes `MusicalKey`, `EnharmonicConvention`, `LyricsStructure`, `Section`, `Line`, and `ChordPosition`.
**Where**: 
- Code: `src/main/java/br/com/cifras/song/domain/`
- Tests: `src/test/java/br/com/cifras/song/domain/`
**Depends on**: T4
**Reuses**: Design §243-257, §290-309
**Requirement**: SONG-04
**Tools**:
- MCP: `filesystem`
- Skill: NONE
**Done when**:
- [ ] **TDD Step**: Unit tests created first in `src/test/java/br/com/cifras/song/domain/` and fail/compile error initially
- [ ] Domain files compiled and verified:
  - [ ] `MusicalKey.parse(String)` extracts root note (e.g., "A#", "Bb", "C") and suffix (e.g., "m", "7", "m7", "add9")
  - [ ] Supports compound chords split by slash (e.g., "G/B")
  - [ ] Supports enharmonic conversions
- [ ] JSON serializer/deserializer mappings for `LyricsStructure` verified
- [ ] Unit tests assert 100% correctness of chord parsing, suffix preservation, and compound extraction
- [ ] Test count: 6 tests pass
**Tests**: unit
**Gate**: quick

#### T6: [Transposition Engine Core Service (TDD)]
**What**: Write extensive unit tests covering all 12 chromatically transposable tones, suffixes, compound chords, unknown chords, and enharmonic conventions. Then, implement the logic in `TranspositionService`.
**Where**:
- Code: `src/main/java/br/com/cifras/song/service/TranspositionService.java`
- Tests: `src/test/java/br/com/cifras/song/service/TranspositionServiceTest.java`
**Depends on**: T5
**Reuses**: Design §114-123, §369-394
**Requirement**: TRANSP-01
**Tools**:
- MCP: `filesystem`
- Skill: NONE
**Done when**:
- [ ] **TDD Step**: Over 15 test cases written in `TranspositionServiceTest` before class implementation, verifying transpositions (e.g., `Am` + 1 semitone = `A#m`, `C/E` - 2 semitones = `Bb/D` under default sharp convention)
- [ ] `TranspositionService` implemented
- [ ] Engine transposes roots and bass notes separately for compound chords (e.g. `F#/A#`)
- [ ] Unknown or malformed chords are bypassed safely and left unchanged without failing the request
- [ ] Suffixes are perfectly preserved
- [ ] Chromatic overflow wraps around 12 semitones
- [ ] All unit tests pass, achieving ≥ 90% branch coverage on transposition logic
- [ ] Test count: 15 tests pass
**Tests**: unit
**Gate**: quick

---

### Phase 3: Core API Services & Resources

#### T7: [AuthProxy Service & Resource (TDD)]
**What**: Create integration tests mocking the Supabase Auth REST API, then implement proxy endpoints `POST /auth/register` and `POST /auth/login` to delegate auth request payloads to Supabase.
**Where**:
- Code: `br.com.cifras.auth.resource.AuthResource`, `br.com.cifras.auth.service.AuthService`
- Tests: `src/test/java/br/com/cifras/auth/resource/AuthResourceTest.java`
**Depends on**: T3, T4
**Reuses**: Design §71-79, §397-422
**Requirement**: AUTH-01
**Tools**:
- MCP: `filesystem`
- Skill: NONE
**Done when**:
- [ ] **TDD Step**: Integration tests mocking external Supabase HTTP calls written and verified to fail/raise compilation errors
- [ ] REST client for Supabase Auth API configured via Quarkus Rest Client Reactive
- [ ] `POST /auth/register` creates user on Supabase and returns `201 Created` with ID & Email
- [ ] `POST /auth/login` fetches JWT & Refresh tokens from Supabase, returning them in a `200 OK` response
- [ ] Handle email duplication conflicts: returns `409 Conflict` if Supabase signals email exists
- [ ] Mock integration tests pass successfully
- [ ] Test count: 4 tests pass
**Tests**: integration
**Gate**: quick

#### T8: [Song Entity, Repository & CRUD Service (TDD)]
**What**: Write database tests asserting isolation, soft delete filter, pagination, and transactional commits. Then implement the `Song` entity (inheriting `PanacheEntity`), `SongRepository`, and `SongService` logic.
**Where**:
- Code: `br.com.cifras.song.domain.Song`, `br.com.cifras.song.repository.SongRepository`, `br.com.cifras.song.service.SongService`
- Tests: `src/test/java/br/com/cifras/song/service/SongServiceTest.java`
**Depends on**: T6
**Reuses**: Design §101-113, §185-201
**Requirement**: SONG-01, SONG-02, SONG-03, SONG-05
**Tools**:
- MCP: `filesystem`
- Skill: NONE
**Done when**:
- [ ] **TDD Step**: Test class `SongServiceTest` written first, asserting correct creations, updates, listing limits, and soft deletes
- [ ] `Song` entity mapped with `@Column(columnDefinition = "jsonb")` using Hibernate JSON extension type for `lyrics`
- [ ] `SongRepository` includes default filters to exclude soft-deleted items (`deletedAt IS NOT NULL`)
- [ ] `SongService` handles owner authorization: throws `ForbiddenException` if a user attempts to update, view, or soft delete someone else's song
- [ ] Database integration tests run and pass using Quarkus Dev Services PostgreSQL
- [ ] Test count: 6 tests pass
**Tests**: integration
**Gate**: quick

#### T9: [Song REST Endpoints (TDD)]
**What**: Write REST integration tests with RestAssured asserting CRUD route behaviors, DTO structures, validations, and security identities. Then implement `SongResource` controllers.
**Where**:
- Code: `br.com.cifras.song.resource.SongResource`
- Tests: `src/test/java/br/com/cifras/song/resource/SongResourceTest.java`
**Depends on**: T8
**Reuses**: Design §87-100, §259-288
**Requirement**: SONG-01, SONG-02, SONG-03, SONG-05
**Tools**:
- MCP: `filesystem`
- Skill: NONE
**Done when**:
- [ ] **TDD Step**: RestAssured API tests written first, asserting HTTP statuses (201, 200, 204, 400, 403, 401) under mock JWT identities
- [ ] `SongResource` REST endpoints implemented with `@Authenticated` or `@RolesAllowed`
- [ ] Input Bean validation annotated on Request DTOs: title and artist `@NotBlank`
- [ ] `GET /songs` returns a paginated list structure `PagedResponse<SongSummaryDTO>`, enforcing defaults `page=1`, `pageSize=20` if query parameters are missing
- [ ] `DELETE /songs/{id}` performs soft delete (updates `deletedAt` and returns `204 No Content`)
- [ ] Integration tests verify route execution, authorization, DTO bindings, and schema correctness
- [ ] Test count: 7 tests pass
**Tests**: integration
**Gate**: quick

#### T10: [Song Transposition API (TDD)]
**What**: Write integration tests asserting transposition routes, transposition boundary limits, and query parameter handling. Then, wire the `TranspositionService` into the `SongResource`.
**Where**:
- Code: `br.com.cifras.song.resource.SongResource` (modify)
- Tests: `src/test/java/br/com/cifras/song/resource/SongTranspositionTest.java`
**Depends on**: T9
**Reuses**: Design §87-100, §283-288, §369-388
**Requirement**: TRANSP-01, TRANSP-02
**Tools**:
- MCP: `filesystem`
- Skill: NONE
**Done when**:
- [ ] **TDD Step**: Integration tests written first to assert endpoints `POST /songs/{id}/transpose` and stateless transposition via query param `GET /songs/{id}?transpose=N`
- [ ] `POST /songs/{id}/transpose` takes `semitones` and `convention` and returns the transposed lyrics structure
- [ ] Validates `semitones` range `[-11, 11]`, returning `400 Bad Request` on violation
- [ ] `GET /songs/{id}?transpose=N` transposes lyrics stateless on-the-fly without updating the persisted database values
- [ ] Integration tests verify transposing endpoint inputs and correct response structures
- [ ] Test count: 4 tests pass
**Tests**: integration
**Gate**: quick

#### T11: [Playlist & PlaylistSong Service (TDD)]
**What**: Write database transaction tests verifying playlist CRUD, song insertions, sequential mapping indexes, and removals. Then implement `Playlist` and `PlaylistSong` entities, repositories, and service layer.
**Where**:
- Code: `br.com.cifras.playlist.domain.Playlist`, `br.com.cifras.playlist.domain.PlaylistSong`, `br.com.cifras.playlist.service.PlaylistService`
- Tests: `src/test/java/br/com/cifras/playlist/service/PlaylistServiceTest.java`
**Depends on**: T8
**Reuses**: Design §137-149, §202-223
**Requirement**: PLAYLIST-01, PLAYLIST-03
**Tools**:
- MCP: `filesystem`
- Skill: NONE
**Done when**:
- [ ] **TDD Step**: Tests written first, verifying CRUD operations, song association positioning, and removals
- [ ] `Playlist` and junction `PlaylistSong` JPA relationships mapped correctly
- [ ] `PlaylistService` implements:
  - [ ] `create(CreatePlaylistRequest, userId)`
  - [ ] `addSong(playlistId, songId, position, userId)`: adds song and shifts subsequent items' positions accordingly
  - [ ] `removeSong(playlistId, songId, userId)`: deletes junction record and adjusts trailing indices
  - [ ] Checks owner permissions before modifying resources
- [ ] Tests verify correct position mappings and index adjustment after additions/deletions
- [ ] Test count: 5 tests pass
**Tests**: integration
**Gate**: quick

#### T12: [Playlist API Endpoints & Reordering (TDD)]
**What**: Write REST integration tests validating playlist endpoints, position updates, reordering index arrays, and concurrent update conflicts. Then implement `PlaylistResource` and reorder logic using `@Version` optimistic locking.
**Where**:
- Code: `br.com.cifras.playlist.resource.PlaylistResource`, `br.com.cifras.playlist.service.PlaylistService` (modify)
- Tests: `src/test/java/br/com/cifras/playlist/resource/PlaylistResourceTest.java`
**Depends on**: T11
**Reuses**: Design §125-136, §137-149
**Requirement**: PLAYLIST-01, PLAYLIST-02, PLAYLIST-03
**Tools**:
- MCP: `filesystem`
- Skill: NONE
**Done when**:
- [ ] **TDD Step**: Integration tests written first, asserting payload reordering endpoints `PATCH /playlists/{id}/songs/reorder` with list arrays, checking for 409 conflict exceptions on concurrent edits
- [ ] `PlaylistResource` endpoints mapped and secured
- [ ] `PATCH /playlists/{id}/songs/reorder` accepts `orderedSongIds` list and updates positions in a single transaction
- [ ] Optimistic locking verified on concurrent reordering actions (returns `409 Conflict` with body `{"error": "Conflict — tente novamente"}`)
- [ ] Integration tests verify reordering states and REST responses
- [ ] Test count: 5 tests pass
**Tests**: integration
**Gate**: quick

---

### Phase 4: Collaboration & Access Control

#### T13: [Group CRUD Service & Resource (TDD)]
**What**: Write tests verifying group creation, owner designation, adding/removing member associations, and database persistence. Then implement `Group`, `GroupMember`, `GroupService`, and `GroupResource`.
**Where**:
- Code: `br.com.cifras.group.domain.Group`, `br.com.cifras.group.domain.GroupMember`, `br.com.cifras.group.service.GroupService`, `br.com.cifras.group.resource.GroupResource`
- Tests: `src/test/java/br/com/cifras/group/service/GroupServiceTest.java`
**Depends on**: T12
**Reuses**: Design §151-171, §224-240
**Requirement**: GROUP-01, GROUP-02
**Tools**:
- MCP: `filesystem`
- Skill: NONE
**Done when**:
- [ ] **TDD Step**: Service and resource tests written first, asserting creation, owner assignment, member validation, and permissions
- [ ] `Group` and `GroupMember` JPA mappings completed
- [ ] `GroupService` checks: only OWNER can invite member by email, or remove a member
- [ ] REST API routes `POST /groups`, `GET /groups`, `POST /groups/{id}/members`, `DELETE /groups/{id}/members/{userId}` implemented
- [ ] Returns `404 Not Found` if invited user email does not exist
- [ ] Integration tests verify all member assignment logic and REST routes
- [ ] Test count: 6 tests pass
**Tests**: integration
**Gate**: quick

#### T14: [Collaborative Playlist Access Control (TDD)]
**What**: Write integration tests simulating collaborative playlist modifications by group members, owners, and external users. Then implement access checking policies inside `PlaylistService`.
**Where**:
- Code: `br.com.cifras.playlist.service.PlaylistService` (modify)
- Tests: `src/test/java/br/com/cifras/playlist/service/PlaylistCollabAccessTest.java`
**Depends on**: T13
**Reuses**: Design §137-149, §161-170
**Requirement**: GROUP-02
**Tools**:
- MCP: `filesystem`
- Skill: NONE
**Done when**:
- [ ] **TDD Step**: Integration tests written first:
  - [ ] Group member edits collaborative playlist → Expect `200 OK`
  - [ ] Non-member edits collaborative playlist → Expect `403 Forbidden`
  - [ ] Member removed from group → Expect `403 Forbidden` on subsequent edits
- [ ] `PlaylistService` updated to check group collaboration membership:
  - [ ] If `isCollaborative` is true, calls `GroupService.isMember()` to validate requesting user
- [ ] Integration tests pass successfully
- [ ] Test count: 4 tests pass
**Tests**: integration
**Gate**: quick

---

### Phase 5: P2 & P3 Features

#### T15: [Full-Text Search - P2 (TDD)]
**What**: Write database tests asserting partial searches, case-insensitive keyword matches on title/artist/lyrics, and chord searches. Then, implement the search queries in `SongRepository` and map to `GET /songs?q=`.
**Where**:
- Code: `br.com.cifras.song.repository.SongRepository`, `br.com.cifras.song.service.SongService` (modify)
- Tests: `src/test/java/br/com/cifras/song/service/SongSearchTest.java`
**Depends on**: T9
**Reuses**: Design §517
**Requirement**: SEARCH-01
**Tools**:
- MCP: `filesystem`
- Skill: NONE
**Done when**:
- [ ] **TDD Step**: Search queries tests written first, asserting results on keyword substrings, specific chords, and case variations
- [ ] `SongRepository` implements SQL ILIKE queries over title, artist, and jsonb lyrics structure or using postgres `tsvector`
- [ ] `GET /songs?q=` binds query search parameters
- [ ] Searching with no results returns `200 OK` with `{ data: [], total: 0 }`
- [ ] Search tests pass correctly
- [ ] Test count: 3 tests pass
**Tests**: integration
**Gate**: quick

#### T16: [User Preferred Key Persistence - P2 (TDD)]
**What**: Write integration tests asserting saving, overwriting, and fetching user preferred keys. Then implement the `UserPreferredKey` entity, service, and endpoints.
**Where**:
- Code: `br.com.cifras.song.domain.UserPreferredKey`, `br.com.cifras.song.resource.SongResource` (modify)
- Tests: `src/test/java/br/com/cifras/song/resource/SongPreferredKeyTest.java`
**Depends on**: T10
**Reuses**: Design §353-364, §513
**Requirement**: TRANSP-03
**Tools**:
- MCP: `filesystem`
- Skill: NONE
**Done when**:
- [ ] **TDD Step**: RestAssured tests written first, validating `PATCH /songs/{id}/preferred-key` updating a user's tom preference and `GET /songs/{id}` returning it
- [ ] `UserPreferredKey` entity mapped with user identity and song constraints
- [ ] `PATCH /songs/{id}/preferred-key` receives `{ key: "G" }` and persists preference
- [ ] `GET /songs/{id}` includes field `userPreferredKey` matching preference or `null` if none exists
- [ ] RestAssured tests pass
- [ ] Test count: 3 tests pass
**Tests**: integration
**Gate**: quick

#### T17: [Theater Session Persistence - P3 (TDD)]
**What**: Write integration/RestAssured tests asserting saving and retrieving theater playback sessions. Then implement endpoints `POST /playlists/{id}/session` and `GET /playlists/{id}/session`.
**Where**:
- Code: `br.com.cifras.playlist.domain.TheaterSession` (or active records), `br.com.cifras.playlist.resource.PlaylistResource` (modify)
- Tests: `src/test/java/br/com/cifras/playlist/resource/PlaylistSessionTest.java`
**Depends on**: T12
**Reuses**: Design §518
**Requirement**: THEATER-01
**Tools**:
- MCP: `filesystem`
- Skill: NONE
**Done when**:
- [ ] **TDD Step**: REST API tests written first, asserting theater state saves and retrievals
- [ ] Playback session entity configured with fields: `currentSongIndex` (integer), `currentKey` (string)
- [ ] `POST /playlists/{id}/session` updates or creates playback session records
- [ ] `GET /playlists/{id}/session` returns the current theater session state
- [ ] RestAssured tests pass successfully
- [ ] Test count: 3 tests pass
**Tests**: integration
**Gate**: quick

---

## Parallel Execution Map

```
Phase 1 (Sequential):
  T1 ──→ T2 ──→ T3 ──→ T4

Phase 2 (Sequential):
  Phase 1 complete, then:
    T5 ──→ T6

Phase 3 (Parallel):
  Phase 2 complete, then:
    ├── T7 [P]
    ├── T8 [P]
    ├── T9 [P]
    ├── T10 [P]
    ├── T11 [P]
    └── T12 [P]

Phase 4 (Sequential):
  Phase 3 complete, then:
    T13 ──→ T14

Phase 5 (Sequential):
  Phase 4 complete, then:
    T15 ──→ T16 ──→ T17
```

**Parallelism constraint:** Tasks marked `[P]` do not depend on each other and use parallel-safe integration databases or mocked environments.

---

## Task Granularity Check

| Task | Scope | Status |
| --- | --- | --- |
| T1: Project Setup | Initialize project structures, dependencies, build tool setup | ✅ Granular |
| T2: Database Setup | Config properties + database connection check | ✅ Granular |
| T3: JWT Security | Filter + config parameters | ✅ Granular |
| T4: Exception Mapper | Standardizing REST exception responses | ✅ Granular |
| T5: Domain Models | Pure Java chord representations & models | ✅ Granular |
| T6: Transposition | Pure Java transposing engine | ✅ Granular |
| T7: Auth Proxy | Resource + Web Client | ✅ Granular |
| T8: Song CRUD Service | Database Panache operations & entity checks | ✅ Granular |
| T9: Song REST Resource | HTTP controller bindings & validation tags | ✅ Granular |
| T10: Song Transpose API | API route integration for transposition engine | ✅ Granular |
| T11: Playlist Service | Database operations for sequential listings | ✅ Granular |
| T12: Playlist REST API | Endpoints + reordering lists + locking checks | ✅ Granular |
| T13: Group Service & API | Groups CRUD, ownership, membership routes | ✅ Granular |
| T14: Group Collaboration check | Playlist service authorization validations | ✅ Granular |
| T15: Full-Text Search | ILIKE/tsvector SQL repository queries | ✅ Granular |
| T16: Preferred Key | DB persistence & GET query mapping | ✅ Granular |
| T17: Theater Session | Playback session database storage & API | ✅ Granular |

---

## Diagram-Definition Cross-Check

| Task | Depends On (task body) | Diagram Shows | Status |
| --- | --- | --- | --- |
| T1 | None | Starts Phase 1 | ✅ Match |
| T2 | T1 | T1 → T2 | ✅ Match |
| T3 | T1 | T2 → T3 | ✅ Match |
| T4 | T1 | T3 → T4 | ✅ Match |
| T5 | T4 | Phase 1 complete → T5 | ✅ Match (T4 is Phase 1, T5 is Phase 2) |
| T6 | T5 | T5 → T6 | ✅ Match |
| T7 | T3, T4 | Phase 2 complete → T7 | ✅ Match (T3, T4 are Phase 1) |
| T8 | T6 | Phase 2 complete → T8 | ✅ Match (T6 is Phase 2) |
| T9 | T8 | Phase 2 complete → T9 | ✅ Match (T8 is prerequisite layer) |
| T10 | T9 | Phase 2 complete → T10 | ✅ Match (T9 is prerequisite layer) |
| T11 | T8 | Phase 2 complete → T11 | ✅ Match (T8 is prerequisite layer) |
| T12 | T11 | Phase 2 complete → T12 | ✅ Match (T11 is prerequisite layer) |
| T13 | T12 | Phase 3 complete → T13 | ✅ Match (T12 is Phase 3) |
| T14 | T13 | T13 → T14 | ✅ Match |
| T15 | T9 | Phase 4 complete → T15 | ✅ Match (T9 is prerequisite layer) |
| T16 | T10 | T15 → T16 | ✅ Match (T10 is prerequisite layer) |
| T17 | T12 | T16 → T17 | ✅ Match (T12 is prerequisite layer) |

---

## Test Co-location Validation

| Task | Code Layer Created/Modified | Matrix Requires | Task Says | Status |
| --- | --- | --- | --- | --- |
| T1 | None (Infrastructure) | none | none | ✅ OK |
| T2 | Configuration | none | none | ✅ OK |
| T3 | Filters / Interceptors | integration | integration | ✅ OK |
| T4 | Shared Helpers | unit | unit | ✅ OK |
| T5 | Domain Models | unit | unit (TDD first) | ✅ OK |
| T6 | Business Logic Services | unit | unit (TDD first) | ✅ OK |
| T7 | Web Clients / Proxies | integration | integration (TDD first) | ✅ OK |
| T8 | Repositories & Services | integration | integration (TDD first) | ✅ OK |
| T9 | REST Resources | integration | integration (TDD first) | ✅ OK |
| T10 | REST Resources | integration | integration (TDD first) | ✅ OK |
| T11 | Repositories & Services | integration | integration (TDD first) | ✅ OK |
| T12 | REST Resources | integration | integration (TDD first) | ✅ OK |
| T13 | REST Resources & Services | integration | integration (TDD first) | ✅ OK |
| T14 | Services | integration | integration (TDD first) | ✅ OK |
| T15 | Repositories | integration | integration (TDD first) | ✅ OK |
| T16 | Entities & REST Resources | integration | integration (TDD first) | ✅ OK |
| T17 | Entities & REST Resources | integration | integration (TDD first) | ✅ OK |
