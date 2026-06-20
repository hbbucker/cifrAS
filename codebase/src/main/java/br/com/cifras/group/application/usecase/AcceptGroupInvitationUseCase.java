package br.com.cifras.group.application.usecase;

import br.com.cifras.group.model.GroupInvitation;
import br.com.cifras.group.model.GroupInvitationStatus;
import br.com.cifras.group.model.GroupMember;
import br.com.cifras.group.model.GroupRole;
import br.com.cifras.group.infra.persistence.repository.GroupRepository;
import br.com.cifras.group.infra.persistence.repository.GroupInvitationRepository;
import br.com.cifras.shared.exception.NotFoundException;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import jakarta.transaction.Transactional;
import java.util.UUID;

@ApplicationScoped
public class AcceptGroupInvitationUseCase {

    @Inject
    GroupInvitationRepository invitationRepository;

    @Inject
    GroupRepository groupRepository;

    @Transactional
    public void execute(UUID inviteId, String currentUserEmail, String currentUserId) {
        GroupInvitation invite = invitationRepository.findById(inviteId).orElseThrow(() -> new NotFoundException("Invitation not found"));
        if (!invite.getInviteeEmail().equalsIgnoreCase(currentUserEmail)) {
            throw new NotFoundException("Invitation not found");
        }
        if (invite.getStatus() != GroupInvitationStatus.PENDING) {
            throw new IllegalArgumentException("Invitation is not pending");
        }
        invite.accept();
        invitationRepository.update(invite);
        
        if (!groupRepository.isMember(invite.getGroup().getId(), currentUserId)) {
            GroupMember member = GroupMember.create(invite.getGroup(), currentUserId, GroupRole.MEMBER);
            groupRepository.persistMember(member);
        }
    }
}
