package br.com.cifras.song.dto;

import io.quarkus.runtime.annotations.RegisterForReflection;

import br.com.cifras.song.model.LyricsStructure;
import jakarta.validation.constraints.NotBlank;

/**
 * DTO for creating a new song.
 */
@RegisterForReflection
public record CreateSongRequest(
    @NotBlank String title,
    @NotBlank String artist,
    String originalKey,
    LyricsStructure lyrics
) {}
