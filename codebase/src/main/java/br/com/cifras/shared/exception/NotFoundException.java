package br.com.cifras.shared.exception;

/**
 * Thrown when a requested resource does not exist or is not visible to the caller.
 * Maps to HTTP 404 Not Found.
 */
public class NotFoundException extends RuntimeException {
    public NotFoundException(String message) {
        super(message);
    }

    public NotFoundException() {
        super("Resource not found");
    }
}
