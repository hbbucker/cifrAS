package br.com.cifras.group.application.usecase;

import br.com.cifras.group.infra.persistence.repository.GroupInvitationRepository;
import br.com.cifras.group.infra.persistence.repository.GroupRepository;
import br.com.cifras.group.model.GroupInvitation;
import br.com.cifras.shared.exception.ForbiddenException;
import br.com.cifras.shared.exception.NotFoundException;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import jakarta.transaction.Transactional;

import java.util.UUID;

@ApplicationScoped
public class CancelGroupInvitationUseCase {

    @Inject
    GroupRepository groupRepository;

    @Inject
    GroupInvitationRepository invitationRepository;

    @Transactional
    public void execute(UUID groupId, UUID invitationId, String requestingUserId) {
        groupRepository.findById(groupId)
                .orElseThrow(() -> new NotFoundException("Group not found"));

        if (!groupRepository.isOwnerOrAdmin(groupId, requestingUserId)) {
            throw new ForbiddenException("Only OWNER or ADMIN can cancel group invitations.");
        }

        GroupInvitation invite = invitationRepository.findById(invitationId)
                .orElseThrow(() -> new NotFoundException("Invitation not found"));

        if (invite.getGroup() == null || !groupId.equals(invite.getGroup().getId())) {
            throw new IllegalArgumentException("Invitation does not belong to this group.");
        }

        invitationRepository.delete(invitationId);
    }
}
