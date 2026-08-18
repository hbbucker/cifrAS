package br.com.cifras.song.application.usecase;

import br.com.cifras.shared.exception.ConflictException;
import br.com.cifras.shared.exception.ForbiddenException;
import br.com.cifras.shared.exception.NotFoundException;
import br.com.cifras.shared.security.UserService;
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
public class ShareSongUseCase {

    @Inject
    SongRepository songRepository;

    @Inject
    SongShareRepository songShareRepository;

    @Inject
    UserService userService;

    @Transactional
    public SongShare execute(UUID songId, String targetEmail, String requestingUserId) {
        if (targetEmail == null || targetEmail.isBlank()) {
            throw new IllegalArgumentException("Email is required");
        }
        String cleanEmail = targetEmail.trim().toLowerCase();

        Song song = songRepository.findActiveById(songId)
                .orElseThrow(() -> new NotFoundException("Song not found"));

        if (!song.getUserId().equals(requestingUserId)) {
            throw new ForbiddenException("You can only share your own songs");
        }

        String targetUserId = userService.getUserIdByEmail(cleanEmail);
        if (targetUserId == null) {
            throw new NotFoundException("User with provided email is not registered");
        }

        if (targetUserId.equals(requestingUserId)) {
            throw new IllegalArgumentException("You cannot share a song with yourself");
        }

        songShareRepository.findBySongAndInvitee(songId, cleanEmail, SongShareStatus.PENDING)
                .ifPresent(existing -> {
                    throw new ConflictException("Song is already shared with this user and pending approval");
                });

        SongShare share = SongShare.create(songId, requestingUserId, cleanEmail);
        songShareRepository.persist(share);
        return share;
    }
}
