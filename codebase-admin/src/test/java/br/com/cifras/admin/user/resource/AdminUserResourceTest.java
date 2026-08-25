package br.com.cifras.admin.user.resource;

import io.quarkus.test.junit.QuarkusTest;
import io.quarkus.test.security.TestSecurity;
import io.restassured.http.ContentType;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import java.util.Map;

import static io.restassured.RestAssured.given;
import static org.hamcrest.Matchers.*;

@QuarkusTest
class AdminUserResourceTest {

    @Test
    @DisplayName("GET /api/admin/users returns 200 and list for admin")
    @TestSecurity(user = "admin@cifras.com", roles = {"admin"})
    void testListUsersAsAdmin() {
        given()
            .contentType(ContentType.JSON)
        .when()
            .get("/api/admin/users")
        .then()
            .statusCode(200)
            .body("items", notNullValue())
            .body("totalElements", notNullValue());
    }

    @Test
    @DisplayName("GET /api/admin/users/{id} returns 200 for existing user")
    @TestSecurity(user = "admin@cifras.com", roles = {"admin"})
    void testGetUserAsAdmin() {
        given()
            .contentType(ContentType.JSON)
        .when()
            .get("/api/admin/users/user-1")
        .then()
            .statusCode(200)
            .body("id", equalTo("user-1"))
            .body("email", notNullValue());
    }

    @Test
    @DisplayName("POST /api/admin/users/{id}/block succeeds with valid reason")
    @TestSecurity(user = "admin@cifras.com", roles = {"admin"})
    void testBlockUserSuccess() {
        given()
            .contentType(ContentType.JSON)
            .body(Map.of("reason", "Violação recorrente de conduta e termos de uso."))
        .when()
            .post("/api/admin/users/user-1/block")
        .then()
            .statusCode(200)
            .body("id", equalTo("user-1"))
            .body("status", equalTo("BLOCKED"))
            .body("isBlocked", equalTo(true))
            .body("lastBlockReason", equalTo("Violação recorrente de conduta e termos de uso."));
    }

    @Test
    @DisplayName("POST /api/admin/users/{id}/block rejects self-blocking")
    @TestSecurity(user = "admin-user-id", roles = {"admin"})
    void testBlockSelfRejection() {
        given()
            .contentType(ContentType.JSON)
            .body(Map.of("reason", "Tentativa de auto-bloqueio."))
        .when()
            .post("/api/admin/users/admin-user-id/block")
        .then()
            .statusCode(400)
            .body("error", equalTo("CANNOT_BLOCK_SELF"));
    }

    @Test
    @DisplayName("POST /api/admin/users/{id}/block rejects reason shorter than 5 chars")
    @TestSecurity(user = "admin@cifras.com", roles = {"admin"})
    void testBlockShortReasonRejection() {
        given()
            .contentType(ContentType.JSON)
            .body(Map.of("reason", "spam"))
        .when()
            .post("/api/admin/users/user-1/block")
        .then()
            .statusCode(400);
    }

    @Test
    @DisplayName("POST /api/admin/users/{id}/unblock succeeds and restores status to ACTIVE")
    @TestSecurity(user = "admin@cifras.com", roles = {"admin"})
    void testUnblockUserSuccess() {
        given()
            .contentType(ContentType.JSON)
            .body(Map.of("reason", "Revisão disciplinar aprovada."))
        .when()
            .post("/api/admin/users/user-1/unblock")
        .then()
            .statusCode(200)
            .body("id", equalTo("user-1"))
            .body("status", equalTo("ACTIVE"))
            .body("isBlocked", equalTo(false));
    }

    @Test
    @DisplayName("GET /api/admin/users/{id}/audit-logs returns audit list for user")
    @TestSecurity(user = "admin@cifras.com", roles = {"admin"})
    void testGetAuditLogsSuccess() {
        given()
            .contentType(ContentType.JSON)
        .when()
            .get("/api/admin/users/user-1/audit-logs")
        .then()
            .statusCode(200)
            .body(notNullValue());
    }

    @Test
    @DisplayName("Admin user endpoints return 403 for non-admin")
    @TestSecurity(user = "regular@cifras.com", roles = {"user"})
    void testNonAdminAccessForbidden() {
        given()
            .contentType(ContentType.JSON)
        .when()
            .get("/api/admin/users")
        .then()
            .statusCode(403);

        given()
            .contentType(ContentType.JSON)
            .body(Map.of("reason", "Tentativa não autorizada."))
        .when()
            .post("/api/admin/users/user-1/block")
        .then()
            .statusCode(403);

        given()
            .contentType(ContentType.JSON)
        .when()
            .get("/api/admin/users/user-1/audit-logs")
        .then()
            .statusCode(403);
    }
}
