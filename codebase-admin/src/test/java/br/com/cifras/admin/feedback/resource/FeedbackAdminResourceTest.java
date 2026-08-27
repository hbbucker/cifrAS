package br.com.cifras.admin.feedback.resource;

import br.com.cifras.admin.feedback.dto.FeedbackReplyDTO;
import br.com.cifras.admin.feedback.infra.persistence.entity.FeedbackEntity;
import io.quarkus.test.junit.QuarkusTest;
import io.quarkus.test.security.TestSecurity;
import io.restassured.http.ContentType;
import org.junit.jupiter.api.Test;
import jakarta.inject.Inject;

import java.util.UUID;

import static io.restassured.RestAssured.given;
import static org.hamcrest.Matchers.*;

@QuarkusTest
class FeedbackAdminResourceTest {

    @Inject
    br.com.cifras.admin.feedback.infra.persistence.repository.FeedbackAdminRepository repository;

    @Test
    @TestSecurity(user = "admin", roles = "admin")
    void testListFeedbacks() {
        given()
        .when()
            .get("/api/admin/feedbacks")
        .then()
            .statusCode(200)
            .body("$", notNullValue());
    }

    @Test
    @TestSecurity(user = "admin", roles = "admin")
    void testReplyToFeedback() {
        FeedbackEntity entity = new FeedbackEntity();
        entity.userId = "test";
        entity.message = "hello";
        entity.status = "PENDING";
        
        io.quarkus.narayana.jta.QuarkusTransaction.requiringNew().run(() -> {
            repository.persist(entity);
        });

        FeedbackReplyDTO dto = new FeedbackReplyDTO("reply message");
        
        given()
            .contentType(ContentType.JSON)
            .body(dto)
        .when()
            .put("/api/admin/feedbacks/" + entity.id + "/reply")
        .then()
            .statusCode(200);
    }

    @Test
    @TestSecurity(user = "admin", roles = "admin")
    void testReplyToFeedbackNotFound() {
        FeedbackReplyDTO dto = new FeedbackReplyDTO("reply message");
        
        given()
            .contentType(ContentType.JSON)
            .body(dto)
        .when()
            .put("/api/admin/feedbacks/" + UUID.randomUUID() + "/reply")
        .then()
            .statusCode(404);
    }
}
