package br.com.cifras.song.dto;

import br.com.cifras.song.domain.LyricsStructure;
import jakarta.validation.constraints.NotBlank;

/**
 * DTO for creating a new song.
 */
public record CreateSongRequest(
    @NotBlank String title,
    @NotBlank String artist,
    String originalKey,
    LyricsStructure lyrics
) {}
