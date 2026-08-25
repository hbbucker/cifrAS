package br.com.cifras.admin.audit.model;

import br.com.cifras.admin.user.model.UserStatus;
import org.junit.jupiter.api.Test;

import java.time.Instant;

import static org.junit.jupiter.api.Assertions.*;

class UserAuditLogTest {

    @Test
    void shouldCreateUserAuditLogSuccessfully() {
        Instant now = Instant.now();
        UserAuditLog log = new UserAuditLog(
            "log-1",
            "user-1",
            "admin-1",
            "admin@cifras.com",
            AuditAction.BLOCK,
            "Spam persistente",
            UserStatus.ACTIVE,
            UserStatus.BLOCKED,
            now
        );

        assertEquals("log-1", log.getId());
        assertEquals("user-1", log.getUserId());
        assertEquals("admin-1", log.getAdminId());
        assertEquals("admin@cifras.com", log.getAdminEmail());
        assertEquals(AuditAction.BLOCK, log.getAction());
        assertEquals("Spam persistente", log.getReason());
        assertEquals(UserStatus.ACTIVE, log.getPreviousStatus());
        assertEquals(UserStatus.BLOCKED, log.getNewStatus());
        assertEquals(now, log.getCreatedAt());
    }

    @Test
    void shouldThrowWhenRequiredFieldsAreNull() {
        assertThrows(NullPointerException.class, () -> new UserAuditLog(
            null, null, "admin-1", "admin@cifras.com", AuditAction.BLOCK, "reason", UserStatus.ACTIVE, UserStatus.BLOCKED, null
        ));

        assertThrows(NullPointerException.class, () -> new UserAuditLog(
            null, "u-1", null, "admin@cifras.com", AuditAction.BLOCK, "reason", UserStatus.ACTIVE, UserStatus.BLOCKED, null
        ));

        assertThrows(NullPointerException.class, () -> new UserAuditLog(
            null, "u-1", "admin-1", null, AuditAction.BLOCK, "reason", UserStatus.ACTIVE, UserStatus.BLOCKED, null
        ));

        assertThrows(NullPointerException.class, () -> new UserAuditLog(
            null, "u-1", "admin-1", "admin@cifras.com", null, "reason", UserStatus.ACTIVE, UserStatus.BLOCKED, null
        ));

        assertThrows(NullPointerException.class, () -> new UserAuditLog(
            null, "u-1", "admin-1", "admin@cifras.com", AuditAction.BLOCK, null, UserStatus.ACTIVE, UserStatus.BLOCKED, null
        ));

        assertThrows(NullPointerException.class, () -> new UserAuditLog(
            null, "u-1", "admin-1", "admin@cifras.com", AuditAction.BLOCK, "reason", null, UserStatus.BLOCKED, null
        ));

        assertThrows(NullPointerException.class, () -> new UserAuditLog(
            null, "u-1", "admin-1", "admin@cifras.com", AuditAction.BLOCK, "reason", UserStatus.ACTIVE, null, null
        ));
    }

    @Test
    void shouldParseAuditAction() {
        assertEquals(AuditAction.BLOCK, AuditAction.fromString("block"));
        assertEquals(AuditAction.BLOCK, AuditAction.fromString("BLOCK"));
        assertEquals(AuditAction.UNBLOCK, AuditAction.fromString("unblock"));
        assertEquals(AuditAction.UNBLOCK, AuditAction.fromString("UNBLOCK"));

        assertThrows(IllegalArgumentException.class, () -> AuditAction.fromString(null));
        assertThrows(IllegalArgumentException.class, () -> AuditAction.fromString("UNKNOWN"));
    }
}
