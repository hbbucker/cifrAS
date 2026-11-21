package br.com.cifras.performance.dto;

import java.time.Instant;
import java.util.UUID;

import io.quarkus.runtime.annotations.RegisterForReflection;

@RegisterForReflection
public record PerformanceSessionResponse(
        UUID playlistId,
        Integer currentSongIndex,
        Double scrollPosition,
        Instant updatedAt) {
}
