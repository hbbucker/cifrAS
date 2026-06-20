package br.com.cifras.playlist.dto;

import br.com.cifras.playlist.model.PlaylistSong;
import java.time.Instant;
import java.util.UUID;

public record PlaylistSongDTO(
    UUID id,
    String title,
    String artist,
    String originalKey,
    int position,
    Instant addedAt
) {
    public static PlaylistSongDTO from(PlaylistSong ps) {
        return new PlaylistSongDTO(
            ps.getSong().getId(),
            ps.getSong().getTitle(),
            ps.getSong().getArtist(),
            ps.getSong().getOriginalKey(),
            ps.getPosition(),
            ps.getSong().getCreatedAt() // just to have a date
        );
    }
}
