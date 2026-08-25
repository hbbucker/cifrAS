package br.com.cifras.admin.user.dto;

import io.quarkus.runtime.annotations.RegisterForReflection;
import jakarta.validation.constraints.NotBlank;

@RegisterForReflection
public record UpdateUserRoleRequestDTO(
    @NotBlank(message = "Role is required")
    String role
) {}
