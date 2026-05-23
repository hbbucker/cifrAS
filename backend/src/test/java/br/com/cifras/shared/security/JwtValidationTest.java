package br.com.cifras.shared.security;

import io.quarkus.test.junit.QuarkusTest;
import io.quarkus.test.security.TestSecurity;
import io.restassured.RestAssured;
import org.junit.jupiter.api.Test;

import static io.restassured.RestAssured.given;
import static org.hamcrest.CoreMatchers.containsString;
import static org.hamcrest.Matchers.*;

/**
 * T3: JWT Validation Integration Tests
 * Tests: 3
 * 1. Request without token rejected with 401
 * 2. Request with invalid token returns 401
 * 3. Valid token (via @TestSecurity) returns 200 with userId
 */
@QuarkusTest
class JwtValidationTest {

    /**
     * Test 1: Requests without Authorization header must be rejected with 401.
     */
    @Test
    void givenNoToken_whenAccessProtectedEndpoint_thenReturns401() {
        given()
            .when()
            .get("/internal/ping")
            .then()
            .statusCode(401);
    }

    /**
     * Test 2: Requests with an invalid/malformed JWT token must return 401.
     */
    @Test
    void givenInvalidToken_whenAccessProtectedEndpoint_thenReturns401() {
        given()
            .header("Authorization", "Bearer this.is.not.a.valid.jwt")
            .when()
            .get("/internal/ping")
            .then()
            .statusCode(401);
    }

    /**
     * Test 3: Valid authentication (simulated via @TestSecurity) returns 200
     * with the userId in the response body.
     */
    @Test
    @TestSecurity(user = "user-uuid-123", roles = {"user"})
    void givenValidToken_whenAccessProtectedEndpoint_thenReturns200WithUserId() {
        given()
            .when()
            .get("/internal/ping")
            .then()
            .statusCode(200)
            .body(containsString("user-uuid-123"));
    }
}
