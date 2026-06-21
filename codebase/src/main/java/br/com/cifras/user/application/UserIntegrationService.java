package br.com.cifras.user.application;

import br.com.cifras.user.infra.persistence.entity.UserIntegrationEntity;
import br.com.cifras.user.infra.persistence.mapper.UserIntegrationMapper;
import br.com.cifras.user.infra.persistence.repository.UserIntegrationRepository;
import br.com.cifras.user.model.UserIntegration;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import jakarta.transaction.Transactional;
import java.util.Optional;
import java.util.UUID;

@ApplicationScoped
public class UserIntegrationService {

    private final UserIntegrationRepository repository;

    @Inject
    public UserIntegrationService(UserIntegrationRepository repository) {
        this.repository = repository;
    }

    @Transactional
    public void saveGoogleToken(UUID userId, String email, String refreshToken) {
        Optional<UserIntegrationEntity> existing = repository.findByUserIdAndProvider(userId, "GOOGLE_DRIVE");
        
        if (existing.isPresent()) {
            UserIntegration domain = UserIntegrationMapper.toDomain(existing.get());
            domain.updateToken(email, refreshToken);
            UserIntegrationEntity updated = UserIntegrationMapper.toEntity(domain);
            // JPA handles updates on attached entities, but we explicitly persist via repository pattern
            repository.getEntityManager().merge(updated);
        } else {
            UserIntegration newIntegration = UserIntegration.connect(userId, "GOOGLE_DRIVE", email, refreshToken);
            repository.persist(UserIntegrationMapper.toEntity(newIntegration));
        }
    }

    public Optional<UserIntegration> getGoogleToken(UUID userId) {
        return repository.findByUserIdAndProvider(userId, "GOOGLE_DRIVE")
                .map(UserIntegrationMapper::toDomain);
    }
    
    @Transactional
    public void removeGoogleToken(UUID userId) {
        repository.findByUserIdAndProvider(userId, "GOOGLE_DRIVE")
                .ifPresent(repository::delete);
    }
}
