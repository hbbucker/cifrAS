# Summary: Fix Google OAuth invalid_client error

## Changes
- **GoogleDriveService.java**: Added validation in `getAuthUrl()`. It now throws an `IllegalStateException` if the `clientId` is `"dummy-client-id"`, indicating the `GOOGLE_CLIENT_ID` environment variable is missing.
- **DriveFilePicker.tsx**: Updated the `catch` block in `handleConnect()` to extract and display the backend's error message (`err.response?.data?.error`), improving UX.

## Verification
- Backend compiled successfully.
- Frontend linting verified.
