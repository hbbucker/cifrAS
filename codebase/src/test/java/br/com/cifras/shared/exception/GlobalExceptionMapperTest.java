package br.com.cifras.shared.exception;

import io.quarkus.test.junit.QuarkusTest;
import jakarta.inject.Inject;
import jakarta.ws.rs.core.Response;
import org.junit.jupiter.api.Test;

import java.util.Map;

import static org.junit.jupiter.api.Assertions.*;

import br.com.cifras.BaseIntegrationTest;

@QuarkusTest
class GlobalExceptionMapperTest extends BaseIntegrationTest {

    @Inject
    GlobalExceptionMapper mapper;

    @Test
    void givenAccountBlockedException_whenMapped_thenReturns403WithAccountBlockedCode() {
        AccountBlockedException cause = new AccountBlockedException();

        Response response = mapper.toResponse(cause);

        assertEquals(403, response.getStatus());

        @SuppressWarnings("unchecked")
        Map<String, Object> body = (Map<String, Object>) response.getEntity();
        assertEquals("ACCOUNT_BLOCKED", body.get("error"));
        assertEquals(403, body.get("status"));
        assertNotNull(body.get("message"));
    }

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

    @Test
    void givenForbiddenException_whenMapped_thenReturns403() {
        ForbiddenException cause = new ForbiddenException("Access denied");

        Response response = mapper.toResponse(cause);

        assertEquals(403, response.getStatus());

        @SuppressWarnings("unchecked")
        Map<String, Object> body = (Map<String, Object>) response.getEntity();
        assertEquals("Forbidden", body.get("error"));
    }

    @Test
    void givenNotFoundException_whenMapped_thenReturns404() {
        NotFoundException cause = new NotFoundException("Song not found");

        Response response = mapper.toResponse(cause);

        assertEquals(404, response.getStatus());

        @SuppressWarnings("unchecked")
        Map<String, Object> body = (Map<String, Object>) response.getEntity();
        assertEquals("Not found", body.get("error"));
    }

    @Test
    void givenJakartaNotFoundException_whenMapped_thenReturns404() {
        jakarta.ws.rs.NotFoundException cause = new jakarta.ws.rs.NotFoundException("HTTP 404 Not Found");

        Response response = mapper.toResponse(cause);

        assertEquals(404, response.getStatus());

        @SuppressWarnings("unchecked")
        Map<String, Object> body = (Map<String, Object>) response.getEntity();
        assertEquals("Not found", body.get("error"));
    }
}
