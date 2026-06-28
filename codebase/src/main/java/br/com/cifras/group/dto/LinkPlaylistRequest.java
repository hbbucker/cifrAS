package br.com.cifras.group.dto;

import io.quarkus.runtime.annotations.RegisterForReflection;

import jakarta.validation.constraints.NotNull;
import java.util.UUID;

@RegisterForReflection
public record LinkPlaylistRequest(
    @NotNull UUID playlistId
) {}
