package br.com.cifras.group.application.usecase;

import br.com.cifras.group.dto.GroupInvitationDTO;
import br.com.cifras.group.infra.persistence.repository.GroupInvitationRepository;
import br.com.cifras.group.infra.persistence.repository.GroupRepository;
import br.com.cifras.group.model.Group;
import br.com.cifras.group.model.GroupInvitation;
import br.com.cifras.shared.exception.ForbiddenException;
import br.com.cifras.shared.exception.NotFoundException;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;

import java.util.List;
import java.util.UUID;

@ApplicationScoped
public class ListGroupInvitationsUseCase {

    @Inject
    GroupRepository groupRepository;

    @Inject
    GroupInvitationRepository invitationRepository;

    public List<GroupInvitationDTO> execute(UUID groupId, String requestingUserId) {
        groupRepository.findById(groupId)
                .orElseThrow(() -> new NotFoundException("Group not found"));

        if (!groupRepository.isOwnerOrAdmin(groupId, requestingUserId)) {
            throw new ForbiddenException("Only OWNER or ADMIN can view group invitations.");
        }

        List<GroupInvitation> invites = invitationRepository.findByGroupId(groupId);
        return invites.stream().map(GroupInvitationDTO::from).toList();
    }
}
