# Fly.io Deployment Specification

## Problem Statement

CifrAS needs to be deployed to a production-like environment for users to access the full-stack application. We are using fly.io as our hosting provider. Since we have recently migrated to a unified architecture using Quarkus and Quinoa (where the React frontend is served by the Quarkus backend), we need a single Dockerfile capable of building the entire application and running it correctly within the fly.io infrastructure.

## Goals

- [ ] Create a `Dockerfile` that builds the Quarkus backend and Quinoa frontend in a multi-stage process (or utilizing a base image that supports both Java and Node.js for the build).
- [ ] Configure the Docker container to expose the correct port (8080) for fly.io.
- [ ] Ensure the container can be successfully deployed and run on fly.io without environment-specific crashes.

## Out of Scope

Explicitly excluded. Documented to prevent scope creep.

| Feature     | Reason         |
| ----------- | -------------- |
| Database provisioning | We are focusing on getting the application container running first; connecting to a production Postgres will be handled separately or via existing fly.io postgres add-ons if needed, but the primary task is the Dockerfile. |
| Custom Domain setup | Domain routing and SSL certificates on fly.io will be configured outside of this scope. |
| CI/CD Pipeline updates | While we have GitHub Actions, this feature focuses solely on the creation and validation of the Dockerfile itself, not automating its deployment yet. |

---

## User Stories

### P1: Build and Run Unified Container ⭐ MVP

**User Story**: As a developer, I want a single Dockerfile that packages both the Quarkus backend and the React frontend so that I can deploy the full application to fly.io easily.

**Why P1**: This is the core requirement to get the application live on fly.io.

**Acceptance Criteria**:

1. WHEN the `docker build` command is run THEN the system SHALL successfully compile the frontend (Node.js/Vite) and backend (Maven/Java).
2. WHEN the resulting Docker container is started THEN the Quarkus application SHALL listen on port 8080 and serve the frontend assets via Quinoa.
3. WHEN the container is deployed to fly.io THEN it SHALL pass the health checks and start serving traffic.

**Independent Test**: Can demo by running `docker build -t cifras-app -f Dockerfile .` and `docker run -p 8080:8080 cifras-app`, then accessing `http://localhost:8080` in the browser to see the full app.

---

## Edge Cases

- WHEN the build environment lacks Node.js THEN the Dockerfile's build stage SHALL explicitly provide the necessary Node.js version to allow Quinoa to build the frontend.
- WHEN environment variables for production are missing THEN the application SHALL gracefully fail or fallback to safe defaults, clearly logging what is missing for fly.io configuration.

---

## Requirement Traceability

| Requirement ID | Story       | Phase   | Status  |
| -------------- | ----------- | ------- | ------- |
| DEPLOY-01      | P1: Build & Run | Execute | Verified |

---

## Success Criteria

How we know the feature is successful:

- [ ] A `Dockerfile` exists in the root of the project.
- [ ] The `Dockerfile` successfully builds a working image using standard Docker commands.
- [ ] The image runs successfully locally, mimicking the fly.io environment.
