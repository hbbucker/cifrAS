# Quick Fix: Invalid UUID string: mock-refresh-subject

## Description
The user experienced an error (`Failed to exchange token: Invalid UUID string: mock-refresh-subject`) after authorizing their Google Drive account.

## Root Cause
A recent commit (`46f5be4`) updated the backend's mock JWT generation logic so that it issues valid UUID subjects instead of the hardcoded string `mock-refresh-subject`. However, users who already have an old token cached in their browser still send the malformed token.
When this old token is sent to the Google Drive callback endpoint, `GoogleDriveResource.getUserId()` attempts to run `UUID.fromString(jwt.getSubject())`, causing an `IllegalArgumentException` which results in an unhandled 500 error. The frontend doesn't auto-refresh the token on a 500 response.

## Fix
Update `GoogleDriveResource.java` to gracefully catch `IllegalArgumentException` during subject parsing and throw a 401 Unauthorized (`WebApplicationException`) instead. This allows the frontend interceptor to correctly catch the 401, trigger the silent token refresh (which will issue a new token with a valid UUID), and automatically retry the Google Drive authentication request.

## Scope
- `codebase/src/main/java/br/com/cifras/integration/resource/GoogleDriveResource.java`
