package br.com.cifras.playlist.dto;

import jakarta.validation.constraints.NotBlank;
import java.util.UUID;

/**
 * Request DTO for creating a playlist.
 */
public record CreatePlaylistRequest(
    @NotBlank String name,
    boolean isCollaborative,
    UUID groupId
) {}
