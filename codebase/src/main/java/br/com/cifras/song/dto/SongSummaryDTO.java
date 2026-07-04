package br.com.cifras.song.dto;

import io.quarkus.runtime.annotations.RegisterForReflection;

import br.com.cifras.song.model.Song;

import java.time.Instant;
import java.util.UUID;

/**
 * Summary song DTO for paginated list — lighter than full SongDTO.
 */
@RegisterForReflection
public record SongSummaryDTO(
    UUID id,
    String title,
    String artist,
    String originalKey,
    Boolean isFavorite,
    Instant createdAt
) {
    public static SongSummaryDTO from(Song song) {
        return new SongSummaryDTO(
            song.getId(),
            song.getTitle(),
            song.getArtist(),
            song.getOriginalKey(),
            song.getIsFavorite(),
            song.getCreatedAt()
        );
    }
}
