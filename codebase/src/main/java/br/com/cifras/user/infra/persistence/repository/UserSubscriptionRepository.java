package br.com.cifras.user.infra.persistence.repository;

import br.com.cifras.user.infra.persistence.entity.UserSubscriptionEntity;
import io.quarkus.hibernate.orm.panache.PanacheRepositoryBase;
import jakarta.enterprise.context.ApplicationScoped;

import java.util.Optional;
import java.util.UUID;

@ApplicationScoped
public class UserSubscriptionRepository implements PanacheRepositoryBase<UserSubscriptionEntity, UUID> {

    public Optional<UserSubscriptionEntity> findByUserId(String userId) {
        return find("userId = ?1", userId).firstResultOptional();
    }
}
