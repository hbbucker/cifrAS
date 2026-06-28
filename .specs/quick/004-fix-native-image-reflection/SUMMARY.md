# Summary: Fix Native Image Reflection

## Changes
- **GoogleDriveResource.java**: Imported `io.quarkus.runtime.annotations.RegisterForReflection`.
- **GoogleDriveResource.java**: Annotated the inner records (`AuthUrlResponse`, `CallbackRequest`, `ExtractTextResponse`, `ErrorResponse`, `AccountResponse`) with `@RegisterForReflection`.
- This ensures GraalVM includes reflection metadata for these classes so Jackson can properly serialize/deserialize them in native images.

## Verification
- Code successfully recompiled using `./mvnw compile`.
