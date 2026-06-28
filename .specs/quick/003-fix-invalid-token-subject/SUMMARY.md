# Summary: Fix Invalid UUID string: mock-refresh-subject

## Changes
- **GoogleDriveResource.java**: Modified `getUserId()` to wrap `UUID.fromString(jwt.getSubject())` in a try-catch block.
- **GoogleDriveResource.java**: Added an import for `WebApplicationException`.
- Now, if an invalid UUID (like the deprecated `mock-refresh-subject`) is encountered, a `401 Unauthorized` response is returned instead of a `500 Server Error`.
- This ensures the frontend's interceptor kicks in to auto-refresh the session.

## Verification
- Compiled the backend using `./mvnw compile` successfully to ensure the syntax and imports are correct.
