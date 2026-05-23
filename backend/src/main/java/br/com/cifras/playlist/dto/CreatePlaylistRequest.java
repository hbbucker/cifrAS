package br.com.cifras.playlist.dto;

import jakarta.validation.constraints.NotBlank;

/**
 * Request DTO for creating a playlist.
 */
public record CreatePlaylistRequest(
    @NotBlank String name,
    boolean isCollaborative,
    Long groupId
) {}
