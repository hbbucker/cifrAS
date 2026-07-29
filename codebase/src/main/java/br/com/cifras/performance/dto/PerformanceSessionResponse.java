package br.com.cifras.performance.dto;

import java.time.Instant;
import java.util.UUID;

public record PerformanceSessionResponse(
    UUID playlistId,
    Integer currentSongIndex,
    Double scrollPosition,
    Instant updatedAt
) {}
