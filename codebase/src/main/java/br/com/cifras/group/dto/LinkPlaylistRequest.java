package br.com.cifras.group.dto;

import jakarta.validation.constraints.NotNull;
import java.util.UUID;

public record LinkPlaylistRequest(
    @NotNull UUID playlistId
) {}
