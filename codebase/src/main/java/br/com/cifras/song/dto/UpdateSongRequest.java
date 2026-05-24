package br.com.cifras.song.dto;

import br.com.cifras.song.domain.LyricsStructure;
import jakarta.validation.constraints.NotBlank;

/**
 * DTO for updating an existing song.
 */
public record UpdateSongRequest(
    @NotBlank String title,
    @NotBlank String artist,
    String originalKey,
    LyricsStructure lyrics
) {}
