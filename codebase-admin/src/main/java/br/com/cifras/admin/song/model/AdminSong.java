package br.com.cifras.admin.song.model;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

public class AdminSong {
    private final UUID id;
    private final String userId;
    private final String title;
    private final String artist;
    private final String originalKey;
    private final Boolean isFavorite;
    private final List<String> tags;
    private final Instant createdAt;
    private final Instant updatedAt;
    private final Instant deletedAt;

    public AdminSong(
            UUID id,
            String userId,
            String title,
            String artist,
            String originalKey,
            Boolean isFavorite,
            List<String> tags,
            Instant createdAt,
            Instant updatedAt,
            Instant deletedAt) {
        this.id = id;
        this.userId = userId;
        this.title = title;
        this.artist = artist;
        this.originalKey = originalKey;
        this.isFavorite = isFavorite;
        this.tags = tags != null ? tags : List.of();
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
        this.deletedAt = deletedAt;
    }

    public UUID getId() { return id; }
    public String getUserId() { return userId; }
    public String getTitle() { return title; }
    public String getArtist() { return artist; }
    public String getOriginalKey() { return originalKey; }
    public Boolean getFavorite() { return isFavorite; }
    public List<String> getTags() { return tags; }
    public Instant getCreatedAt() { return createdAt; }
    public Instant getUpdatedAt() { return updatedAt; }
    public Instant getDeletedAt() { return deletedAt; }
    public boolean isDeleted() { return deletedAt != null; }
}
