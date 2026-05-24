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
    String userId,
    int songCount,
    Instant createdAt
) {
    public static PlaylistDTO from(Playlist p) {
        int count = p.songs != null ? p.songs.size() : 0;
        return new PlaylistDTO(p.id, p.name, p.isCollaborative, p.userId, count, p.createdAt);
    }
}
