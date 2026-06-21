package br.com.cifras.user.infra.persistence.repository;

import br.com.cifras.user.infra.persistence.entity.UserIntegrationEntity;
import io.quarkus.hibernate.orm.panache.PanacheRepositoryBase;
import jakarta.enterprise.context.ApplicationScoped;
import java.util.Optional;
import java.util.UUID;

@ApplicationScoped
public class UserIntegrationRepository implements PanacheRepositoryBase<UserIntegrationEntity, UUID> {

    public Optional<UserIntegrationEntity> findByUserIdAndProvider(UUID userId, String provider) {
        return find("userId = ?1 and provider = ?2", userId, provider).firstResultOptional();
    }
}
