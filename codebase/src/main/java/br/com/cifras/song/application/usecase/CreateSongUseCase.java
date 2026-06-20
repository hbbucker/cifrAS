package br.com.cifras.song.application.usecase;

import br.com.cifras.song.model.Song;
import br.com.cifras.song.dto.CreateSongRequest;
import br.com.cifras.song.infra.persistence.repository.SongRepository;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import jakarta.transaction.Transactional;

@ApplicationScoped
public class CreateSongUseCase {

    @Inject
    SongRepository songRepository;

    @Transactional
    public Song execute(CreateSongRequest req, String userId) {
        Song song = Song.create(userId, req.title(), req.artist(), req.originalKey(), req.lyrics());
        songRepository.persist(song);
        return song;
    }
}
