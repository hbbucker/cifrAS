package br.com.cifras.song.dto;

import jakarta.validation.constraints.NotNull;

public record SongPreferencesDTO(
    @NotNull Boolean prefUseBb,
    @NotNull Boolean prefUseEb,
    @NotNull Integer prefAutoScrollSpeed,
    @NotNull Integer prefTransposeSteps
) {}
