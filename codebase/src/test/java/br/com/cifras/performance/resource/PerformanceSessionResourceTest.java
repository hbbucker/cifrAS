package br.com.cifras.performance.resource;

import br.com.cifras.performance.dto.PerformanceSessionRequest;
import io.quarkus.test.junit.QuarkusTest;
import io.quarkus.test.security.TestSecurity;
import io.restassured.http.ContentType;
import org.junit.jupiter.api.Test;

import java.util.UUID;

import static io.restassured.RestAssured.given;
import static org.hamcrest.Matchers.equalTo;

@QuarkusTest
public class PerformanceSessionResourceTest {

    @Test
    @TestSecurity(user = "user-123", roles = "authenticated")
    public void testUpsertAndGetSession() {
        UUID playlistId = UUID.randomUUID();
        PerformanceSessionRequest request = new PerformanceSessionRequest(playlistId, 2, 500.5);

        // PATCH session
        given()
            .contentType(ContentType.JSON)
            .body(request)
        .when()
            .patch("/api/performance/sessions/active")
        .then()
            .statusCode(204);

        // GET session
        given()
        .when()
            .get("/api/performance/sessions/active")
        .then()
            .statusCode(200)
            .body("playlistId", equalTo(playlistId.toString()))
            .body("currentSongIndex", equalTo(2))
            .body("scrollPosition", equalTo(500.5f)); // RestAssured parsing for Double is sometimes Float
    }

    @Test
    @TestSecurity(user = "user-456", roles = "authenticated")
    public void testGetNonExistentSession() {
        given()
        .when()
            .get("/api/performance/sessions/active")
        .then()
            .statusCode(404);
    }
}
