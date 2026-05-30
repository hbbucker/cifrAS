package br.com.cifras.auth.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;

/**
 * Request DTO for registration and login.
 */
public record AuthRequest(
    String name,
    @Email @NotBlank String email,
    @NotBlank String password
) {}
