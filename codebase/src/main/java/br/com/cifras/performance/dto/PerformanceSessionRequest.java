package br.com.cifras.performance.dto;

import java.util.UUID;

import io.quarkus.runtime.annotations.RegisterForReflection;

@RegisterForReflection
public record PerformanceSessionRequest(
        UUID playlistId,
        Integer currentSongIndex,
        Double scrollPosition) {
}
