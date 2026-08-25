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

class BlockUserUseCaseTest {

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
    BlockUserUseCase blockUserUseCase;

    @BeforeEach
    void setUp() {
        MockitoAnnotations.openMocks(this);
    }

    @Test
    void shouldBlockUserSuccessfully() {
        String targetUserId = "user-to-block";
        String adminId = "admin-user-id";
        String adminEmail = "admin@cifras.com";
        String reason = "Publicação de conteúdo inapropriado recorrente.";

        AdminUser targetUser = new AdminUser(
            targetUserId, "user@cifras.com", "User Target", "user",
            Instant.now(), Instant.now(), 5, UserStatus.ACTIVE, false, null, Instant.now()
        );

        when(securityUtils.getCurrentUserId()).thenReturn(adminId);
        when(securityUtils.getCurrentUserEmail()).thenReturn(adminEmail);
        when(adminUserRepository.findById(targetUserId)).thenReturn(Optional.of(targetUser));
        when(userAuditLogMapper.toEntity(any())).thenReturn(new UserAuditLogEntity());
        when(adminUserMapper.toDTO(any())).thenReturn(new AdminUserDTO(
            targetUserId, "user@cifras.com", "User Target", "user", "BLOCKED", true, reason,
            Instant.now(), Instant.now(), Instant.now(), 5, true, false
        ));

        AdminUserDTO result = blockUserUseCase.execute(targetUserId, reason);

        assertNotNull(result);
        assertEquals("BLOCKED", result.status());
        assertTrue(result.isBlocked());
        verify(securityUtils).requireAdmin();
        verify(adminUserRepository).updateStatus(targetUser);
        verify(userAuditLogRepository).persist(any(UserAuditLogEntity.class));
    }

    @Test
    void shouldFailWhenTargetIsAdminHimself() {
        String adminId = "admin-user-id";
        when(securityUtils.getCurrentUserId()).thenReturn(adminId);
        when(securityUtils.getCurrentUserEmail()).thenReturn("admin@cifras.com");

        IllegalArgumentException ex = assertThrows(IllegalArgumentException.class, () -> {
            blockUserUseCase.execute(adminId, "Violação de regras.");
        });

        assertEquals("CANNOT_BLOCK_SELF", ex.getMessage());
        verify(adminUserRepository, never()).updateStatus(any());
        verify(userAuditLogRepository, never()).persist(any(UserAuditLogEntity.class));
    }

    @Test
    void shouldFailWhenReasonIsInvalid() {
        when(securityUtils.getCurrentUserId()).thenReturn("admin-user-id");

        IllegalArgumentException exShort = assertThrows(IllegalArgumentException.class, () -> {
            blockUserUseCase.execute("target-id", "abc");
        });
        assertEquals("INVALID_REASON_LENGTH", exShort.getMessage());

        IllegalArgumentException exNull = assertThrows(IllegalArgumentException.class, () -> {
            blockUserUseCase.execute("target-id", null);
        });
        assertEquals("INVALID_REASON_LENGTH", exNull.getMessage());
    }

    @Test
    void shouldFailWhenTargetUserIdIsNull() {
        when(securityUtils.getCurrentUserId()).thenReturn("admin-user-id");

        IllegalArgumentException ex = assertThrows(IllegalArgumentException.class, () -> {
            blockUserUseCase.execute(null, "Motivo válido");
        });
        assertEquals("User ID is required", ex.getMessage());
    }

    @Test
    void shouldFailWhenTargetUserNotFound() {
        String targetUserId = "unknown-id";
        when(securityUtils.getCurrentUserId()).thenReturn("admin-user-id");
        when(securityUtils.getCurrentUserEmail()).thenReturn("admin@cifras.com");
        when(adminUserRepository.findById(targetUserId)).thenReturn(Optional.empty());

        assertThrows(ResourceNotFoundException.class, () -> {
            blockUserUseCase.execute(targetUserId, "Motivo válido");
        });
    }
}
