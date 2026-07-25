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

    @Inject
    br.com.cifras.group.infra.persistence.mapper.GroupMapper groupMapper;

    public Playlist toDomain(PlaylistEntity entity) {
        if (entity == null) return null;
        Playlist playlist = Playlist.restore(
            entity.id,
            entity.userId,
            entity.name,
            entity.isCollaborative,
            groupMapper.toDomain(entity.group),
            entity.shareToken,
            entity.createdAt,
            entity.deletedAt
        );
        
        if (entity.songs != null) {
            entity.songs.forEach(pse -> playlist.addSong(toDomainSong(pse)));
        }
        
        return playlist;
    }

    public PlaylistSong toDomainSong(PlaylistSongEntity entity) {
        if (entity == null) return null;
        return PlaylistSong.restore(entity.id, songMapper.toDomain(entity.song), entity.position, entity.version);
    }

    public PlaylistEntity toEntity(Playlist playlist) {
        if (playlist == null) return null;
        PlaylistEntity entity = new PlaylistEntity();
        entity.id = playlist.getId();
        entity.userId = playlist.getUserId();
        entity.name = playlist.getName();
        entity.isCollaborative = playlist.isCollaborative();
        entity.group = groupMapper.toEntity(playlist.getGroup());
        entity.shareToken = playlist.getShareToken();
        entity.createdAt = playlist.getCreatedAt();
        entity.deletedAt = playlist.getDeletedAt();
        
        if (playlist.getSongs() != null) {
            entity.songs = playlist.getSongs().stream().map(ps -> {
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
        entity.id = ps.getId();
        entity.song = songMapper.toEntity(ps.getSong());
        entity.position = ps.getPosition();
        entity.version = ps.getVersion();
        return entity;
    }

    public void updateEntity(Playlist playlist, PlaylistEntity entity) {
        entity.name = playlist.getName();
        entity.isCollaborative = playlist.isCollaborative();
        entity.group = groupMapper.toEntity(playlist.getGroup());
        entity.shareToken = playlist.getShareToken();
        entity.deletedAt = playlist.getDeletedAt();
        
        if (playlist.getSongs() != null) {
            entity.songs.removeIf(existing -> playlist.getSongs().stream().noneMatch(ps -> ps.getId() != null && ps.getId().equals(existing.id)));
            
            for (PlaylistSong ps : playlist.getSongs()) {
                if (ps.getId() == null) {
                    PlaylistSongEntity pse = toEntitySong(ps);
                    pse.playlist = entity;
                    entity.songs.add(pse);
                } else {
                    entity.songs.stream().filter(e -> ps.getId().equals(e.id)).findFirst().ifPresent(e -> {
                        e.position = ps.getPosition();
                    });
                }
            }
        }
    }
}
