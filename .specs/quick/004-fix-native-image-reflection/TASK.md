# Quick Fix: Native Image Serialization Error

## Description
When running the application compiled as a native image, Jackson fails to serialize `GoogleDriveResource$AuthUrlResponse` because the class is not registered for reflection, throwing an `InvalidDefinitionException`.

## Root Cause
GraalVM removes reflection information for classes that aren't explicitly registered, causing Jackson serialization to fail on DTOs and records during native image execution.

## Fix
Annotated the inner records in `GoogleDriveResource.java` (`AuthUrlResponse`, `CallbackRequest`, `ExtractTextResponse`, `ErrorResponse`, `AccountResponse`) with `@RegisterForReflection`.

## Scope
- `codebase/src/main/java/br/com/cifras/integration/resource/GoogleDriveResource.java`
