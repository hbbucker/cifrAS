package br.com.cifras.user.resource;

import br.com.cifras.BaseIntegrationTest;
import br.com.cifras.user.infra.persistence.entity.UserSubscriptionEntity;
import br.com.cifras.user.infra.persistence.repository.UserSubscriptionRepository;
import br.com.cifras.user.model.SubscriptionPlan;
import io.quarkus.test.junit.QuarkusTest;
import jakarta.inject.Inject;
import jakarta.transaction.Transactional;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import java.util.HashMap;
import java.util.Map;
import java.util.Optional;

import static io.restassured.RestAssured.given;
import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;

@QuarkusTest
public class StripeWebhookResourceTest extends BaseIntegrationTest {

    @Inject
    UserSubscriptionRepository subscriptionRepository;

    @BeforeEach
    @Transactional
    public void setup() {
        subscriptionRepository.deleteAll();
    }

    @Test
    public void testHandleWebhook_CheckoutCompleted() {
        Map<String, Object> payload = new HashMap<>();
        payload.put("type", "checkout.session.completed");
        
        Map<String, Object> data = new HashMap<>();
        Map<String, Object> object = new HashMap<>();
        object.put("client_reference_id", "user-123");
        data.put("object", object);
        payload.put("data", data);

        given()
            .contentType("application/json")
            .body(payload)
            .when().post("/webhooks/stripe")
            .then()
            .statusCode(200);

        Optional<UserSubscriptionEntity> sub = subscriptionRepository.findByUserId("user-123");
        assertTrue(sub.isPresent());
        assertEquals(SubscriptionPlan.PRO, sub.get().planType);
    }

    @Test
    public void testHandleWebhook_InvalidPayload() {
        given()
            .contentType("application/json")
            .body("invalid")
            .when().post("/webhooks/stripe")
            .then()
            .statusCode(400);
    }
}
