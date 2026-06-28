package br.com.cifras.auth.dto;

import io.quarkus.runtime.annotations.RegisterForReflection;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;

/**
 * Request DTO for registration and login.
 */
@RegisterForReflection
public record AuthRequest(
    String name,
    @Email @NotBlank String email,
    @NotBlank String password
) {}
