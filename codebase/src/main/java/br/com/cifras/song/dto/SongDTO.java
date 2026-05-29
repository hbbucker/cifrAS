package br.com.cifras.song.dto;

import br.com.cifras.song.domain.LyricsStructure;
import br.com.cifras.song.domain.Song;

import java.time.Instant;
import java.util.UUID;

/**
 * Full song response DTO — returned by GET /songs/{id} and POST /songs.
 */
public record SongDTO(
    UUID id,
    String title,
    String artist,
    String originalKey,
    LyricsStructure lyrics,
    String userPreferredKey,
    Instant createdAt,
    Instant updatedAt
) {
    public static SongDTO from(Song song) {
        return from(song, null);
    }

    public static SongDTO from(Song song, String preferredKey) {
        return new SongDTO(
            song.id,
            song.title,
            song.artist,
            song.originalKey,
            song.lyrics,
            preferredKey,
            song.createdAt,
            song.updatedAt
        );
    }
}
