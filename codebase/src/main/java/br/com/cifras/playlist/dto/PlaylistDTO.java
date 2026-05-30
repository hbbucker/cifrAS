package br.com.cifras.playlist.dto;

import br.com.cifras.playlist.model.Playlist;

import java.time.Instant;
import java.util.UUID;

/**
 * Playlist response DTO.
 */
public record PlaylistDTO(
    UUID id,
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
