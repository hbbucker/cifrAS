package br.com.cifras.shared.security;

import br.com.cifras.BaseIntegrationTest;
import io.quarkus.test.junit.QuarkusTest;
import jakarta.inject.Inject;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.*;

@QuarkusTest
class UserServiceBlockedAccountTest extends BaseIntegrationTest {

    @Inject
    UserService userService;

    @Test
    @DisplayName("isUserBlocked returns false for non-blocked user or null")
    void testIsUserBlockedReturnsFalseForActiveUser() {
        assertFalse(userService.isUserBlocked(null));
        assertFalse(userService.isUserBlocked(""));
        assertFalse(userService.isUserBlocked("non-existent-user-12345"));
    }
}
