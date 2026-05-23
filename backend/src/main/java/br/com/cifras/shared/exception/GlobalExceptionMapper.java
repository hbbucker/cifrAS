package br.com.cifras.shared.exception;

import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;
import jakarta.ws.rs.ext.ExceptionMapper;
import jakarta.ws.rs.ext.Provider;
import org.jboss.logging.Logger;

import java.util.LinkedHashMap;
import java.util.Map;
import java.util.UUID;

/**
 * Global exception mapper — catches all Throwable instances and maps them to
 * standardized JSON responses. Never exposes stack traces in production.
 *
 * Error format: { "error": "...", "traceId": "..." (only on 500) }
 */
@Provider
public class GlobalExceptionMapper implements ExceptionMapper<Throwable> {

    private static final Logger LOG = Logger.getLogger(GlobalExceptionMapper.class);

    @Override
    public Response toResponse(Throwable exception) {
        if (exception instanceof ForbiddenException) {
            return buildResponse(403, "Forbidden", null);
        }

        if (exception instanceof NotFoundException || exception instanceof jakarta.ws.rs.NotFoundException) {
            return buildResponse(404, "Not found", null);
        }

        // Unhandled exception — log with unique traceId, never expose details
        String traceId = UUID.randomUUID().toString();
        LOG.errorf(exception, "Unhandled exception [traceId=%s]", traceId);
        return buildResponse(500, "Internal error", traceId);
    }

    private Response buildResponse(int status, String error, String traceId) {
        Map<String, Object> body = new LinkedHashMap<>();
        body.put("error", error);
        if (traceId != null) {
            body.put("traceId", traceId);
        }
        return Response.status(status)
                .type(MediaType.APPLICATION_JSON)
                .entity(body)
                .build();
    }
}
