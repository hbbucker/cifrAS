package br.com.cifras.song.dto;

import io.quarkus.runtime.annotations.RegisterForReflection;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;

@RegisterForReflection
public record ShareSongRequestDTO(
    @NotBlank(message = "Email is required")
    @Email(message = "Invalid email format")
    String email
) {}
