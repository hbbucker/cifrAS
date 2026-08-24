package br.com.cifras.admin.dashboard.model;

import java.util.Map;

public class DashboardMetrics {
    private final long totalUsers;
    private final long totalSongs;
    private final long activeSongs;
    private final long deletedSongs;
    private final long totalPlaylists;
    private final long songsCreatedToday;
    private final long songsCreatedThisMonth;
    private final Map<String, Long> topArtists;
    private final Map<String, Long> topKeys;

    public DashboardMetrics(
            long totalUsers,
            long totalSongs,
            long activeSongs,
            long deletedSongs,
            long totalPlaylists,
            long songsCreatedToday,
            long songsCreatedThisMonth,
            Map<String, Long> topArtists,
            Map<String, Long> topKeys) {
        this.totalUsers = totalUsers;
        this.totalSongs = totalSongs;
        this.activeSongs = activeSongs;
        this.deletedSongs = deletedSongs;
        this.totalPlaylists = totalPlaylists;
        this.songsCreatedToday = songsCreatedToday;
        this.songsCreatedThisMonth = songsCreatedThisMonth;
        this.topArtists = topArtists;
        this.topKeys = topKeys;
    }

    public long getTotalUsers() { return totalUsers; }
    public long getTotalSongs() { return totalSongs; }
    public long getActiveSongs() { return activeSongs; }
    public long getDeletedSongs() { return deletedSongs; }
    public long getTotalPlaylists() { return totalPlaylists; }
    public long getSongsCreatedToday() { return songsCreatedToday; }
    public long getSongsCreatedThisMonth() { return songsCreatedThisMonth; }
    public Map<String, Long> getTopArtists() { return topArtists; }
    public Map<String, Long> getTopKeys() { return topKeys; }
}
