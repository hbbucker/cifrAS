package br.com.cifras.admin.shared.exception;

import jakarta.validation.ConstraintViolationException;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;
import jakarta.ws.rs.ext.ExceptionMapper;
import jakarta.ws.rs.ext.Provider;
import org.jboss.logging.Logger;

import java.time.Instant;
import java.util.LinkedHashMap;
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

        if (exception instanceof ConstraintViolationException cve) {
            String msg = cve.getConstraintViolations().stream()
                    .map(v -> v.getMessage())
                    .findFirst()
                    .orElse("Validation error");
            return buildResponse(Response.Status.BAD_REQUEST, "INVALID_REASON_LENGTH", msg);
        }

        if (exception instanceof ValidationException || exception instanceof IllegalArgumentException) {
            String msg = exception.getMessage() != null ? exception.getMessage() : "Invalid argument";
            String code = "BAD_REQUEST";
            if ("CANNOT_BLOCK_SELF".equals(msg)) {
                code = "CANNOT_BLOCK_SELF";
                msg = "Um administrador não pode bloquear a sua própria conta.";
            } else if ("INVALID_REASON_LENGTH".equals(msg) || "INVALID_REASON".equals(msg)) {
                code = "INVALID_REASON_LENGTH";
                msg = "O motivo do bloqueio é obrigatório e deve ter entre 5 e 1000 caracteres.";
            }
            return buildResponse(Response.Status.BAD_REQUEST, code, msg);
        }

        if (exception instanceof IllegalStateException) {
            return buildResponse(Response.Status.UNAUTHORIZED, "UNAUTHORIZED", exception.getMessage());
        }

        return buildResponse(Response.Status.INTERNAL_SERVER_ERROR, "INTERNAL_SERVER_ERROR", "An unexpected error occurred in the Admin API");
    }

    private Response buildResponse(Response.Status status, String errorCode, String message) {
        Map<String, Object> body = new LinkedHashMap<>();
        body.put("status", status.getStatusCode());
        body.put("error", errorCode);
        body.put("message", message);
        body.put("timestamp", Instant.now().toString());
        return Response.status(status).type(MediaType.APPLICATION_JSON).entity(body).build();
    }
}
