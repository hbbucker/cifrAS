package br.com.cifras.admin.audit.infra.mapper;

import br.com.cifras.admin.audit.dto.UserAuditLogDTO;
import br.com.cifras.admin.audit.infra.entity.UserAuditLogEntity;
import br.com.cifras.admin.audit.model.AuditAction;
import br.com.cifras.admin.audit.model.UserAuditLog;
import br.com.cifras.admin.user.model.UserStatus;
import jakarta.enterprise.context.ApplicationScoped;

import java.util.List;

@ApplicationScoped
public class UserAuditLogMapper {

    public UserAuditLog toDomain(UserAuditLogEntity entity) {
        if (entity == null) return null;
        return new UserAuditLog(
            entity.id,
            entity.userId,
            entity.adminId,
            entity.adminEmail,
            AuditAction.fromString(entity.action),
            entity.reason,
            UserStatus.fromString(entity.previousStatus),
            UserStatus.fromString(entity.newStatus),
            entity.createdAt
        );
    }

    public UserAuditLogEntity toEntity(UserAuditLog domain) {
        if (domain == null) return null;
        UserAuditLogEntity entity = new UserAuditLogEntity();
        entity.id = domain.getId();
        entity.userId = domain.getUserId();
        entity.adminId = domain.getAdminId();
        entity.adminEmail = domain.getAdminEmail();
        entity.action = domain.getAction().name();
        entity.reason = domain.getReason();
        entity.previousStatus = domain.getPreviousStatus().name();
        entity.newStatus = domain.getNewStatus().name();
        entity.createdAt = domain.getCreatedAt();
        return entity;
    }

    public UserAuditLogDTO toDTO(UserAuditLog domain) {
        if (domain == null) return null;
        return new UserAuditLogDTO(
            domain.getId(),
            domain.getUserId(),
            domain.getAdminId(),
            domain.getAdminEmail(),
            domain.getAction().name(),
            domain.getReason(),
            domain.getPreviousStatus().name(),
            domain.getNewStatus().name(),
            domain.getCreatedAt()
        );
    }

    public UserAuditLogDTO toDTO(UserAuditLogEntity entity) {
        if (entity == null) return null;
        return new UserAuditLogDTO(
            entity.id,
            entity.userId,
            entity.adminId,
            entity.adminEmail,
            entity.action,
            entity.reason,
            entity.previousStatus,
            entity.newStatus,
            entity.createdAt
        );
    }

    public List<UserAuditLogDTO> toDTOList(List<UserAuditLogEntity> entities) {
        if (entities == null) return List.of();
        return entities.stream().map(this::toDTO).toList();
    }
}
