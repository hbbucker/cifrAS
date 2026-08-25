package br.com.cifras.admin.auth.resource;

import io.quarkus.test.junit.QuarkusTest;
import io.restassured.http.ContentType;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;

import static io.restassured.RestAssured.given;
import static org.hamcrest.Matchers.*;

@QuarkusTest
class AdminAuthResourceTest {

    @Test
    @DisplayName("GET /api/admin/auth/google-url returns the Supabase Google OAuth URL with encoded redirectTo")
    void testGetGoogleUrl() {
        String redirectTarget = "http://localhost:8081/auth/callback";
        String encodedTarget = URLEncoder.encode(redirectTarget, StandardCharsets.UTF_8);

        given()
            .contentType(ContentType.JSON)
            .queryParam("redirectTo", redirectTarget)
        .when()
            .get("/api/admin/auth/google-url")
        .then()
            .statusCode(200)
            .body("url", containsString("/auth/v1/authorize?provider=google&redirect_to=" + encodedTarget));
    }
}
