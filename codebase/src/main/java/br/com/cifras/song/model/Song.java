package br.com.cifras.song.model;

import java.time.Instant;
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.Objects;
import java.util.UUID;
import java.util.stream.Collectors;

public class Song {

    private UUID id;
    private String userId;
    private String title;
    private String artist;
    private String originalKey;
    private LyricsStructure lyrics;
    private Boolean isFavorite = false;
    private List<String> tags = new ArrayList<>();
    
    private Boolean prefUseBb = false;
    private Boolean prefUseEb = false;
    private Integer prefAutoScrollSpeed = 1;
    private Integer prefTransposeSteps = 0;
    
    private Instant createdAt;
    private Instant updatedAt;
    private Instant deletedAt;

    protected Song() {}

    public static List<String> normalizeTags(List<String> rawTags) {
        if (rawTags == null || rawTags.isEmpty()) {
            return new ArrayList<>();
        }
        return rawTags.stream()
            .filter(Objects::nonNull)
            .map(String::trim)
            .filter(t -> !t.isEmpty())
            .map(t -> t.length() > 30 ? t.substring(0, 30) : t)
            .distinct()
            .limit(20)
            .collect(Collectors.toCollection(ArrayList::new));
    }

    public static Song create(String userId, String title, String artist, String originalKey, LyricsStructure lyrics) {
        return create(userId, title, artist, originalKey, lyrics, null);
    }

    public static Song create(String userId, String title, String artist, String originalKey, LyricsStructure lyrics, List<String> tags) {
        Song song = new Song();
        song.userId = userId;
        song.title = title;
        song.artist = artist;
        song.originalKey = originalKey;
        song.lyrics = lyrics;
        song.tags = normalizeTags(tags);
        song.createdAt = Instant.now();
        song.updatedAt = Instant.now();
        return song;
    }

    public static Song createCloneForUser(Song original, String newUserId) {
        if (original == null) {
            throw new IllegalArgumentException("Original song cannot be null");
        }
        if (newUserId == null || newUserId.isBlank()) {
            throw new IllegalArgumentException("User ID cannot be blank");
        }
        Song clone = new Song();
        clone.userId = newUserId;
        clone.title = original.getTitle();
        clone.artist = original.getArtist();
        clone.originalKey = original.getOriginalKey();
        clone.lyrics = original.getLyrics();
        clone.tags = new ArrayList<>(original.getTags());
        clone.isFavorite = false;
        clone.prefUseBb = false;
        clone.prefUseEb = false;
        clone.prefAutoScrollSpeed = 1;
        clone.prefTransposeSteps = 0;
        clone.createdAt = Instant.now();
        clone.updatedAt = Instant.now();
        return clone;
    }

    public static Song restore(UUID id, String userId, String title, String artist, String originalKey, 
                               LyricsStructure lyrics, Boolean isFavorite, Boolean prefUseBb, Boolean prefUseEb, 
                               Integer prefAutoScrollSpeed, Integer prefTransposeSteps, 
                               Instant createdAt, Instant updatedAt, Instant deletedAt) {
        return restore(id, userId, title, artist, originalKey, lyrics, isFavorite, null, prefUseBb, prefUseEb, prefAutoScrollSpeed, prefTransposeSteps, createdAt, updatedAt, deletedAt);
    }

    public static Song restore(UUID id, String userId, String title, String artist, String originalKey, 
                               LyricsStructure lyrics, Boolean isFavorite, List<String> tags, Boolean prefUseBb, Boolean prefUseEb, 
                               Integer prefAutoScrollSpeed, Integer prefTransposeSteps, 
                               Instant createdAt, Instant updatedAt, Instant deletedAt) {
        Song song = new Song();
        song.id = id;
        song.userId = userId;
        song.title = title;
        song.artist = artist;
        song.originalKey = originalKey;
        song.lyrics = lyrics;
        song.isFavorite = isFavorite;
        song.tags = tags != null ? normalizeTags(tags) : new ArrayList<>();
        song.prefUseBb = prefUseBb;
        song.prefUseEb = prefUseEb;
        song.prefAutoScrollSpeed = prefAutoScrollSpeed;
        song.prefTransposeSteps = prefTransposeSteps;
        song.createdAt = createdAt;
        song.updatedAt = updatedAt;
        song.deletedAt = deletedAt;
        return song;
    }

    public void updateDetails(String title, String artist, String originalKey, LyricsStructure lyrics) {
        updateDetails(title, artist, originalKey, lyrics, this.tags);
    }

    public void updateDetails(String title, String artist, String originalKey, LyricsStructure lyrics, List<String> tags) {
        this.title = title;
        this.artist = artist;
        this.originalKey = originalKey;
        this.lyrics = lyrics;
        if (tags != null) {
            this.tags = normalizeTags(tags);
        }
        this.updatedAt = Instant.now();
    }

    public void updatePreferences(Integer speed, Integer transposeSteps, Boolean useBb, Boolean useEb) {
        if (speed != null) this.prefAutoScrollSpeed = speed;
        if (transposeSteps != null) this.prefTransposeSteps = transposeSteps;
        if (useBb != null) this.prefUseBb = useBb;
        if (useEb != null) this.prefUseEb = useEb;
        this.updatedAt = Instant.now();
    }

    public void softDelete() {
        this.deletedAt = Instant.now();
        this.updatedAt = Instant.now();
    }

    public UUID getId() { return id; }
    public String getUserId() { return userId; }
    public String getTitle() { return title; }
    public String getArtist() { return artist; }
    public String getOriginalKey() { return originalKey; }
    public LyricsStructure getLyrics() { return lyrics; }
    public Boolean getIsFavorite() { return isFavorite; }
    public List<String> getTags() { return tags != null ? Collections.unmodifiableList(tags) : Collections.emptyList(); }
    
    public void toggleFavorite() {
        this.isFavorite = !this.isFavorite;
        this.updatedAt = Instant.now();
    }
    public Boolean getPrefUseBb() { return prefUseBb; }
    public Boolean getPrefUseEb() { return prefUseEb; }
    public Integer getPrefAutoScrollSpeed() { return prefAutoScrollSpeed; }
    public Integer getPrefTransposeSteps() { return prefTransposeSteps; }
    public Instant getCreatedAt() { return createdAt; }
    public Instant getUpdatedAt() { return updatedAt; }
    public Instant getDeletedAt() { return deletedAt; }

    // Setters apenas para infraestrutura (Repository após persist)
    public void setId(UUID id) { this.id = id; }
    public void setCreatedAt(Instant createdAt) { this.createdAt = createdAt; }
    public void setUpdatedAt(Instant updatedAt) { this.updatedAt = updatedAt; }
}
