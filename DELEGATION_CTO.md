# Delegation to CTO
## Objective: Make `rtk` globally accessible

The `rtk` script in the project root is working, but it must be invoked as `./rtk` because it is not in the system `PATH`.

### Acceptance Criteria
- `rtk` can be invoked from any directory within the project without needing the `./` prefix.
- The solution should adhere to project conventions (see `./codebase/.specs/codebase/CONVENTIONS.md` or similar).

### Next Action
Please investigate how to add `rtk` to the PATH or alias it in a way that is persistent and project-scoped.
