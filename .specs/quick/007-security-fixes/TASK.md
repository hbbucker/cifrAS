# Security Fixes (Hardening)

## What
Fix a potential injection vulnerability in the Google Drive API search query and apply a global HTTP body size limit to prevent DoS attacks via large payloads.

## Where
1. `codebase/src/main/java/br/com/cifras/integration/application/GoogleDriveService.java` (Fix escaping in `listFiles`)
2. `codebase/src/main/resources/application.properties` (Add `quarkus.http.limits.max-body-size=10M`)

## Verification
- Project must compile successfully.
- Code logic must handle backslashes properly in the Google Drive API call.
