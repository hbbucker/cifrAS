package br.com.cifras.group.model;

import br.com.cifras.playlist.model.Playlist;

import java.time.Instant;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

public class Group {
    private UUID id;
    private String name;
    private String ownerId;

    private List<GroupMember> members = new ArrayList<>();
    private List<Playlist> collaborativePlaylists = new ArrayList<>();

    private Instant createdAt;
    private Instant updatedAt;

    protected Group() {}

    public static Group create(String name, String ownerId) {
        Group group = new Group();
        group.name = name;
        group.ownerId = ownerId;
        group.createdAt = Instant.now();
        group.updatedAt = Instant.now();
        return group;
    }

    public static Group restore(UUID id, String name, String ownerId, Instant createdAt, Instant updatedAt) {
        Group group = new Group();
        group.id = id;
        group.name = name;
        group.ownerId = ownerId;
        group.createdAt = createdAt;
        group.updatedAt = updatedAt;
        return group;
    }

    public void updateDetails(String name) {
        this.name = name;
        this.updatedAt = Instant.now();
    }

    public void addMember(GroupMember member) {
        this.members.add(member);
    }

    public UUID getId() { return id; }
    public String getName() { return name; }
    public String getOwnerId() { return ownerId; }
    public List<GroupMember> getMembers() { return members; }
    public List<Playlist> getCollaborativePlaylists() { return collaborativePlaylists; }
    public Instant getCreatedAt() { return createdAt; }
    public Instant getUpdatedAt() { return updatedAt; }

    public void setId(UUID id) { this.id = id; }
    public void setCreatedAt(Instant createdAt) { this.createdAt = createdAt; }
    public void setUpdatedAt(Instant updatedAt) { this.updatedAt = updatedAt; }
}
