package br.com.cifras.performance.model;

import java.time.Instant;
import java.util.UUID;

public class PerformanceSession {
    private String userId;
    private UUID playlistId;
    private Integer currentSongIndex;
    private Double scrollPosition;
    private Instant updatedAt;

    protected PerformanceSession() {}

    public static PerformanceSession create(String userId, UUID playlistId, Integer currentSongIndex, Double scrollPosition) {
        PerformanceSession session = new PerformanceSession();
        session.userId = userId;
        session.playlistId = playlistId;
        session.currentSongIndex = currentSongIndex;
        session.scrollPosition = scrollPosition;
        session.updatedAt = Instant.now();
        return session;
    }

    public static PerformanceSession restore(String userId, UUID playlistId, Integer currentSongIndex, Double scrollPosition, Instant updatedAt) {
        PerformanceSession session = new PerformanceSession();
        session.userId = userId;
        session.playlistId = playlistId;
        session.currentSongIndex = currentSongIndex;
        session.scrollPosition = scrollPosition;
        session.updatedAt = updatedAt;
        return session;
    }

    public void updateProgress(UUID playlistId, Integer currentSongIndex, Double scrollPosition) {
        this.playlistId = playlistId;
        this.currentSongIndex = currentSongIndex;
        this.scrollPosition = scrollPosition;
        this.updatedAt = Instant.now();
    }
    
    public String getUserId() { return userId; }
    public UUID getPlaylistId() { return playlistId; }
    public Integer getCurrentSongIndex() { return currentSongIndex; }
    public Double getScrollPosition() { return scrollPosition; }
    public Instant getUpdatedAt() { return updatedAt; }
}
