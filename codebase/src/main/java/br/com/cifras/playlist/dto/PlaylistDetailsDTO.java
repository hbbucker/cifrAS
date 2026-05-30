package br.com.cifras.playlist.dto;

import br.com.cifras.playlist.model.Playlist;
import java.time.Instant;
import java.util.List;
import java.util.stream.Collectors;
import java.util.UUID;

public record PlaylistDetailsDTO(
    UUID id,
    String name,
    boolean isCollaborative,
    String userId,
    Instant createdAt,
    List<PlaylistSongDTO> songs
) {
    public static PlaylistDetailsDTO from(Playlist p) {
        List<PlaylistSongDTO> songDTOs = p.songs != null 
            ? p.songs.stream().map(PlaylistSongDTO::from).collect(Collectors.toList())
            : List.of();
            
        return new PlaylistDetailsDTO(p.id, p.name, p.isCollaborative, p.userId, p.createdAt, songDTOs);
    }
}
