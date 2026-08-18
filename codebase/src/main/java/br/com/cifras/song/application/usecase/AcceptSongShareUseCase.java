package br.com.cifras.song.application.usecase;

import br.com.cifras.shared.exception.ForbiddenException;
import br.com.cifras.shared.exception.NotFoundException;
import br.com.cifras.song.infra.persistence.repository.SongRepository;
import br.com.cifras.song.infra.persistence.repository.SongShareRepository;
import br.com.cifras.song.model.Song;
import br.com.cifras.song.model.SongShare;
import br.com.cifras.song.model.SongShareStatus;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import jakarta.transaction.Transactional;

import java.util.UUID;

@ApplicationScoped
public class AcceptSongShareUseCase {

    @Inject
    SongShareRepository songShareRepository;

    @Inject
    SongRepository songRepository;

    @Transactional
    public Song execute(UUID shareId, String currentUserEmail, String currentUserId) {
        SongShare share = songShareRepository.findById(shareId)
                .orElseThrow(() -> new NotFoundException("Song share not found"));

        if (currentUserEmail == null || !share.getInviteeEmail().equalsIgnoreCase(currentUserEmail.trim())) {
            throw new ForbiddenException("You cannot accept a share that was not sent to you");
        }

        if (share.getStatus() != SongShareStatus.PENDING) {
            throw new IllegalStateException("Only pending shares can be accepted");
        }

        Song originalSong = songRepository.findActiveById(share.getSongId())
                .orElseThrow(() -> new NotFoundException("Original song not found or no longer available"));

        share.accept();
        songShareRepository.update(share);

        Song clonedSong = Song.createCloneForUser(originalSong, currentUserId);
        songRepository.persist(clonedSong);

        return clonedSong;
    }
}
