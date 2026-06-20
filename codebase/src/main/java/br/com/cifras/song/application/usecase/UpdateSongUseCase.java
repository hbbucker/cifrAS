package br.com.cifras.song.application.usecase;

import br.com.cifras.shared.exception.ForbiddenException;
import br.com.cifras.shared.exception.NotFoundException;
import br.com.cifras.song.model.Song;
import br.com.cifras.song.dto.UpdateSongRequest;
import br.com.cifras.song.infra.persistence.repository.SongRepository;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import jakarta.transaction.Transactional;
import java.util.UUID;

@ApplicationScoped
public class UpdateSongUseCase {

    @Inject
    SongRepository songRepository;

    @Transactional
    public Song execute(UUID id, UpdateSongRequest req, String userId) {
        Song song = songRepository.findActiveById(id)
            .orElseThrow(() -> new NotFoundException("Song not found: " + id));

        if (!userId.equals(song.getUserId())) {
            throw new ForbiddenException("You do not own this song");
        }

        song.updateDetails(req.title(), req.artist(), req.originalKey(), req.lyrics());
        songRepository.update(song);
        return song;
    }
}
