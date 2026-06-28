package br.com.cifras.song.dto;

import io.quarkus.runtime.annotations.RegisterForReflection;

import jakarta.validation.constraints.NotNull;

@RegisterForReflection
public record SongPreferencesDTO(
    @NotNull Boolean prefUseBb,
    @NotNull Boolean prefUseEb,
    @NotNull Integer prefAutoScrollSpeed,
    @NotNull Integer prefTransposeSteps
) {}
