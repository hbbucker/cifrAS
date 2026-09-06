# syntax=docker/dockerfile:1

# Stage 1: Build the native application
FROM quay.io/quarkus/ubi9-quarkus-mandrel-builder-image:23.1-java21 AS build

USER root

# Install Node.js (required by Quinoa to build the Vite/React admin frontend)
RUN curl -fsSL https://rpm.nodesource.com/setup_20.x | bash - \
    && microdnf install -y nodejs gcc-c++ make \
    && microdnf clean all

USER quarkus

WORKDIR /app

COPY --chown=quarkus:quarkus pom.xml .
COPY --chown=quarkus:quarkus mvnw .
COPY --chown=quarkus:quarkus .mvn .mvn

RUN --mount=type=cache,target=/home/quarkus/.m2,uid=1001,gid=1001 \
    ./mvnw dependency:go-offline -q

COPY --chown=quarkus:quarkus src src

RUN --mount=type=cache,target=/home/quarkus/.m2,uid=1001,gid=1001 \
    --mount=type=cache,target=/home/quarkus/.npm,uid=1001,gid=1001 \
    ./mvnw clean package -Dnative -DskipTests -Dquarkus.native.native-image-xmx=8g

# Stage 2: Create the minimal runtime micro-image
FROM registry.access.redhat.com/ubi9/ubi-minimal:latest

WORKDIR /work/

COPY --from=build /app/target/*-runner /work/application

EXPOSE 8081

ENV QUARKUS_HTTP_HOST=0.0.0.0
ENV QUARKUS_HTTP_PORT=8081

CMD ["./application", "-Dquarkus.http.host=0.0.0.0", "-Dquarkus.http.port=8081"]
