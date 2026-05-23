package br.com.cifras.group.dto;

import jakarta.validation.constraints.NotNull;

public record LinkPlaylistRequest(
    @NotNull Long playlistId
) {}
