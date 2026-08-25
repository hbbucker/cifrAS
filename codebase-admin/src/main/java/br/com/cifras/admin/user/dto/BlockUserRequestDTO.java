package br.com.cifras.admin.user.dto;

import io.quarkus.runtime.annotations.RegisterForReflection;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

@RegisterForReflection
public record BlockUserRequestDTO(
    @NotBlank(message = "O motivo do bloqueio é obrigatório")
    @Size(min = 5, max = 1000, message = "O motivo deve conter entre 5 e 1000 caracteres")
    String reason
) {}
