package br.com.cifras.playlist.infra.persistence.mapper;

import br.com.cifras.playlist.infra.persistence.entity.PlaylistEntity;
import br.com.cifras.playlist.infra.persistence.entity.PlaylistSongEntity;
import br.com.cifras.playlist.model.Playlist;
import br.com.cifras.playlist.model.PlaylistSong;
import br.com.cifras.song.infra.persistence.mapper.SongMapper;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;

import java.util.stream.Collectors;

@ApplicationScoped
public class PlaylistMapper {

    @Inject
    SongMapper songMapper;

    public Playlist toDomain(PlaylistEntity entity) {
        if (entity == null) return null;
        Playlist playlist = new Playlist();
        playlist.id = entity.id;
        playlist.userId = entity.userId;
        playlist.name = entity.name;
        playlist.isCollaborative = entity.isCollaborative;
        playlist.group = entity.group;
        playlist.createdAt = entity.createdAt;
        playlist.deletedAt = entity.deletedAt;
        
        if (entity.songs != null) {
            playlist.songs = entity.songs.stream().map(this::toDomainSong).collect(Collectors.toList());
        }
        
        return playlist;
    }

    public PlaylistSong toDomainSong(PlaylistSongEntity entity) {
        if (entity == null) return null;
        PlaylistSong ps = new PlaylistSong();
        ps.id = entity.id;
        ps.song = songMapper.toDomain(entity.song);
        ps.position = entity.position;
        ps.version = entity.version;
        return ps;
    }

    public PlaylistEntity toEntity(Playlist playlist) {
        if (playlist == null) return null;
        PlaylistEntity entity = new PlaylistEntity();
        entity.id = playlist.id;
        entity.userId = playlist.userId;
        entity.name = playlist.name;
        entity.isCollaborative = playlist.isCollaborative;
        entity.group = playlist.group;
        entity.createdAt = playlist.createdAt;
        entity.deletedAt = playlist.deletedAt;
        
        // Handling the songs list requires setting the playlist reference on each song entity
        if (playlist.songs != null) {
            entity.songs = playlist.songs.stream().map(ps -> {
                PlaylistSongEntity pse = toEntitySong(ps);
                pse.playlist = entity;
                return pse;
            }).collect(Collectors.toList());
        }
        
        return entity;
    }

    public PlaylistSongEntity toEntitySong(PlaylistSong ps) {
        if (ps == null) return null;
        PlaylistSongEntity entity = new PlaylistSongEntity();
        entity.id = ps.id;
        entity.song = songMapper.toEntity(ps.song);
        entity.position = ps.position;
        entity.version = ps.version;
        return entity;
    }

    public void updateEntity(Playlist playlist, PlaylistEntity entity) {
        entity.name = playlist.name;
        entity.isCollaborative = playlist.isCollaborative;
        entity.group = playlist.group;
        entity.deletedAt = playlist.deletedAt;
        
        // In a real application, updating the OneToMany collection robustly requires matching IDs, 
        // removing missing ones, and adding new ones. But since Panache supports orphanRemoval=true,
        // replacing the list or updating it carefully is needed. We will keep it simple for now, 
        // assuming PlaylistService adds/removes songs explicitly.
        
        if (playlist.songs != null) {
            entity.songs.clear();
            entity.songs.addAll(playlist.songs.stream().map(ps -> {
                PlaylistSongEntity pse = toEntitySong(ps);
                pse.playlist = entity;
                return pse;
            }).collect(Collectors.toList()));
        }
    }
}
