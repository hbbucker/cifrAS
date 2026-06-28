# Tasks: Encrypt Refresh Token

## [x] Task 1: Create Crypto Utility and JPA Converter
**What**: Implement AES encryption and the JPA `AttributeConverter`.
**Where**: 
- `br.com.cifras.shared.util.CryptoUtils.java`
- `br.com.cifras.shared.infra.persistence.converter.CryptoConverter.java`
**Depends on**: None
**Done when**: Utility can encrypt and decrypt string payloads, and the converter successfully wraps this behavior.

## [x] Task 2: Apply Converter to Entity and Configure Properties
**What**: Annotate the entity field and add the master key config.
**Where**:
- `br.com.cifras.user.infra.persistence.entity.UserIntegrationEntity.java`
- `codebase/src/main/resources/application.properties`
**Depends on**: Task 1
**Done when**: `refreshToken` has `@Convert(converter = CryptoConverter.class)` and properties hold a default test key.

## [x] Task 3: Write Integration Test
**What**: Ensure tokens are encrypted in the DB but decrypted when read.
**Where**: 
- `br.com.cifras.user.infra.persistence.repository.UserIntegrationRepositoryTest.java` (create if doesn't exist)
**Depends on**: Task 2
**Done when**: A test persists an integration and uses native SQL to verify the stored column does not match the plain text token, but the loaded entity has the original token.
