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

        Optional<UserIntegrationEntity> found = repository.findByUserIdAndProvider(userId, "GOOGLE_DRIVE");
        
        assertTrue(found.isPresent());
        assertEquals("test@gmail.com", found.get().getEmail());
        assertEquals("dummy-token", found.get().getRefreshToken());
    }
}
