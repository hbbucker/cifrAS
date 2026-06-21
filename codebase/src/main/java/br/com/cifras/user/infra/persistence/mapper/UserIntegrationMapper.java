package br.com.cifras.user.infra.persistence.mapper;

import br.com.cifras.user.infra.persistence.entity.UserIntegrationEntity;
import br.com.cifras.user.model.UserIntegration;

public class UserIntegrationMapper {

    public static UserIntegration toDomain(UserIntegrationEntity entity) {
        if (entity == null) {
            return null;
        }
        return new UserIntegration(
            entity.getId(),
            entity.getUserId(),
            entity.getProvider(),
            entity.getEmail(),
            entity.getRefreshToken(),
            entity.getCreatedAt(),
            entity.getUpdatedAt()
        );
    }

    public static UserIntegrationEntity toEntity(UserIntegration domain) {
        if (domain == null) {
            return null;
        }
        UserIntegrationEntity entity = new UserIntegrationEntity();
        entity.setId(domain.getId());
        entity.setUserId(domain.getUserId());
        entity.setProvider(domain.getProvider());
        entity.setEmail(domain.getEmail());
        entity.setRefreshToken(domain.getRefreshToken());
        entity.setCreatedAt(domain.getCreatedAt());
        entity.setUpdatedAt(domain.getUpdatedAt());
        return entity;
    }
}
