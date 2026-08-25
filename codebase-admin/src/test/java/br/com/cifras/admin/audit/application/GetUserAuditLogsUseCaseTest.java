package br.com.cifras.admin.audit.application;

import br.com.cifras.admin.audit.dto.UserAuditLogDTO;
import br.com.cifras.admin.audit.infra.entity.UserAuditLogEntity;
import br.com.cifras.admin.audit.infra.mapper.UserAuditLogMapper;
import br.com.cifras.admin.audit.infra.repository.UserAuditLogRepository;
import br.com.cifras.admin.shared.security.AdminSecurityUtils;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;

import java.time.Instant;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

class GetUserAuditLogsUseCaseTest {

    @Mock
    AdminSecurityUtils securityUtils;

    @Mock
    UserAuditLogRepository userAuditLogRepository;

    @Mock
    UserAuditLogMapper userAuditLogMapper;

    @InjectMocks
    GetUserAuditLogsUseCase getUserAuditLogsUseCase;

    @BeforeEach
    void setUp() {
        MockitoAnnotations.openMocks(this);
    }

    @Test
    void shouldReturnAuditLogsForUser() {
        String userId = "target-user-id";
        UserAuditLogEntity entity = new UserAuditLogEntity();
        entity.id = "log-1";
        entity.userId = userId;

        UserAuditLogDTO dto = new UserAuditLogDTO(
            "log-1", userId, "admin-1", "admin@cifras.com", "BLOCK", "Spam", "ACTIVE", "BLOCKED", Instant.now()
        );

        when(userAuditLogRepository.findByUserId(userId)).thenReturn(List.of(entity));
        when(userAuditLogMapper.toDTOList(List.of(entity))).thenReturn(List.of(dto));

        List<UserAuditLogDTO> result = getUserAuditLogsUseCase.execute(userId);

        assertNotNull(result);
        assertEquals(1, result.size());
        assertEquals("log-1", result.get(0).id());
        verify(securityUtils).requireAdmin();
        verify(userAuditLogRepository).findByUserId(userId);
    }

    @Test
    void shouldFailWhenUserIdIsNull() {
        IllegalArgumentException ex = assertThrows(IllegalArgumentException.class, () -> {
            getUserAuditLogsUseCase.execute(null);
        });
        assertEquals("User ID is required", ex.getMessage());
    }
}
