package br.com.cifras.feedback.resource;

import br.com.cifras.feedback.dto.FeedbackCreateDTO;
import io.quarkus.test.junit.QuarkusTest;
import io.quarkus.test.security.TestSecurity;
import io.restassured.http.ContentType;
import org.junit.jupiter.api.Test;

import static io.restassured.RestAssured.given;

@QuarkusTest
class FeedbackResourceTest extends br.com.cifras.BaseIntegrationTest {

    @Test
    @TestSecurity(user = "user-uuid", roles = "user")
    void testSubmitFeedbackSuccess() {
        FeedbackCreateDTO dto = new FeedbackCreateDTO("This is a feedback");
        
        given()
            .contentType(ContentType.JSON)
            .body(dto)
        .when()
            .post("/feedbacks")
        .then()
            .statusCode(201);
    }

    @Test
    void testSubmitFeedbackUnauthorized() {
        FeedbackCreateDTO dto = new FeedbackCreateDTO("This is a feedback");
        
        given()
            .contentType(ContentType.JSON)
            .body(dto)
        .when()
            .post("/feedbacks")
        .then()
            .statusCode(401);
    }

    @Test
    @TestSecurity(user = "user-uuid", roles = "user")
    void testSubmitFeedbackInvalid() {
        FeedbackCreateDTO dto = new FeedbackCreateDTO("");
        
        given()
            .contentType(ContentType.JSON)
            .body(dto)
        .when()
            .post("/feedbacks")
        .then()
            .statusCode(400);
    }
}
