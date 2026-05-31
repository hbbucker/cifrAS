package br.com.cifras.group.application.usecase;

import br.com.cifras.group.model.Group;
import br.com.cifras.group.infra.persistence.repository.GroupRepository;
import br.com.cifras.playlist.model.Playlist;
import br.com.cifras.playlist.infra.persistence.repository.PlaylistRepository;
import br.com.cifras.shared.exception.ForbiddenException;
import br.com.cifras.shared.exception.NotFoundException;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import jakarta.transaction.Transactional;
import java.util.UUID;

@ApplicationScoped
public class LinkGroupPlaylistUseCase {

    @Inject
    GroupRepository groupRepository;

    @Inject
    PlaylistRepository playlistRepository;

    @Transactional
    public void execute(UUID groupId, UUID playlistId, String requestingUserId) {
        if (!groupRepository.isOwner(groupId, requestingUserId)) throw new ForbiddenException("Only OWNER can link playlists to the group");
        
        Group group = groupRepository.findById(groupId).orElseThrow(() -> new NotFoundException("Group not found"));

        Playlist playlist = playlistRepository.findActiveById(playlistId).orElse(null);
        if (playlist == null) throw new NotFoundException("Playlist not found");

        if (!playlist.getUserId().equals(requestingUserId)) throw new ForbiddenException("Only the playlist owner can link it");

        playlist.makeCollaborative(group);
        playlistRepository.update(playlist);
    }
}
