# Task: Fix GoogleDriveServiceTest

## Describe
The test `GoogleDriveServiceTest` is failing with `IllegalStateException: Integração com Google Drive não configurada no servidor (GOOGLE_CLIENT_ID ausente)` because the `%test` profile in `application.properties` does not mock the `google.client.id` property. When running in environments where `.env` is absent or not loaded by the test runner, it defaults to `"dummy-client-id"` which intentionally triggers the security guard in `GoogleDriveService`.

## Implement
Added `%test.google.client.id=test-client-id` to `application.properties` to ensure the test suite uses a fake valid client ID.

## Verify
Running `rtk ./mvnw test -Dtest=GoogleDriveServiceTest` to confirm it passes without throwing the configuration exception.

## Commit
Will commit the change to `main` with message `fix(tests): add mock google.client.id to test profile`.
