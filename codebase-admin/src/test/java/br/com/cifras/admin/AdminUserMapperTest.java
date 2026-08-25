package br.com.cifras.admin;

import br.com.cifras.admin.user.dto.AdminUserDTO;
import br.com.cifras.admin.user.infra.mapper.AdminUserMapper;
import br.com.cifras.admin.user.model.AdminUser;
import br.com.cifras.admin.user.model.UserStatus;
import org.junit.jupiter.api.Test;

import java.time.Instant;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;

public class AdminUserMapperTest {

    private final AdminUserMapper mapper = new AdminUserMapper();

    @Test
    void shouldMapUserToDTO() {
        AdminUser user = new AdminUser(
            "admin-uuid",
            "admin@cifras.com",
            "Admin User",
            "admin",
            Instant.now(),
            Instant.now(),
            42,
            UserStatus.BLOCKED,
            true,
            "Spam reason",
            Instant.now()
        );

        AdminUserDTO dto = mapper.toDTO(user);
        assertNotNull(dto);
        assertEquals("admin-uuid", dto.id());
        assertEquals("admin@cifras.com", dto.email());
        assertEquals("Admin User", dto.fullName());
        assertEquals("admin", dto.role());
        assertTrue(dto.isAdmin());
        assertEquals(42, dto.songCount());
        assertTrue(dto.banned());
        assertTrue(dto.isBlocked());
        assertEquals("BLOCKED", dto.status());
        assertEquals("Spam reason", dto.lastBlockReason());
        assertNotNull(dto.updatedAt());
    }

    @Test
    void shouldMapUserList() {
        AdminUser user1 = new AdminUser("1", "u1@cifras.com", "U1", "user", Instant.now(), null, 2, false);
        AdminUser user2 = new AdminUser("2", "u2@cifras.com", "U2", "admin", Instant.now(), null, 5, false);

        List<AdminUserDTO> list = mapper.toDTOList(List.of(user1, user2));
        assertEquals(2, list.size());
        assertFalse(list.get(0).isAdmin());
        assertTrue(list.get(1).isAdmin());
    }

    @Test
    void shouldHandleNullInputs() {
        assertNull(mapper.toDTO(null));
        assertTrue(mapper.toDTOList(null).isEmpty());
    }
}
