package br.com.cifras.song.application.usecase;

import br.com.cifras.shared.exception.ForbiddenException;
import br.com.cifras.shared.exception.NotFoundException;
import br.com.cifras.song.infra.persistence.repository.SongShareRepository;
import br.com.cifras.song.model.SongShare;
import br.com.cifras.song.model.SongShareStatus;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import jakarta.transaction.Transactional;

import java.util.UUID;

@ApplicationScoped
public class DeclineSongShareUseCase {

    @Inject
    SongShareRepository songShareRepository;

    @Transactional
    public void execute(UUID shareId, String currentUserEmail) {
        SongShare share = songShareRepository.findById(shareId)
                .orElseThrow(() -> new NotFoundException("Song share not found"));

        if (currentUserEmail == null || !share.getInviteeEmail().equalsIgnoreCase(currentUserEmail.trim())) {
            throw new ForbiddenException("You cannot decline a share that was not sent to you");
        }

        if (share.getStatus() != SongShareStatus.PENDING) {
            throw new IllegalStateException("Only pending shares can be declined");
        }

        share.decline();
        songShareRepository.update(share);
    }
}
