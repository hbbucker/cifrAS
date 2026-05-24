package br.com.cifras.song.dto;

import br.com.cifras.song.domain.Song;

import java.time.Instant;

/**
 * Summary song DTO for paginated list — lighter than full SongDTO.
 */
public record SongSummaryDTO(
    Long id,
    String title,
    String artist,
    String originalKey,
    Instant createdAt
) {
    public static SongSummaryDTO from(Song song) {
        return new SongSummaryDTO(
            song.id,
            song.title,
            song.artist,
            song.originalKey,
            song.createdAt
        );
    }
}
