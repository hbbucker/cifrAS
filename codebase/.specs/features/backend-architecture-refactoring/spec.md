# Backend Architecture Refactoring Specification

## Problem Statement

The backend architecture currently suffers from coupled layers and business rules incorrectly placed within controllers. This leads to a complex, hard-to-maintain codebase with "God Objects", poor testability, and scattered business logic that makes it difficult for both developers and AI agents to understand the system flow.

## Goals

- [ ] Migrate the codebase to a Feature-First organization (Vertical Slice Architecture).
- [ ] Centralize all business rules, invariants, and policies within a Rich Domain (`model` layer).
- [ ] Ensure the `application` layer only orchestrates flows, handles transactions, and coordinates infrastructure.
- [ ] Isolate HTTP concerns, serialization, and request/response mapping to the `resource` layer.
- [ ] Decouple infrastructure (DB, Kafka, Redis, etc.) completely from the domain layer.

## Out of Scope

Explicitly excluded. Documented to prevent scope creep.

| Feature | Reason |
| ----------- | -------------- |
| Frontend modifications | This refactoring is strictly for the Quarkus backend layer. |
| Altering existing business logic | The actual behavior and business rules must remain identical; only their location and structural organization will change. |

---

## User Stories

### P1: Package Reorganization ⭐ MVP

**User Story**: As a system architect, I want the codebase structured by feature context (e.g., `product/`, `stock/`) rather than technical type so that the system is easier to navigate and analyze.

**Why P1**: Foundation for the new architecture and vertical slicing.

**Acceptance Criteria**:

1. WHEN exploring the `src/main/java/br/com/cifras` directory, THEN the system SHALL display folders based on functional features (e.g., `auth`, `song`, `playlist`).
2. WHEN adding a new use case, THEN the system SHALL place it within the `application` folder of the respective feature context.

**Independent Test**: The codebase compiles successfully after package reorganization, and the directory structure matches the defined architecture.

---

### P1: Rich Domain Extraction ⭐ MVP

**User Story**: As a backend developer, I want all business rules, invariants, and validations centralized in the `model` layer so that domain logic is cohesive and testable.

**Why P1**: Core principle of the new architecture to prevent logic scattering.

**Acceptance Criteria**:

1. WHEN a business rule or invariant check occurs, THEN the system SHALL execute it from a domain entity or value object.
2. WHEN inspecting `resource` or `application` classes, THEN the system SHALL NOT contain any explicit business rules (e.g., `if (price < 0) throw Exception`).

**Independent Test**: Domain unit tests can validate all business rules without requiring `application` or `resource` layers.

---

### P1: Application Layer Orchestration ⭐ MVP

**User Story**: As a backend developer, I want the `application` layer to exclusively handle flow orchestration, transactions, and infrastructure coordination so that it remains independent of business logic.

**Why P1**: Ensures strict separation of concerns and thin orchestration.

**Acceptance Criteria**:

1. WHEN a request is processed, THEN the `application` use case SHALL start the transaction, query repositories, call domain methods, and persist changes.
2. WHEN reading an `application` class, THEN the system SHALL NOT contain domain decisions, calculations, or validations.

**Independent Test**: Unit tests for the application layer can mock the domain and infrastructure to verify orchestration flow exclusively.

---

### P1: Thin Resources ⭐ MVP

**User Story**: As a backend developer, I want the `resource` layer to only handle HTTP interfaces and DTO mapping so that the API layer is decoupled from application and business logic.

**Why P1**: Prevents rules in controllers and maintains a clean boundary.

**Acceptance Criteria**:

1. WHEN an HTTP request is received, THEN the `resource` SHALL delegate the execution entirely to an `application` use case.
2. WHEN inspecting a `resource` class, THEN the system SHALL NOT contain business validations or complex queries.

**Independent Test**: Endpoints can be tested using mock `application` use cases to verify correct HTTP status codes and serialization.

---

## Edge Cases

- WHEN a cross-cutting concern arises, THEN the system SHALL place it in the `shared/` directory.
- WHEN an entity requires complex mapping, THEN the system SHALL handle it in the `application/mapper/` or `infra/persistence/mapper/` directories, keeping the domain agnostic.
- WHEN a repository needs to enforce uniqueness, THEN the system SHALL do so via infrastructure constraints, but the domain SHALL handle the error gracefully.

---

## Requirement Traceability

Each requirement gets a unique ID for tracking across design, tasks, and validation.

| Requirement ID | Story | Phase | Status |
| -------------- | ----------- | ------ | ------- |
| ARCH-01 | P1: Package Reorganization | Design | Pending |
| ARCH-02 | P1: Rich Domain Extraction | Design | Pending |
| ARCH-03 | P1: Application Layer Orchestration | Design | Pending |
| ARCH-04 | P1: Thin Resources | Design | Pending |

**Coverage:** 4 total, 0 mapped to tasks, 4 unmapped ⚠️

---

## Success Criteria

How we know the feature is successful:

- [ ] Codebase structure follows `feature/layer` strictly.
- [ ] All business logic validations are handled by Domain (`model`).
- [ ] Application Use Cases only orchestrate.
- [ ] Controllers (`resource`) are completely devoid of business logic.
- [ ] Pull requests pass the 6-point Quality Criteria checklist defined in `ARCHITECTURE.md`.
