package br.com.cifras.admin.dashboard.resource;

import io.quarkus.test.junit.QuarkusTest;
import io.quarkus.test.security.TestSecurity;
import io.restassured.http.ContentType;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import static io.restassured.RestAssured.given;
import static org.hamcrest.Matchers.*;

@QuarkusTest
class AdminDashboardResourceTest {

    @Test
    @DisplayName("GET /api/admin/dashboard/metrics returns 200 and metrics payload for admin")
    @TestSecurity(user = "admin@cifras.com", roles = {"admin"})
    void testGetMetricsAsAdmin() {
        given()
            .contentType(ContentType.JSON)
        .when()
            .get("/api/admin/dashboard/metrics")
        .then()
            .statusCode(200)
            .body("totalUsers", notNullValue())
            .body("totalSongs", notNullValue())
            .body("activeSongs", notNullValue());
    }

    @Test
    @DisplayName("GET /api/admin/dashboard/metrics returns 403 for non-admin")
    @TestSecurity(user = "regular@cifras.com", roles = {"user"})
    void testGetMetricsAsNonAdmin() {
        given()
            .contentType(ContentType.JSON)
        .when()
            .get("/api/admin/dashboard/metrics")
        .then()
            .statusCode(403);
    }

    @Test
    @DisplayName("GET /api/admin/dashboard/recent-activity returns 200 for admin")
    @TestSecurity(user = "admin@cifras.com", roles = {"admin"})
    void testGetRecentActivityAsAdmin() {
        given()
            .contentType(ContentType.JSON)
            .queryParam("limit", 5)
        .when()
            .get("/api/admin/dashboard/recent-activity")
        .then()
            .statusCode(200);
    }
}
