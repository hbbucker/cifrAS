package br.com.cifras.admin.user.application;

import br.com.cifras.admin.audit.infra.entity.UserAuditLogEntity;
import br.com.cifras.admin.audit.infra.mapper.UserAuditLogMapper;
import br.com.cifras.admin.audit.infra.repository.UserAuditLogRepository;
import br.com.cifras.admin.shared.exception.ResourceNotFoundException;
import br.com.cifras.admin.shared.security.AdminSecurityUtils;
import br.com.cifras.admin.user.dto.AdminUserDTO;
import br.com.cifras.admin.user.infra.mapper.AdminUserMapper;
import br.com.cifras.admin.user.infra.repository.AdminUserRepository;
import br.com.cifras.admin.user.model.AdminUser;
import br.com.cifras.admin.user.model.UserStatus;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;

import java.time.Instant;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

class UnblockUserUseCaseTest {

    @Mock
    AdminSecurityUtils securityUtils;

    @Mock
    AdminUserRepository adminUserRepository;

    @Mock
    UserAuditLogRepository userAuditLogRepository;

    @Mock
    AdminUserMapper adminUserMapper;

    @Mock
    UserAuditLogMapper userAuditLogMapper;

    @InjectMocks
    UnblockUserUseCase unblockUserUseCase;

    @BeforeEach
    void setUp() {
        MockitoAnnotations.openMocks(this);
    }

    @Test
    void shouldUnblockUserSuccessfully() {
        String targetUserId = "user-to-unblock";
        String adminId = "admin-user-id";
        String adminEmail = "admin@cifras.com";
        String reason = "Recurso acatado pela moderação.";

        AdminUser targetUser = new AdminUser(
            targetUserId, "user@cifras.com", "User Target", "user",
            Instant.now(), Instant.now(), 5, UserStatus.BLOCKED, true, "Motivo anterior", Instant.now()
        );

        when(securityUtils.getCurrentUserId()).thenReturn(adminId);
        when(securityUtils.getCurrentUserEmail()).thenReturn(adminEmail);
        when(adminUserRepository.findById(targetUserId)).thenReturn(Optional.of(targetUser));
        when(userAuditLogMapper.toEntity(any())).thenReturn(new UserAuditLogEntity());
        when(adminUserMapper.toDTO(any())).thenReturn(new AdminUserDTO(
            targetUserId, "user@cifras.com", "User Target", "user", "ACTIVE", false, null,
            Instant.now(), Instant.now(), Instant.now(), 5, false, false
        ));

        AdminUserDTO result = unblockUserUseCase.execute(targetUserId, reason);

        assertNotNull(result);
        assertEquals("ACTIVE", result.status());
        assertFalse(result.isBlocked());
        verify(securityUtils).requireAdmin();
        verify(adminUserRepository).updateStatus(targetUser);
        verify(userAuditLogRepository).persist(any(UserAuditLogEntity.class));
    }

    @Test
    void shouldUnblockUserWithDefaultReasonWhenNullOrEmpty() {
        String targetUserId = "user-to-unblock";
        AdminUser targetUser = new AdminUser(
            targetUserId, "user@cifras.com", "User Target", "user",
            Instant.now(), Instant.now(), 5, UserStatus.BLOCKED, true, "Motivo anterior", Instant.now()
        );

        when(securityUtils.getCurrentUserId()).thenReturn("admin-1");
        when(securityUtils.getCurrentUserEmail()).thenReturn(null);
        when(adminUserRepository.findById(targetUserId)).thenReturn(Optional.of(targetUser));
        when(userAuditLogMapper.toEntity(any())).thenReturn(new UserAuditLogEntity());
        when(adminUserMapper.toDTO(any())).thenReturn(new AdminUserDTO(
            targetUserId, "user@cifras.com", "User Target", "user", "ACTIVE", false, null,
            Instant.now(), Instant.now(), Instant.now(), 5, false, false
        ));

        AdminUserDTO result = unblockUserUseCase.execute(targetUserId, "  ");

        assertNotNull(result);
        verify(userAuditLogRepository).persist(any(UserAuditLogEntity.class));
    }

    @Test
    void shouldFailWhenTargetUserIdIsNull() {
        IllegalArgumentException ex = assertThrows(IllegalArgumentException.class, () -> {
            unblockUserUseCase.execute(null, "Motivo");
        });
        assertEquals("User ID is required", ex.getMessage());
    }

    @Test
    void shouldFailWhenTargetUserNotFound() {
        String targetUserId = "unknown-id";
        when(securityUtils.getCurrentUserId()).thenReturn("admin-user-id");
        when(adminUserRepository.findById(targetUserId)).thenReturn(Optional.empty());

        assertThrows(ResourceNotFoundException.class, () -> {
            unblockUserUseCase.execute(targetUserId, "Motivo");
        });
    }
}
