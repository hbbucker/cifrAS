package br.com.cifras.song.application.usecase;

import br.com.cifras.song.model.Song;
import br.com.cifras.song.dto.CreateSongRequest;
import br.com.cifras.song.infra.persistence.repository.SongRepository;
import br.com.cifras.user.application.QuotaService;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import jakarta.transaction.Transactional;

@ApplicationScoped
public class CreateSongUseCase {

    @Inject
    SongRepository songRepository;
    
    @Inject
    QuotaService quotaService;

    @Transactional
    public Song execute(CreateSongRequest req, String userId) {
        quotaService.checkSongQuota(userId);
        Song song = Song.create(userId, req.title(), req.artist(), req.originalKey(), req.lyrics(), req.tags());
        songRepository.persist(song);
        return song;
    }
}
