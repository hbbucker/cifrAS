# Stage 1: Build the native application
FROM quay.io/quarkus/ubi9-quarkus-mandrel-builder-image:23.1-java21 AS build

# The builder image runs as 'quarkus', we need root to install Node.js
USER root

# Install Node.js (required by Quinoa to build the Vite/React frontend)
RUN curl -fsSL https://rpm.nodesource.com/setup_20.x | bash - \
    && microdnf install -y nodejs gcc-c++ make \
    && microdnf clean all

# Revert to 'quarkus' user
USER quarkus

WORKDIR /app

# Copy the Maven wrapper and project object model from the codebase directory
COPY --chown=quarkus:quarkus codebase/pom.xml .
COPY --chown=quarkus:quarkus codebase/mvnw .
COPY --chown=quarkus:quarkus codebase/.mvn .mvn

# Copy the source code
COPY --chown=quarkus:quarkus codebase/src src

# Build the Quarkus Native application 
# -Dnative compiles to a GraalVM native image
# -DskipTests speeds up the build process
RUN ./mvnw clean package -Dnative -DskipTests -Dquarkus.native.native-image-xmx=8g

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
