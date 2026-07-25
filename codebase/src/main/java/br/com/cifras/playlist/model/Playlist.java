package br.com.cifras.playlist.model;

import br.com.cifras.group.model.Group;
import java.time.Instant;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

public class Playlist {

    private UUID id;
    private String userId;
    private String name;
    private boolean isCollaborative = false;
    private Group group;
    private String shareToken;
    
    private List<PlaylistSong> songs = new ArrayList<>();
    
    private Instant createdAt;
    private Instant deletedAt;

    protected Playlist() {}

    public static Playlist create(String userId, String name) {
        Playlist playlist = new Playlist();
        playlist.userId = userId;
        playlist.name = name;
        playlist.createdAt = Instant.now();
        return playlist;
    }

    public static Playlist restore(UUID id, String userId, String name, boolean isCollaborative, Group group, String shareToken, Instant createdAt, Instant deletedAt) {
        Playlist playlist = new Playlist();
        playlist.id = id;
        playlist.userId = userId;
        playlist.name = name;
        playlist.isCollaborative = isCollaborative;
        playlist.group = group;
        playlist.shareToken = shareToken;
        playlist.createdAt = createdAt;
        playlist.deletedAt = deletedAt;
        return playlist;
    }

    public void updateName(String name) {
        this.name = name;
    }

    public void makeCollaborative(Group group) {
        this.isCollaborative = true;
        this.group = group;
    }

    public void removeCollaborative() {
        this.isCollaborative = false;
        this.group = null;
    }

    public void softDelete() {
        this.deletedAt = Instant.now();
    }

    public void restoreDeleted() {
        this.deletedAt = null;
    }

    public String generateShareToken() {
        if (this.shareToken == null) {
            this.shareToken = java.util.UUID.randomUUID().toString().replace("-", "").substring(0, 16);
        }
        return this.shareToken;
    }

    public void addSong(PlaylistSong song) {
        this.songs.add(song);
    }
    
    public void removeSong(PlaylistSong song) {
        this.songs.remove(song);
    }

    public UUID getId() { return id; }
    public String getUserId() { return userId; }
    public String getName() { return name; }
    public boolean isCollaborative() { return isCollaborative; }
    public Group getGroup() { return group; }
    public String getShareToken() { return shareToken; }
    public List<PlaylistSong> getSongs() { return songs; }
    public Instant getCreatedAt() { return createdAt; }
    public Instant getDeletedAt() { return deletedAt; }

    public void setId(UUID id) { this.id = id; }
    public void setCreatedAt(Instant createdAt) { this.createdAt = createdAt; }
}
