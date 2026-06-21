package br.com.cifras.user.application;

import br.com.cifras.user.infra.persistence.entity.UserIntegrationEntity;
import br.com.cifras.user.infra.persistence.repository.UserIntegrationRepository;
import br.com.cifras.user.model.UserIntegration;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.ArgumentCaptor;
import org.mockito.Mockito;

import java.time.Instant;
import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

public class UserIntegrationServiceTest {

    private UserIntegrationRepository repository;
    private UserIntegrationService service;

    @BeforeEach
    public void setup() {
        repository = Mockito.mock(UserIntegrationRepository.class);
        service = new UserIntegrationService(repository);
    }

    @Test
    public void testSaveGoogleToken_NewIntegration() {
        UUID userId = UUID.randomUUID();
        when(repository.findByUserIdAndProvider(userId, "GOOGLE_DRIVE")).thenReturn(Optional.empty());

        service.saveGoogleToken(userId, "test@gmail.com", "token123");

        ArgumentCaptor<UserIntegrationEntity> captor = ArgumentCaptor.forClass(UserIntegrationEntity.class);
        verify(repository).persist(captor.capture());

        UserIntegrationEntity saved = captor.getValue();
        assertEquals(userId, saved.getUserId());
        assertEquals("test@gmail.com", saved.getEmail());
        assertEquals("token123", saved.getRefreshToken());
        assertEquals("GOOGLE_DRIVE", saved.getProvider());
    }

    @Test
    public void testGetGoogleToken() {
        UUID userId = UUID.randomUUID();
        UserIntegrationEntity entity = new UserIntegrationEntity();
        entity.setId(UUID.randomUUID());
        entity.setUserId(userId);
        entity.setProvider("GOOGLE_DRIVE");
        entity.setEmail("test@gmail.com");
        entity.setRefreshToken("token123");
        entity.setCreatedAt(Instant.now());
        entity.setUpdatedAt(Instant.now());

        when(repository.findByUserIdAndProvider(userId, "GOOGLE_DRIVE")).thenReturn(Optional.of(entity));

        Optional<UserIntegration> result = service.getGoogleToken(userId);

        assertTrue(result.isPresent());
        assertEquals("test@gmail.com", result.get().getEmail());
        assertEquals("token123", result.get().getRefreshToken());
    }
}
