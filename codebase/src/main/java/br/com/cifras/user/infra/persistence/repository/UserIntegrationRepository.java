package br.com.cifras.user.infra.persistence.repository;

import br.com.cifras.user.infra.persistence.entity.UserIntegrationEntity;
import io.quarkus.hibernate.orm.panache.PanacheRepositoryBase;
import jakarta.enterprise.context.ApplicationScoped;
import java.util.Optional;
import java.util.UUID;

@ApplicationScoped
public class UserIntegrationRepository implements PanacheRepositoryBase<UserIntegrationEntity, UUID> {

    public Optional<UserIntegrationEntity> findByUserIdAndProviderAndEmail(UUID userId, String provider, String email) {
        return find("userId = ?1 and provider = ?2 and email = ?3", userId, provider, email).firstResultOptional();
    }

    public java.util.List<UserIntegrationEntity> findAllByUserIdAndProvider(UUID userId, String provider) {
        return find("userId = ?1 and provider = ?2", userId, provider).list();
    }
}
