package br.com.cifras.admin.dashboard.dto;

import io.quarkus.runtime.annotations.RegisterForReflection;
import java.util.Map;

@RegisterForReflection
public record DashboardMetricsDTO(
    long totalUsers,
    long totalSongs,
    long activeSongs,
    long deletedSongs,
    long totalPlaylists,
    long songsCreatedToday,
    long songsCreatedThisMonth,
    Map<String, Long> topArtists,
    Map<String, Long> topKeys
) {}
