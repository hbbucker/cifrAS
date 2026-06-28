# Security Fixes Summary

## Changes Made
- Added `quarkus.http.limits.max-body-size=10M` in `application.properties` to prevent DoS attacks via excessively large payloads.
- Added backslash escaping (`replace("\\", "\\\\")`) before single-quote escaping in `GoogleDriveService.java` to prevent Google Drive API query injections.

## Verification
- Code compiled successfully via Maven.
- The modifications target precisely the identified weaknesses without affecting normal operations.
