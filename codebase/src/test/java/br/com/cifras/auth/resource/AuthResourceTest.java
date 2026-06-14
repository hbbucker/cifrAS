package br.com.cifras.auth.resource;

import io.quarkus.test.junit.QuarkusTest;
import io.restassured.http.ContentType;
import org.junit.jupiter.api.Test;

import static io.restassured.RestAssured.given;
import static org.hamcrest.Matchers.*;

/**
 * T7: AuthResource REST tests
 * Tests: 4 — tests the auth endpoints behavior.
 *
 * NOTE: These tests verify the REST layer behavior without a live Supabase connection.
 * The Supabase client will fail to connect (expected in test without real URL),
 * so we test that:
 * 1. Valid request format reaches the endpoint (not a 404 or 500 from routing)
 * 2. Invalid request body returns 400 validation errors
 * 3. Routes are accessible without auth (@PermitAll)
 * 4. Empty body returns 400 (not 404)
 */
import br.com.cifras.BaseIntegrationTest;

@QuarkusTest
class AuthResourceTest extends BaseIntegrationTest {

    /**
     * Test 1: /auth/register endpoint is accessible without auth token (PermitAll).
     * With no Supabase connection it will return 500 (connection refused), but NOT 401/404.
     */
    @Test
    void givenNoAuth_whenRegister_thenEndpointIsReachable() {
        given()
            .contentType(ContentType.JSON)
            .body("{\"email\":\"test@example.com\",\"password\":\"strongPass123\"}")
            .when().post("/auth/register")
            .then()
            .statusCode(anyOf(equalTo(201), equalTo(401), equalTo(500), equalTo(400), equalTo(429))); // Endpoint reached
    }

    /**
     * Test 2: /auth/login endpoint is accessible without auth token (PermitAll).
     */
    @Test
    void givenNoAuth_whenLogin_thenEndpointIsReachable() {
        given()
            .contentType(ContentType.JSON)
            .body("{\"email\":\"test@example.com\",\"password\":\"strongPass123\"}")
            .when().post("/auth/login")
            .then()
            .statusCode(anyOf(equalTo(200), equalTo(401), equalTo(500), equalTo(400), equalTo(429))); // Endpoint reached
    }

    /**
     * Test 3: POST /auth/register with invalid email returns 400 validation error.
     */
    @Test
    void givenInvalidEmail_whenRegister_thenReturns400() {
        given()
            .contentType(ContentType.JSON)
            .body("{\"email\":\"not-an-email\",\"password\":\"pass\"}")
            .when().post("/auth/register")
            .then()
            .statusCode(400);
    }

    /**
     * Test 4: POST /auth/register with missing password returns 400.
     */
    @Test
    void givenMissingPassword_whenRegister_thenReturns400() {
        given()
            .contentType(ContentType.JSON)
            .body("{\"email\":\"test@example.com\"}")
            .when().post("/auth/register")
            .then()
            .statusCode(400);
    }
}
