package br.com.cifras.admin.audit.application;

import br.com.cifras.admin.audit.dto.UserAuditLogDTO;
import br.com.cifras.admin.audit.infra.entity.UserAuditLogEntity;
import br.com.cifras.admin.audit.infra.mapper.UserAuditLogMapper;
import br.com.cifras.admin.audit.infra.repository.UserAuditLogRepository;
import br.com.cifras.admin.shared.security.AdminSecurityUtils;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;

import java.util.List;

@ApplicationScoped
public class GetUserAuditLogsUseCase {

    @Inject
    AdminSecurityUtils securityUtils;

    @Inject
    UserAuditLogRepository userAuditLogRepository;

    @Inject
    UserAuditLogMapper userAuditLogMapper;

    public List<UserAuditLogDTO> execute(String userId) {
        securityUtils.requireAdmin();

        if (userId == null || userId.isBlank()) {
            throw new IllegalArgumentException("User ID is required");
        }

        List<UserAuditLogEntity> logs = userAuditLogRepository.findByUserId(userId.trim());
        return userAuditLogMapper.toDTOList(logs);
    }
}
