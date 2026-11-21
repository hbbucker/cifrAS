package br.com.cifras.user.resource;

import br.com.cifras.BaseIntegrationTest;
import br.com.cifras.user.application.MockQuotaService;
import io.quarkus.test.InjectMock;
import br.com.cifras.user.infra.persistence.entity.UserSubscriptionEntity;
import br.com.cifras.user.infra.persistence.repository.UserSubscriptionRepository;
import br.com.cifras.user.model.SubscriptionPlan;
import io.quarkus.test.junit.QuarkusTest;
import io.quarkus.test.security.TestSecurity;
import jakarta.inject.Inject;
import jakarta.transaction.Transactional;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import java.time.OffsetDateTime;

import static io.restassured.RestAssured.given;
import static org.hamcrest.Matchers.equalTo;

@QuarkusTest
public class UserSubscriptionResourceTest extends BaseIntegrationTest {

    @Inject
    UserSubscriptionRepository subscriptionRepository;

    @InjectMock
    org.eclipse.microprofile.jwt.JsonWebToken jwt;

    @BeforeEach
    @Transactional
    public void setup() {
        MockQuotaService.bypass = false;
        subscriptionRepository.deleteAll();
    }

    @AfterEach
    public void teardown() {
        MockQuotaService.bypass = true;
    }

    @Test
    @TestSecurity(user = "user-free", roles = "user")
    public void testGetCurrentUserSubscription_Free() {
        org.mockito.Mockito.when(jwt.getSubject()).thenReturn("user-free");

        given()
            .when().get("/users/me/subscription")
            .then()
            .statusCode(200)
            .body("plan", equalTo("FREE"));
    }

    @Test
    @TestSecurity(user = "user-pro", roles = "user")
    public void testGetCurrentUserSubscription_Pro() {
        createProSubscription("user-pro");
        org.mockito.Mockito.when(jwt.getSubject()).thenReturn("user-pro");

        given()
            .when().get("/users/me/subscription")
            .then()
            .statusCode(200)
            .body("plan", equalTo("PRO"));
    }

    @Transactional
    protected void createProSubscription(String userId) {
        UserSubscriptionEntity sub = new UserSubscriptionEntity();
        sub.userId = userId;
        sub.planType = SubscriptionPlan.PRO;
        sub.activeUntil = OffsetDateTime.now().plusDays(30);
        subscriptionRepository.persist(sub);
    }
}
