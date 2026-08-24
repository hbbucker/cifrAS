package br.com.cifras.admin.shared.exception;

import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;
import jakarta.ws.rs.ext.ExceptionMapper;
import jakarta.ws.rs.ext.Provider;
import org.jboss.logging.Logger;

import java.time.Instant;
import java.util.Map;

@Provider
public class GlobalExceptionMapper implements ExceptionMapper<Throwable> {

    private static final Logger LOG = Logger.getLogger(GlobalExceptionMapper.class);

    @Override
    public Response toResponse(Throwable exception) {
        LOG.error("Admin API error: " + exception.getMessage(), exception);

        if (exception instanceof AdminForbiddenException) {
            return buildResponse(Response.Status.FORBIDDEN, "FORBIDDEN", exception.getMessage());
        }

        if (exception instanceof ResourceNotFoundException) {
            return buildResponse(Response.Status.NOT_FOUND, "NOT_FOUND", exception.getMessage());
        }

        if (exception instanceof ValidationException || exception instanceof IllegalArgumentException) {
            return buildResponse(Response.Status.BAD_REQUEST, "BAD_REQUEST", exception.getMessage());
        }

        if (exception instanceof IllegalStateException) {
            return buildResponse(Response.Status.UNAUTHORIZED, "UNAUTHORIZED", exception.getMessage());
        }

        return buildResponse(Response.Status.INTERNAL_SERVER_ERROR, "INTERNAL_SERVER_ERROR", "An unexpected error occurred in the Admin API");
    }

    private Response buildResponse(Response.Status status, String errorCode, String message) {
        Map<String, Object> body = Map.of(
            "status", status.getStatusCode(),
            "error", errorCode,
            "message", message,
            "timestamp", Instant.now().toString()
        );
        return Response.status(status).type(MediaType.APPLICATION_JSON).entity(body).build();
    }
}
