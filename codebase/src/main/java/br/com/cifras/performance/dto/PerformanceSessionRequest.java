package br.com.cifras.performance.dto;

import java.util.UUID;

public record PerformanceSessionRequest(
    UUID playlistId,
    Integer currentSongIndex,
    Double scrollPosition
) {}
