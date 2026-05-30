package br.com.cifras.playlist.model;

import br.com.cifras.group.infra.persistence.entity.GroupEntity;

import java.time.Instant;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

public class Playlist {

    public UUID id;
    public String userId;
    public String name;
    public boolean isCollaborative = false;
    
    // For now we'll keep the GroupEntity reference here, but ideally it should be Group
    public GroupEntity group;
    
    public List<PlaylistSong> songs = new ArrayList<>();
    
    public Instant createdAt;
    public Instant deletedAt;

    public Playlist() {}
}
