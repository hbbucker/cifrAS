package br.com.cifras.song.model;

import java.time.Instant;
import java.util.UUID;

public class Song {

    public UUID id;
    public String userId;
    public String title;
    public String artist;
    public String originalKey;
    public LyricsStructure lyrics;
    public Boolean prefUseBb = false;
    public Boolean prefUseEb = false;
    public Integer prefAutoScrollSpeed = 1;
    public Integer prefTransposeSteps = 0;
    public Instant createdAt;
    public Instant updatedAt;
    public Instant deletedAt;

    public Song() {}
}
