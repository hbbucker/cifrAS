package br.com.cifras.song.model;

import java.time.Instant;
import java.util.UUID;

public class Song {

    private UUID id;
    private String userId;
    private String title;
    private String artist;
    private String originalKey;
    private LyricsStructure lyrics;
    
    private Boolean prefUseBb = false;
    private Boolean prefUseEb = false;
    private Integer prefAutoScrollSpeed = 1;
    private Integer prefTransposeSteps = 0;
    
    private Instant createdAt;
    private Instant updatedAt;
    private Instant deletedAt;

    protected Song() {}

    public static Song create(String userId, String title, String artist, String originalKey, LyricsStructure lyrics) {
        Song song = new Song();
        song.userId = userId;
        song.title = title;
        song.artist = artist;
        song.originalKey = originalKey;
        song.lyrics = lyrics;
        song.createdAt = Instant.now();
        song.updatedAt = Instant.now();
        return song;
    }

    public static Song restore(UUID id, String userId, String title, String artist, String originalKey, 
                               LyricsStructure lyrics, Boolean prefUseBb, Boolean prefUseEb, 
                               Integer prefAutoScrollSpeed, Integer prefTransposeSteps, 
                               Instant createdAt, Instant updatedAt, Instant deletedAt) {
        Song song = new Song();
        song.id = id;
        song.userId = userId;
        song.title = title;
        song.artist = artist;
        song.originalKey = originalKey;
        song.lyrics = lyrics;
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
        this.title = title;
        this.artist = artist;
        this.originalKey = originalKey;
        this.lyrics = lyrics;
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
