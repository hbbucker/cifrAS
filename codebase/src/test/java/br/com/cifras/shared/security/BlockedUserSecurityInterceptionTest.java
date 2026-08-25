package br.com.cifras.shared.security;

import br.com.cifras.BaseIntegrationTest;
import io.quarkus.test.InjectMock;
import io.quarkus.test.junit.QuarkusTest;
import io.quarkus.test.security.TestSecurity;
import io.restassured.http.ContentType;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import java.util.Map;

import static io.restassured.RestAssured.given;
import static org.hamcrest.Matchers.*;
import static org.mockito.Mockito.when;

@QuarkusTest
class BlockedUserSecurityInterceptionTest extends BaseIntegrationTest {

    @InjectMock
    UserService userService;

    @Test
    @DisplayName("Blocked user is rejected with HTTP 403 ACCOUNT_BLOCKED on authenticated endpoints")
    @TestSecurity(user = "blocked-user-uuid", roles = {"user"})
    void testBlockedUserRejectedOnProtectedEndpoint() {
        when(userService.isUserBlocked("blocked-user-uuid")).thenReturn(true);

        given()
            .contentType(ContentType.JSON)
        .when()
            .get("/internal/ping")
        .then()
            .statusCode(403)
            .body("error", equalTo("ACCOUNT_BLOCKED"))
            .body("status", equalTo(403));
    }

    @Test
    @DisplayName("Active user is permitted to access protected endpoints")
    @TestSecurity(user = "active-user-uuid", roles = {"user"})
    void testActiveUserPermitted() {
        when(userService.isUserBlocked("active-user-uuid")).thenReturn(false);

        given()
            .contentType(ContentType.JSON)
        .when()
            .get("/internal/ping")
        .then()
            .statusCode(200);
    }

    @Test
    @DisplayName("Blocked user login attempt fails with 403 ACCOUNT_BLOCKED")
    void testBlockedUserLoginRejected() {
        String email = "blocked@cifras.com";
        String fakeUserId = java.util.UUID.nameUUIDFromBytes(email.getBytes()).toString();
        when(userService.isUserBlocked(fakeUserId)).thenReturn(true);

        given()
            .contentType(ContentType.JSON)
            .body(Map.of("email", email, "password", "Secret123!"))
        .when()
            .post("/auth/login")
        .then()
            .statusCode(403)
            .body("error", equalTo("ACCOUNT_BLOCKED"));
    }
}
