package br.com.cifras.group.model;

import br.com.cifras.playlist.model.Playlist;

import java.time.Instant;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

public class Group {

    public UUID id;
    public String name;
    public String ownerId;

    public List<GroupMember> members = new ArrayList<>();
    public List<Playlist> collaborativePlaylists = new ArrayList<>();

    public Instant createdAt;
    public Instant updatedAt;

    public Group() {}
}
