package br.com.cifras.playlist.application.usecase;

import br.com.cifras.group.infra.persistence.repository.GroupRepository;
import br.com.cifras.playlist.model.Playlist;
import br.com.cifras.playlist.infra.persistence.repository.PlaylistRepository;
import br.com.cifras.shared.exception.ForbiddenException;
import br.com.cifras.shared.exception.NotFoundException;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import java.util.UUID;

@ApplicationScoped
public class GetPlaylistUseCase {

    @Inject
    PlaylistRepository playlistRepository;

    @Inject
    GroupRepository groupRepository;

    public Playlist execute(UUID playlistId, String userId) {
        Playlist playlist = playlistRepository.findActiveById(playlistId)
            .orElseThrow(() -> new NotFoundException("Playlist not found"));

        if (!canRead(playlist, userId)) {
            throw new ForbiddenException("Access denied to playlist");
        }
        return playlist;
    }

    private boolean canRead(Playlist playlist, String userId) {
        if (userId.equals(playlist.getUserId())) {
            return true;
        }
        if (playlist.isCollaborative() && playlist.getGroup() != null) {
            return groupRepository.isMember(playlist.getGroup().getId(), userId);
        }
        return false;
    }
}
