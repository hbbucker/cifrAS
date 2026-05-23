package br.com.cifras.playlist.dto;

import br.com.cifras.playlist.domain.Playlist;
import java.time.Instant;
import java.util.List;
import java.util.stream.Collectors;

public record PlaylistDetailsDTO(
    Long id,
    String name,
    boolean isCollaborative,
    Instant createdAt,
    List<PlaylistSongDTO> songs
) {
    public static PlaylistDetailsDTO from(Playlist p) {
        List<PlaylistSongDTO> songDTOs = p.songs != null 
            ? p.songs.stream().map(PlaylistSongDTO::from).collect(Collectors.toList())
            : List.of();
            
        return new PlaylistDetailsDTO(p.id, p.name, p.isCollaborative, p.createdAt, songDTOs);
    }
}
