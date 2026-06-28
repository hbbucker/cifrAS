package br.com.cifras.song.dto;

import io.quarkus.runtime.annotations.RegisterForReflection;

import br.com.cifras.song.model.LyricsStructure;
import br.com.cifras.song.model.Song;

import java.time.Instant;
import java.util.UUID;

/**
 * Full song response DTO — returned by GET /songs/{id} and POST /songs.
 */
@RegisterForReflection
public record SongDTO(
    UUID id,
    String title,
    String artist,
    String originalKey,
    LyricsStructure lyrics,
    String userPreferredKey,
    Boolean prefUseBb,
    Boolean prefUseEb,
    Integer prefAutoScrollSpeed,
    Integer prefTransposeSteps,
    Instant createdAt,
    Instant updatedAt
) {
    public static SongDTO from(Song song) {
        return from(song, null);
    }

    public static SongDTO from(Song song, String preferredKey) {
        return new SongDTO(
            song.getId(),
            song.getTitle(),
            song.getArtist(),
            song.getOriginalKey(),
            song.getLyrics(),
            preferredKey,
            song.getPrefUseBb(),
            song.getPrefUseEb(),
            song.getPrefAutoScrollSpeed(),
            song.getPrefTransposeSteps(),
            song.getCreatedAt(),
            song.getUpdatedAt()
        );
    }
}
