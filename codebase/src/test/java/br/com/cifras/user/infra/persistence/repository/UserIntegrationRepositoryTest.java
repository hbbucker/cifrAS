package br.com.cifras.user.infra.persistence.repository;

import br.com.cifras.user.infra.persistence.entity.UserIntegrationEntity;
import io.quarkus.test.TestTransaction;
import io.quarkus.test.junit.QuarkusTest;
import jakarta.inject.Inject;
import org.junit.jupiter.api.Test;

import java.time.Instant;
import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;

@QuarkusTest
public class UserIntegrationRepositoryTest {

    @Inject
    UserIntegrationRepository repository;

    @Test
    @TestTransaction
    public void testFindByUserIdAndProvider() {
        UUID userId = UUID.randomUUID();
        
        UserIntegrationEntity entity = new UserIntegrationEntity();
        entity.setId(UUID.randomUUID());
        entity.setUserId(userId);
        entity.setProvider("GOOGLE_DRIVE");
        entity.setEmail("test@gmail.com");
        entity.setRefreshToken("dummy-token");
        entity.setCreatedAt(Instant.now());
        entity.setUpdatedAt(Instant.now());
        
        repository.persist(entity);

        Optional<UserIntegrationEntity> found = repository.findByUserIdAndProviderAndEmail(userId, "GOOGLE_DRIVE", "test@gmail.com");
        
        assertTrue(found.isPresent());
        assertEquals("test@gmail.com", found.get().getEmail());
        assertEquals("dummy-token", found.get().getRefreshToken());
    }

    @Test
    @TestTransaction
    public void testRefreshTokenIsEncryptedInDatabase() {
        UUID userId = UUID.randomUUID();
        
        UserIntegrationEntity entity = new UserIntegrationEntity();
        entity.setId(UUID.randomUUID());
        entity.setUserId(userId);
        entity.setProvider("GOOGLE_DRIVE");
        entity.setEmail("enc@gmail.com");
        entity.setRefreshToken("my-secret-token");
        entity.setCreatedAt(Instant.now());
        entity.setUpdatedAt(Instant.now());
        
        repository.persist(entity);
        repository.flush();

        Optional<UserIntegrationEntity> found = repository.findByUserIdAndProviderAndEmail(userId, "GOOGLE_DRIVE", "enc@gmail.com");
        assertTrue(found.isPresent());
        assertEquals("my-secret-token", found.get().getRefreshToken());

        String rawDbValue = (String) repository.getEntityManager()
                .createNativeQuery("SELECT refresh_token FROM user_integrations WHERE user_id = :uid AND email = :email")
                .setParameter("uid", userId)
                .setParameter("email", "enc@gmail.com")
                .getSingleResult();
        
        org.junit.jupiter.api.Assertions.assertNotEquals("my-secret-token", rawDbValue);
    }
}
