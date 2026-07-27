package br.com.cifras.user.resource.dto;

import io.quarkus.runtime.annotations.RegisterForReflection;
import jakarta.validation.constraints.NotNull;
import java.util.UUID;

@RegisterForReflection
public record TheaterSessionStateDTO(
    @NotNull UUID songId,
    @NotNull Integer transposeSteps,
    @NotNull Integer autoScrollSpeed,
    @NotNull Integer fontSize
) {}
