package br.com.cifras.admin.shared.security;

import br.com.cifras.admin.shared.exception.AdminForbiddenException;
import io.quarkus.test.junit.QuarkusTest;
import io.quarkus.test.security.TestSecurity;
import jakarta.inject.Inject;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.*;

@QuarkusTest
class AdminSecurityUtilsTest {

    @Inject
    AdminSecurityUtils securityUtils;

    @Test
    @DisplayName("isAdmin returns true for principal with admin role")
    @TestSecurity(user = "admin@cifras.com", roles = {"admin"})
    void testIsAdminWithAdminRole() {
        assertTrue(securityUtils.isAdmin());
        assertDoesNotThrow(() -> securityUtils.requireAdmin());
    }

    @Test
    @DisplayName("isAdmin returns false for non-admin user")
    @TestSecurity(user = "user@gmail.com", roles = {"user"})
    void testIsAdminWithUserRole() {
        assertFalse(securityUtils.isAdmin());
        assertThrows(AdminForbiddenException.class, () -> securityUtils.requireAdmin());
    }
}
