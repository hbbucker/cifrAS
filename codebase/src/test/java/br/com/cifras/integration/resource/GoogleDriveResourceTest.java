package br.com.cifras.integration.resource;

import br.com.cifras.integration.application.GoogleDriveService;
import io.quarkus.test.InjectMock;
import io.quarkus.test.junit.QuarkusTest;
import io.quarkus.test.security.TestSecurity;
import org.junit.jupiter.api.Test;

import java.util.UUID;

import static io.restassured.RestAssured.given;
import static org.mockito.Mockito.when;

@QuarkusTest
public class GoogleDriveResourceTest {

    @InjectMock
    GoogleDriveService googleDriveService;

    @Test
    @TestSecurity(user = "123e4567-e89b-12d3-a456-426614174000", roles = "authenticated")
    public void testGetAuthUrl() throws Exception {
        when(googleDriveService.getAuthUrl()).thenReturn("https://accounts.google.com/o/oauth2/auth");

        given()
          .when().get("/api/integrations/google/auth-url")
          .then()
             .statusCode(200)
             .body("url", org.hamcrest.Matchers.equalTo("https://accounts.google.com/o/oauth2/auth"));
    }

    @Test
    public void testGetAuthUrlUnauthorized() {
        given()
          .when().get("/api/integrations/google/auth-url")
          .then()
             .statusCode(401);
    }
}
