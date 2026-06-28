# Feature Specification: Encrypt Google Drive Refresh Token at Rest

## 1. Overview
To comply with the Brazilian LGPD and general security best practices, the Google Drive refresh token stored in the database must be encrypted at rest. It is currently stored in plain text in the `user_integrations` table.

## 2. Requirements
- **REQ-001**: A symmetric encryption algorithm (e.g., AES-256) must be used to encrypt the token before persisting to the DB.
- **REQ-002**: The decryption must occur automatically when loading the token from the DB.
- **REQ-003**: The encryption master key must be configurable via `application.properties` (`cifras.crypto.master-key`).
- **REQ-004**: Implementation should utilize JPA's `AttributeConverter` so that domain code remains untouched and purely handles the decrypted string.

## 3. Scope
- Create a `CryptoUtils` class to handle AES encryption/decryption.
- Create a `CryptoConverter` implementing `AttributeConverter<String, String>`.
- Annotate the `refreshToken` field in `UserIntegrationEntity` with `@Convert`.
- Add the required crypto properties to `application.properties`.
