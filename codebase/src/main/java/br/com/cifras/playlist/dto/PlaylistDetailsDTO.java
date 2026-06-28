package br.com.cifras.playlist.dto;

import io.quarkus.runtime.annotations.RegisterForReflection;

import br.com.cifras.playlist.model.Playlist;
import java.time.Instant;
import java.util.List;
import java.util.stream.Collectors;
import java.util.UUID;

@RegisterForReflection
public record PlaylistDetailsDTO(
    UUID id,
    String name,
    boolean isCollaborative,
    String userId,
    Instant createdAt,
    List<PlaylistSongDTO> songs
) {
    public static PlaylistDetailsDTO from(Playlist p) {
        List<PlaylistSongDTO> songDTOs = p.getSongs() != null 
            ? p.getSongs().stream().map(PlaylistSongDTO::from).collect(Collectors.toList())
            : List.of();
            
        return new PlaylistDetailsDTO(p.getId(), p.getName(), p.isCollaborative(), p.getUserId(), p.getCreatedAt(), songDTOs);
    }
}
