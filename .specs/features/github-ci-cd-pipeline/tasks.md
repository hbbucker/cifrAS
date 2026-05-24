# Tasks: CI/CD Pipeline on GitHub

## Task 1: Create GitHub Actions Workflow for Backend
- **What**: Create `.github/workflows/ci.yml` and configure a backend job to build and test the Quarkus application.
- **Where**: `.github/workflows/ci.yml`
- **Depends on**: None
- **Done when**: A `backend` job is configured to run `mvn clean verify` on push to `master` and pull requests against `master`.

## Task 2: Create GitHub Actions Workflow for Frontend
- **What**: Add a frontend job to the same `ci.yml` to build and test the React application.
- **Where**: `.github/workflows/ci.yml`
- **Depends on**: Task 1
- **Done when**: A `frontend` job is configured to run `npm ci`, `npm run lint` (if available), and `npx playwright test` (or `npm test`) on push to `master` and pull requests against `master`.
