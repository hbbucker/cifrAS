# CI/CD Pipeline on GitHub

## 1. Overview
The goal is to create a GitHub Actions workflow that automates the testing and validation of the CifrAS application (both backend and frontend) to ensure code quality and prevent regressions.

## 2. Requirements
- **REQ-01**: The pipeline must be triggered when a Pull Request is opened against the `master` (or `main`) branch.
- **REQ-02**: The pipeline must be triggered when code is pushed to the `master` (or `main`) branch (e.g., when a PR is merged).
- **REQ-03**: The pipeline must run backend validations and tests using Maven (Quarkus).
- **REQ-04**: The pipeline must run frontend validations, including linting and tests, using NPM (React/Vite).
- **REQ-05**: The frontend and backend jobs should run in parallel for faster feedback.

## 3. Scope
**Included**:
- `.github/workflows/ci.yml` creation.
- Configuration of Java 21+ and Maven for the backend.
- Configuration of Node.js and NPM for the frontend.

**Excluded**:
- Deployment to production (focusing initially on Continuous Integration / testing phase).
