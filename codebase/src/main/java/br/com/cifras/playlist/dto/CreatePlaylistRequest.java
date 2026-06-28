package br.com.cifras.playlist.dto;

import io.quarkus.runtime.annotations.RegisterForReflection;

import jakarta.validation.constraints.NotBlank;
import java.util.UUID;

/**
 * Request DTO for creating a playlist.
 */
@RegisterForReflection
public record CreatePlaylistRequest(
    @NotBlank String name,
    boolean isCollaborative,
    UUID groupId
) {}
