package br.com.cifras.playlist.dto;

import io.quarkus.runtime.annotations.RegisterForReflection;

import br.com.cifras.playlist.model.Playlist;

import java.time.Instant;
import java.util.UUID;

/**
 * Playlist response DTO.
 */
@RegisterForReflection
public record PlaylistDTO(
    UUID id,
    String name,
    boolean isCollaborative,
    String userId,
    int songCount,
    Instant createdAt
) {
    public static PlaylistDTO from(Playlist p) {
        int count = p.getSongs() != null ? p.getSongs().size() : 0;
        return new PlaylistDTO(p.getId(), p.getName(), p.isCollaborative(), p.getUserId(), count, p.getCreatedAt());
    }
}
