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
        Optional<UserIntegrationEntity> existing = repository.findByUserIdAndProviderAndEmail(userId, "GOOGLE_DRIVE", email);
        
        if (existing.isPresent()) {
            UserIntegration domain = UserIntegrationMapper.toDomain(existing.get());
            domain.updateToken(email, refreshToken);
            UserIntegrationEntity updated = UserIntegrationMapper.toEntity(domain);
            repository.getEntityManager().merge(updated);
        } else {
            UserIntegration newIntegration = UserIntegration.connect(userId, "GOOGLE_DRIVE", email, refreshToken);
            repository.persist(UserIntegrationMapper.toEntity(newIntegration));
        }
    }

    public java.util.List<UserIntegration> getGoogleTokens(UUID userId) {
        return repository.findAllByUserIdAndProvider(userId, "GOOGLE_DRIVE")
                .stream()
                .map(UserIntegrationMapper::toDomain)
                .toList();
    }

    public Optional<UserIntegration> getGoogleToken(UUID userId, String email) {
        return repository.findByUserIdAndProviderAndEmail(userId, "GOOGLE_DRIVE", email)
                .map(UserIntegrationMapper::toDomain);
    }
    
    @Transactional
    public void removeGoogleToken(UUID userId, String email) {
        repository.findByUserIdAndProviderAndEmail(userId, "GOOGLE_DRIVE", email)
                .ifPresent(repository::delete);
    }
}
