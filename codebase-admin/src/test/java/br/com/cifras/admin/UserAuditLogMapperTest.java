package br.com.cifras.admin;

import br.com.cifras.admin.audit.dto.UserAuditLogDTO;
import br.com.cifras.admin.audit.infra.entity.UserAuditLogEntity;
import br.com.cifras.admin.audit.infra.mapper.UserAuditLogMapper;
import br.com.cifras.admin.audit.model.AuditAction;
import br.com.cifras.admin.audit.model.UserAuditLog;
import br.com.cifras.admin.user.model.UserStatus;
import org.junit.jupiter.api.Test;

import java.time.Instant;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;

class UserAuditLogMapperTest {

    private final UserAuditLogMapper mapper = new UserAuditLogMapper();

    @Test
    void shouldMapEntityToDomainAndDTO() {
        Instant now = Instant.now();
        UserAuditLogEntity entity = new UserAuditLogEntity();
        entity.id = "log-1";
        entity.userId = "user-1";
        entity.adminId = "admin-1";
        entity.adminEmail = "admin@cifras.com";
        entity.action = "BLOCK";
        entity.reason = "Spam";
        entity.previousStatus = "ACTIVE";
        entity.newStatus = "BLOCKED";
        entity.createdAt = now;

        UserAuditLog domain = mapper.toDomain(entity);
        assertNotNull(domain);
        assertEquals("log-1", domain.getId());
        assertEquals("user-1", domain.getUserId());
        assertEquals(AuditAction.BLOCK, domain.getAction());
        assertEquals(UserStatus.ACTIVE, domain.getPreviousStatus());
        assertEquals(UserStatus.BLOCKED, domain.getNewStatus());

        UserAuditLogDTO dto = mapper.toDTO(domain);
        assertNotNull(dto);
        assertEquals("log-1", dto.id());
        assertEquals("user-1", dto.userId());
        assertEquals("BLOCK", dto.action());
        assertEquals("ACTIVE", dto.previousStatus());
        assertEquals("BLOCKED", dto.newStatus());

        UserAuditLogDTO dtoFromEntity = mapper.toDTO(entity);
        assertNotNull(dtoFromEntity);
        assertEquals("log-1", dtoFromEntity.id());

        UserAuditLogEntity convertedEntity = mapper.toEntity(domain);
        assertNotNull(convertedEntity);
        assertEquals("log-1", convertedEntity.id);
        assertEquals("BLOCK", convertedEntity.action);
    }

    @Test
    void shouldMapListAndHandleNulls() {
        assertNull(mapper.toDomain(null));
        assertNull(mapper.toEntity(null));
        assertNull(mapper.toDTO((UserAuditLog) null));
        assertNull(mapper.toDTO((UserAuditLogEntity) null));
        assertTrue(mapper.toDTOList(null).isEmpty());

        UserAuditLogEntity entity = new UserAuditLogEntity();
        entity.id = "1";
        entity.userId = "u1";
        entity.adminId = "a1";
        entity.adminEmail = "a1@cifras.com";
        entity.action = "UNBLOCK";
        entity.reason = "Ok";
        entity.previousStatus = "BLOCKED";
        entity.newStatus = "ACTIVE";
        entity.createdAt = Instant.now();

        List<UserAuditLogDTO> dtos = mapper.toDTOList(List.of(entity));
        assertEquals(1, dtos.size());
        assertEquals("UNBLOCK", dtos.get(0).action());
    }
}
