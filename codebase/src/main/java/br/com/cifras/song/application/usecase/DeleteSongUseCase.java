package br.com.cifras.song.application.usecase;

import br.com.cifras.shared.exception.ForbiddenException;
import br.com.cifras.shared.exception.NotFoundException;
import br.com.cifras.song.model.Song;
import br.com.cifras.song.infra.persistence.repository.SongRepository;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import jakarta.transaction.Transactional;
import java.util.UUID;

@ApplicationScoped
public class DeleteSongUseCase {

    @Inject
    SongRepository songRepository;

    @Transactional
    public void execute(UUID id, String userId) {
        Song song = songRepository.findActiveById(id)
            .orElseThrow(() -> new NotFoundException("Song not found: " + id));

        if (!userId.equals(song.getUserId())) {
            throw new ForbiddenException("You do not own this song");
        }

        song.softDelete();
        songRepository.update(song);
    }
}
