package br.com.cifras.song.dto;

import io.quarkus.runtime.annotations.RegisterForReflection;

import br.com.cifras.song.model.LyricsStructure;
import jakarta.validation.constraints.NotBlank;
import java.util.List;

/**
 * DTO for updating an existing song.
 */
@RegisterForReflection
public record UpdateSongRequest(
    @NotBlank String title,
    @NotBlank String artist,
    String originalKey,
    LyricsStructure lyrics,
    List<String> tags
) {
    public UpdateSongRequest(String title, String artist, String originalKey, LyricsStructure lyrics) {
        this(title, artist, originalKey, lyrics, null);
    }
}
