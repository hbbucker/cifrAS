# Stage 1: Build the application (Java + Node.js)
FROM maven:3.9.6-eclipse-temurin-21 AS build

# Install Node.js (required by Quinoa to build the Vite/React frontend)
RUN apt-get update && apt-get install -y curl \
    && curl -fsSL https://deb.nodesource.com/setup_20.x | bash - \
    && apt-get install -y nodejs \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Copy the Maven wrapper and project object model
COPY pom.xml .
COPY mvnw .
COPY .mvn .mvn

# Copy the source code
COPY src src

# Build the Quarkus application (this automatically triggers the Quinoa frontend build)
# -DskipTests is used to speed up the container build process, tests run in CI
RUN mvn clean package -DskipTests

# Stage 2: Create the minimal runtime image
FROM eclipse-temurin:21-jre-jammy

WORKDIR /app

# Copy the Quarkus fast-jar application structure from the build stage
COPY --from=build /app/target/quarkus-app/lib/ /app/lib/
COPY --from=build /app/target/quarkus-app/*.jar /app/
COPY --from=build /app/target/quarkus-app/app/ /app/app/
COPY --from=build /app/target/quarkus-app/quarkus/ /app/quarkus/

# Expose port 8080 (the default for Quarkus, and expected by Fly.io)
EXPOSE 8080

# Configure environment variables for runtime
ENV QUARKUS_HTTP_HOST=0.0.0.0
# The java.util.logging.manager ensures proper logging for Quarkus fast-jar
ENV JAVA_OPTS="-Dquarkus.http.host=0.0.0.0 -Djava.util.logging.manager=org.jboss.logmanager.LogManager"

# Start the application
CMD ["java", "-jar", "/app/quarkus-run.jar"]
