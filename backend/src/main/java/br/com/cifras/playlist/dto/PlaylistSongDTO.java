package br.com.cifras.playlist.dto;

import br.com.cifras.playlist.domain.PlaylistSong;
import java.time.Instant;

public record PlaylistSongDTO(
    Long id,
    String title,
    String artist,
    String originalKey,
    int position,
    Instant addedAt
) {
    public static PlaylistSongDTO from(PlaylistSong ps) {
        return new PlaylistSongDTO(
            ps.song.id,
            ps.song.title,
            ps.song.artist,
            ps.song.originalKey,
            ps.position,
            ps.song.createdAt // just to have a date
        );
    }
}
