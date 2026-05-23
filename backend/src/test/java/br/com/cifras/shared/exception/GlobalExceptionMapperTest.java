package br.com.cifras.shared.exception;

import io.quarkus.test.junit.QuarkusTest;
import jakarta.inject.Inject;
import jakarta.ws.rs.core.Response;
import org.junit.jupiter.api.Test;

import java.util.Map;

import static org.junit.jupiter.api.Assertions.*;

/**
 * T4: GlobalExceptionMapper unit tests
 * Tests: 3
 * 1. Generic Throwable → 500 with traceId (never stack trace in body)
 * 2. ForbiddenException → 403 with error message
 * 3. NotFoundException → 404 with error message
 */
@QuarkusTest
class GlobalExceptionMapperTest {

    @Inject
    GlobalExceptionMapper mapper;

    /**
     * Test 1: Any unexpected RuntimeException returns 500 with a unique traceId.
     * Stack trace must NOT be in the response body.
     */
    @Test
    void givenGenericThrowable_whenMapped_thenReturns500WithTraceId() {
        RuntimeException cause = new RuntimeException("Something exploded");

        Response response = mapper.toResponse(cause);

        assertEquals(500, response.getStatus());

        @SuppressWarnings("unchecked")
        Map<String, Object> body = (Map<String, Object>) response.getEntity();
        assertTrue(body.containsKey("traceId"), "Response must include traceId");
        assertEquals("Internal error", body.get("error"));
        assertFalse(body.containsKey("stackTrace"), "Stack trace must NOT be in response body");
        assertFalse(body.containsKey("message"), "Exception message must NOT leak in response body");
    }

    /**
     * Test 2: ForbiddenException → 403 Forbidden with error description.
     */
    @Test
    void givenForbiddenException_whenMapped_thenReturns403() {
        ForbiddenException cause = new ForbiddenException("Access denied");

        Response response = mapper.toResponse(cause);

        assertEquals(403, response.getStatus());

        @SuppressWarnings("unchecked")
        Map<String, Object> body = (Map<String, Object>) response.getEntity();
        assertEquals("Forbidden", body.get("error"));
    }

    /**
     * Test 3: NotFoundException → 404 Not Found.
     */
    @Test
    void givenNotFoundException_whenMapped_thenReturns404() {
        NotFoundException cause = new NotFoundException("Song not found");

        Response response = mapper.toResponse(cause);

        assertEquals(404, response.getStatus());

        @SuppressWarnings("unchecked")
        Map<String, Object> body = (Map<String, Object>) response.getEntity();
        assertEquals("Not found", body.get("error"));
    }
}
