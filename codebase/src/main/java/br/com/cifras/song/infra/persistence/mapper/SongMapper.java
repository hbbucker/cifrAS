package br.com.cifras.song.infra.persistence.mapper;

import br.com.cifras.song.infra.persistence.entity.SongEntity;
import br.com.cifras.song.model.Song;
import jakarta.enterprise.context.ApplicationScoped;

@ApplicationScoped
public class SongMapper {

    public Song toDomain(SongEntity entity) {
        if (entity == null) return null;
        Song song = new Song();
        song.id = entity.id;
        song.userId = entity.userId;
        song.title = entity.title;
        song.artist = entity.artist;
        song.originalKey = entity.originalKey;
        song.lyrics = entity.lyrics;
        song.prefUseBb = entity.prefUseBb;
        song.prefUseEb = entity.prefUseEb;
        song.prefAutoScrollSpeed = entity.prefAutoScrollSpeed;
        song.prefTransposeSteps = entity.prefTransposeSteps;
        song.createdAt = entity.createdAt;
        song.updatedAt = entity.updatedAt;
        song.deletedAt = entity.deletedAt;
        return song;
    }

    public SongEntity toEntity(Song song) {
        if (song == null) return null;
        SongEntity entity = new SongEntity();
        entity.id = song.id;
        entity.userId = song.userId;
        entity.title = song.title;
        entity.artist = song.artist;
        entity.originalKey = song.originalKey;
        entity.lyrics = song.lyrics;
        entity.prefUseBb = song.prefUseBb;
        entity.prefUseEb = song.prefUseEb;
        entity.prefAutoScrollSpeed = song.prefAutoScrollSpeed;
        entity.prefTransposeSteps = song.prefTransposeSteps;
        entity.createdAt = song.createdAt;
        entity.updatedAt = song.updatedAt;
        entity.deletedAt = song.deletedAt;
        return entity;
    }

    public void updateEntity(Song song, SongEntity entity) {
        entity.title = song.title;
        entity.artist = song.artist;
        entity.originalKey = song.originalKey;
        entity.lyrics = song.lyrics;
        entity.prefUseBb = song.prefUseBb;
        entity.prefUseEb = song.prefUseEb;
        entity.prefAutoScrollSpeed = song.prefAutoScrollSpeed;
        entity.prefTransposeSteps = song.prefTransposeSteps;
        entity.deletedAt = song.deletedAt;
    }
}
