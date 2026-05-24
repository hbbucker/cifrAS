package br.com.cifras.shared.exception;

/**
 * Thrown when the requesting user tries to access a resource they don't own.
 * Maps to HTTP 403 Forbidden.
 */
public class ForbiddenException extends RuntimeException {
    public ForbiddenException(String message) {
        super(message);
    }

    public ForbiddenException() {
        super("Forbidden");
    }
}
