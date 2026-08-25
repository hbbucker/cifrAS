package br.com.cifras.shared.exception;

public class AccountBlockedException extends RuntimeException {
    public AccountBlockedException() {
        super("Sua conta foi suspensa temporariamente por violar os termos de uso. Entre em contato com o suporte para mais informações.");
    }

    public AccountBlockedException(String message) {
        super(message);
    }
}
