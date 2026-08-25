package br.com.cifras.admin.user.model;

import org.junit.jupiter.api.Test;

import java.time.Instant;

import static org.junit.jupiter.api.Assertions.*;

class AdminUserTest {

    @Test
    void shouldCreateAdminUserWithDefaultAndCustomValues() {
        AdminUser user = new AdminUser(
            "user-1",
            "user1@cifras.com",
            "User One",
            "user",
            Instant.now(),
            null,
            10,
            UserStatus.ACTIVE,
            false,
            null,
            null
        );

        assertEquals("user-1", user.getId());
        assertEquals("user1@cifras.com", user.getEmail());
        assertEquals("User One", user.getFullName());
        assertEquals("user", user.getRole());
        assertEquals(UserStatus.ACTIVE, user.getStatus());
        assertFalse(user.isBlocked());
        assertFalse(user.isBanned());
        assertNull(user.getLastBlockReason());
        assertEquals(10, user.getSongCount());
        assertFalse(user.isAdmin());
        assertNotNull(user.getUpdatedAt());
    }

    @Test
    void shouldBlockUserSuccessfully() {
        AdminUser user = new AdminUser(
            "user-1",
            "user1@cifras.com",
            "User One",
            "user",
            Instant.now(),
            null,
            5,
            false
        );

        user.block("Violação de conduta e spam.", "admin-1");

        assertEquals(UserStatus.BLOCKED, user.getStatus());
        assertTrue(user.isBlocked());
        assertTrue(user.isBanned());
        assertEquals("Violação de conduta e spam.", user.getLastBlockReason());
    }

    @Test
    void shouldThrowExceptionWhenAdminAttemptsSelfBlock() {
        AdminUser admin = new AdminUser(
            "admin-123",
            "admin@cifras.com",
            "Admin",
            "admin",
            Instant.now(),
            null,
            0,
            false
        );

        IllegalArgumentException ex = assertThrows(IllegalArgumentException.class, () -> {
            admin.block("Spam", "admin-123");
        });

        assertEquals("CANNOT_BLOCK_SELF", ex.getMessage());
    }

    @Test
    void shouldThrowExceptionWhenReasonIsTooShort() {
        AdminUser user = new AdminUser(
            "user-1",
            "user1@cifras.com",
            "User One",
            "user",
            Instant.now(),
            null,
            5,
            false
        );

        IllegalArgumentException ex = assertThrows(IllegalArgumentException.class, () -> {
            user.block("abc", "admin-1");
        });
        assertEquals("INVALID_REASON_LENGTH", ex.getMessage());

        IllegalArgumentException exNull = assertThrows(IllegalArgumentException.class, () -> {
            user.block(null, "admin-1");
        });
        assertEquals("INVALID_REASON_LENGTH", exNull.getMessage());
    }

    @Test
    void shouldThrowExceptionWhenReasonIsTooLong() {
        AdminUser user = new AdminUser(
            "user-1",
            "user1@cifras.com",
            "User One",
            "user",
            Instant.now(),
            null,
            5,
            false
        );

        String tooLong = "a".repeat(1001);
        IllegalArgumentException ex = assertThrows(IllegalArgumentException.class, () -> {
            user.block(tooLong, "admin-1");
        });
        assertEquals("INVALID_REASON_LENGTH", ex.getMessage());
    }

    @Test
    void shouldUnblockUserSuccessfully() {
        AdminUser user = new AdminUser(
            "user-1",
            "user1@cifras.com",
            "User One",
            "user",
            Instant.now(),
            null,
            5,
            UserStatus.BLOCKED,
            true,
            "Motivo anterior",
            Instant.now()
        );

        user.unblock("Recurso atendido", "admin-1");

        assertEquals(UserStatus.ACTIVE, user.getStatus());
        assertFalse(user.isBlocked());
        assertFalse(user.isBanned());
        assertNull(user.getLastBlockReason());
    }

    @Test
    void shouldParseUserStatusFromString() {
        assertEquals(UserStatus.ACTIVE, UserStatus.fromString("active"));
        assertEquals(UserStatus.ACTIVE, UserStatus.fromString("ACTIVE"));
        assertEquals(UserStatus.BLOCKED, UserStatus.fromString("blocked"));
        assertEquals(UserStatus.BLOCKED, UserStatus.fromString("BLOCKED"));
        assertEquals(UserStatus.ACTIVE, UserStatus.fromString(null));
        assertEquals(UserStatus.ACTIVE, UserStatus.fromString(""));
        assertEquals(UserStatus.ACTIVE, UserStatus.fromString("unknown"));
    }
}
