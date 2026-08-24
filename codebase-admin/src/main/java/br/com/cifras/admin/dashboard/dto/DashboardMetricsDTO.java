package br.com.cifras.admin.dashboard.dto;

import java.util.Map;

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
