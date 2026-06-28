# Quick Fix: Erro 401: invalid_client / GeneralOAuthFlow

## Description
When attempting to authenticate with Google Drive, the user received an "Erro 401: invalid_client" with "flowName=GeneralOAuthFlow". This happens when the Google OAuth Client ID provided in the `client_id` query parameter is missing or invalid.

## Root Cause
If the application is run in an environment (like a native image or production container) where the `GOOGLE_CLIENT_ID` environment variable is not defined, the `GoogleDriveService` falls back to its default value: `"dummy-client-id"`. It then redirects the user's browser to Google with `client_id=dummy-client-id`. Google rejects this with a 401 error.

## Fix
1. Modified `GoogleDriveService.java` to explicitly check if `clientId` is `"dummy-client-id"`. If it is, it throws an `IllegalStateException` with a clear message: `"Integração com Google Drive não configurada no servidor (GOOGLE_CLIENT_ID ausente)"`. This prevents the redirect entirely and fails fast.
2. Modified the frontend component `DriveFilePicker.tsx` to read the error message sent by the backend (`err.response?.data?.error`) and display it in the UI, rather than hardcoding a generic "Failed to start Google authentication." message.

## Scope
- `codebase/src/main/java/br/com/cifras/integration/application/GoogleDriveService.java`
- `codebase/src/main/webui/src/components/DriveFilePicker.tsx`
