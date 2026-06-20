package br.com.cifras.playlist.application.usecase;

import br.com.cifras.group.infra.persistence.repository.GroupRepository;
import br.com.cifras.playlist.model.Playlist;
import br.com.cifras.playlist.dto.CreatePlaylistRequest;
import br.com.cifras.playlist.infra.persistence.repository.PlaylistRepository;
import br.com.cifras.shared.exception.ForbiddenException;
import br.com.cifras.shared.exception.NotFoundException;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import jakarta.transaction.Transactional;

@ApplicationScoped
public class CreatePlaylistUseCase {

    @Inject
    PlaylistRepository playlistRepository;

    @Inject
    GroupRepository groupRepository;

    @Transactional
    public Playlist execute(CreatePlaylistRequest req, String userId) {
        Playlist playlist = Playlist.create(userId, req.name());
        
        if (req.isCollaborative() && req.groupId() != null) {
            br.com.cifras.group.model.Group group = groupRepository.findById(req.groupId()).orElse(null);
            if (group == null) throw new NotFoundException("Group not found");
            if (!groupRepository.isOwner(req.groupId(), userId)) {
                throw new ForbiddenException("Only group owner can link a playlist to it");
            }
            playlist.makeCollaborative(group);
        }
        
        playlistRepository.persist(playlist);
        return playlist;
    }
}
