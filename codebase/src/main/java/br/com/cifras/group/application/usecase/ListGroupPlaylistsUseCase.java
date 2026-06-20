package br.com.cifras.group.application.usecase;

import br.com.cifras.group.model.Group;
import br.com.cifras.group.infra.persistence.repository.GroupRepository;
import br.com.cifras.playlist.model.Playlist;
import br.com.cifras.playlist.infra.persistence.repository.PlaylistRepository;
import br.com.cifras.shared.exception.ForbiddenException;
import br.com.cifras.shared.exception.NotFoundException;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import java.util.List;
import java.util.UUID;

@ApplicationScoped
public class ListGroupPlaylistsUseCase {

    @Inject
    GroupRepository groupRepository;

    @Inject
    PlaylistRepository playlistRepository;

    public List<Playlist> execute(UUID groupId, String requestingUserId) {
        if (!groupRepository.isMember(groupId, requestingUserId)) throw new ForbiddenException("Only members can view group playlists");
        
        Group group = groupRepository.findById(groupId).orElseThrow(() -> new NotFoundException("Group not found"));

        return playlistRepository.findCollaborativeActive(requestingUserId).stream()
                .filter(p -> p.getGroup() != null && p.getGroup().getId().equals(groupId))
                .toList();
    }
}
