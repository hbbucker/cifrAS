package br.com.cifras.admin.shared.exception;

public class AdminForbiddenException extends RuntimeException {
    public AdminForbiddenException(String message) {
        super(message);
    }
}
