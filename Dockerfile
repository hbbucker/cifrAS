# syntax=docker/dockerfile:1
# ↑ Enables BuildKit advanced syntax (required for --mount=type=cache)

# Stage 1: Build the native application
FROM quay.io/quarkus/ubi9-quarkus-mandrel-builder-image:23.1-java21 AS build

# The builder image runs as 'quarkus' (uid=1000), we need root to install Node.js
USER root

# Install Node.js (required by Quinoa to build the Vite/React frontend)
RUN curl -fsSL https://rpm.nodesource.com/setup_20.x | bash - \
    && microdnf install -y nodejs gcc-c++ make \
    && microdnf clean all

# Revert to 'quarkus' user (uid=1000, gid=1000)
USER quarkus

WORKDIR /app

# Copy the Maven wrapper and project object model from the codebase directory
# Copying pom.xml separately maximises layer cache reuse:
# dependencies are only re-downloaded when pom.xml changes.
COPY --chown=quarkus:quarkus codebase/pom.xml .
COPY --chown=quarkus:quarkus codebase/mvnw .
COPY --chown=quarkus:quarkus codebase/.mvn .mvn

# Pre-download all Maven dependencies (uses BuildKit cache mount for .m2).
# This layer is invalidated only when pom.xml changes, not on source changes.
RUN --mount=type=cache,target=/home/quarkus/.m2,uid=1000,gid=1000 \
    ./mvnw dependency:go-offline -q

# Copy the source code (only invalidates build layer, not dependency layer)
COPY --chown=quarkus:quarkus codebase/src src

# Build the Quarkus Native application.
# BuildKit cache mounts:
#   - .m2      → Maven local repo (avoids re-downloading JARs between builds)
#   - .npm     → npm/node cache (avoids re-downloading frontend packages)
# Cache mounts are NOT included in the final image layer — zero size overhead.
RUN --mount=type=cache,target=/home/quarkus/.m2,uid=1000,gid=1000 \
    --mount=type=cache,target=/home/quarkus/.npm,uid=1000,gid=1000 \
    ./mvnw clean package -Dnative -DskipTests -Dquarkus.native.native-image-xmx=8g

# Stage 2: Create the minimal runtime micro-image
FROM registry.access.redhat.com/ubi9/ubi-minimal:latest

WORKDIR /work/

# Copy the native executable from the build stage
COPY --from=build /app/target/*-runner /work/application

# Expose port 8080
EXPOSE 8080

# Configure environment variables for runtime
ENV QUARKUS_HTTP_HOST=0.0.0.0

# Start the native application
CMD ["./application", "-Dquarkus.http.host=0.0.0.0"]
