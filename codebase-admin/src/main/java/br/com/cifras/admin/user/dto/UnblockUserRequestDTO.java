package br.com.cifras.admin.user.dto;

import io.quarkus.runtime.annotations.RegisterForReflection;
import jakarta.validation.constraints.Size;

@RegisterForReflection
public record UnblockUserRequestDTO(
    @Size(max = 1000, message = "O motivo deve conter no máximo 1000 caracteres")
    String reason
) {}
