package br.com.cifras.song.infra.persistence.mapper;

import br.com.cifras.song.infra.persistence.entity.SongEntity;
import br.com.cifras.song.model.Song;
import jakarta.enterprise.context.ApplicationScoped;

@ApplicationScoped
public class SongMapper {

    public Song toDomain(SongEntity entity) {
        if (entity == null) return null;
        return Song.restore(
            entity.id, entity.userId, entity.title, entity.artist, entity.originalKey, entity.lyrics,
            entity.prefUseBb, entity.prefUseEb, entity.prefAutoScrollSpeed, entity.prefTransposeSteps,
            entity.createdAt, entity.updatedAt, entity.deletedAt
        );
    }

    public SongEntity toEntity(Song song) {
        if (song == null) return null;
        SongEntity entity = new SongEntity();
        entity.id = song.getId();
        entity.userId = song.getUserId();
        entity.title = song.getTitle();
        entity.artist = song.getArtist();
        entity.originalKey = song.getOriginalKey();
        entity.lyrics = song.getLyrics();
        entity.prefUseBb = song.getPrefUseBb();
        entity.prefUseEb = song.getPrefUseEb();
        entity.prefAutoScrollSpeed = song.getPrefAutoScrollSpeed();
        entity.prefTransposeSteps = song.getPrefTransposeSteps();
        entity.createdAt = song.getCreatedAt();
        entity.updatedAt = song.getUpdatedAt();
        entity.deletedAt = song.getDeletedAt();
        return entity;
    }

    public void updateEntity(Song song, SongEntity entity) {
        entity.title = song.getTitle();
        entity.artist = song.getArtist();
        entity.originalKey = song.getOriginalKey();
        entity.lyrics = song.getLyrics();
        entity.prefUseBb = song.getPrefUseBb();
        entity.prefUseEb = song.getPrefUseEb();
        entity.prefAutoScrollSpeed = song.getPrefAutoScrollSpeed();
        entity.prefTransposeSteps = song.getPrefTransposeSteps();
        entity.updatedAt = song.getUpdatedAt();
        entity.deletedAt = song.getDeletedAt();
    }
}
