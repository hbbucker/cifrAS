package br.com.cifras.admin.user.dto;

import jakarta.validation.constraints.NotBlank;

public record UpdateUserRoleRequestDTO(
    @NotBlank(message = "Role is required")
    String role
) {}
