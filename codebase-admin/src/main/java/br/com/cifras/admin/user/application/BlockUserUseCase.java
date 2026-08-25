package br.com.cifras.admin.user.application;

import br.com.cifras.admin.audit.infra.mapper.UserAuditLogMapper;
import br.com.cifras.admin.audit.infra.repository.UserAuditLogRepository;
import br.com.cifras.admin.audit.model.AuditAction;
import br.com.cifras.admin.audit.model.UserAuditLog;
import br.com.cifras.admin.shared.exception.ResourceNotFoundException;
import br.com.cifras.admin.shared.security.AdminSecurityUtils;
import br.com.cifras.admin.user.dto.AdminUserDTO;
import br.com.cifras.admin.user.infra.mapper.AdminUserMapper;
import br.com.cifras.admin.user.infra.repository.AdminUserRepository;
import br.com.cifras.admin.user.model.AdminUser;
import br.com.cifras.admin.user.model.UserStatus;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import jakarta.transaction.Transactional;

import java.time.Instant;

@ApplicationScoped
public class BlockUserUseCase {

    @Inject
    AdminSecurityUtils securityUtils;

    @Inject
    AdminUserRepository adminUserRepository;

    @Inject
    UserAuditLogRepository userAuditLogRepository;

    @Inject
    AdminUserMapper adminUserMapper;

    @Inject
    UserAuditLogMapper userAuditLogMapper;

    @Transactional
    public AdminUserDTO execute(String targetUserId, String reason) {
        securityUtils.requireAdmin();

        String adminId = securityUtils.getCurrentUserId();
        String adminEmail = securityUtils.getCurrentUserEmail();
        if (adminEmail == null || adminEmail.isBlank()) {
            adminEmail = adminId != null ? adminId : "admin@cifras.com";
        }

        if (targetUserId == null || targetUserId.isBlank()) {
            throw new IllegalArgumentException("User ID is required");
        }

        if (targetUserId.equals(adminId)) {
            throw new IllegalArgumentException("CANNOT_BLOCK_SELF");
        }

        if (reason == null || reason.trim().length() < 5 || reason.trim().length() > 1000) {
            throw new IllegalArgumentException("INVALID_REASON_LENGTH");
        }

        AdminUser user = adminUserRepository.findById(targetUserId)
            .orElseThrow(() -> new ResourceNotFoundException("User not found: " + targetUserId));

        UserStatus previousStatus = user.getStatus();
        user.block(reason, adminId);
        adminUserRepository.updateStatus(user);

        UserAuditLog auditLog = new UserAuditLog(
            null,
            targetUserId,
            adminId,
            adminEmail,
            AuditAction.BLOCK,
            reason.trim(),
            previousStatus,
            user.getStatus(),
            Instant.now()
        );

        userAuditLogRepository.persist(userAuditLogMapper.toEntity(auditLog));

        return adminUserMapper.toDTO(user);
    }
}
