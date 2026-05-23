package br.com.cifras.playlist.dto;

import br.com.cifras.playlist.domain.Playlist;

import java.time.Instant;

/**
 * Playlist response DTO.
 */
public record PlaylistDTO(
    Long id,
    String name,
    boolean isCollaborative,
    Instant createdAt
) {
    public static PlaylistDTO from(Playlist p) {
        return new PlaylistDTO(p.id, p.name, p.isCollaborative, p.createdAt);
    }
}
