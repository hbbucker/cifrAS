# Delegation to CTO

## Objective 1: Make `rtk` globally accessible
The `rtk` script in the project root is working, but it must be invoked as `./rtk` because it is not in the system `PATH`.
### Acceptance Criteria
- `rtk` can be invoked from any directory within the project without needing the `./` prefix.
- The solution should adhere to project conventions.

## Objective 2: Support and Implement Advanced Search (Epic 1)
Execute the implementation of the PostgreSQL Full-Text Search following the roadmap in `.specs/features/advanced-search/tasks.md`.

### Acceptance Criteria & Quality Standards
- **TDD (Test-Driven Development):** All backend and frontend logic must be covered by tests written *before* implementation.
- **Test Coverage:** Minimum 80% coverage for the new feature modules.
- **Workflow:** 
    - Use separate feature branches.
    - Open Pull Requests on GitHub for every task.
    - GitHub Actions (CI) must pass (build, lint, tests) before merging.
- **Technical Validation:** Ensure the `SongRepository` and `SearchService` architecture is scalable for 10k+ songs.

### Tasks
- [ ] Task 2: Database Migration (PostgreSQL FTS).
- [ ] Task 3: Implement SearchService with TDD.
- [ ] Task 4: Frontend Quick Search UI (Collaborate with Alex J. Code).
