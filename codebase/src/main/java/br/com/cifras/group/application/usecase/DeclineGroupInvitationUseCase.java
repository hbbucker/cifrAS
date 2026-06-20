package br.com.cifras.group.application.usecase;

import br.com.cifras.group.model.GroupInvitation;
import br.com.cifras.group.model.GroupInvitationStatus;
import br.com.cifras.group.infra.persistence.repository.GroupInvitationRepository;
import br.com.cifras.shared.exception.NotFoundException;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import jakarta.transaction.Transactional;
import java.util.UUID;

@ApplicationScoped
public class DeclineGroupInvitationUseCase {

    @Inject
    GroupInvitationRepository invitationRepository;

    @Transactional
    public void execute(UUID inviteId, String currentUserEmail) {
        GroupInvitation invite = invitationRepository.findById(inviteId).orElseThrow(() -> new NotFoundException("Invitation not found"));
        if (!invite.getInviteeEmail().equalsIgnoreCase(currentUserEmail)) {
            throw new NotFoundException("Invitation not found");
        }
        if (invite.getStatus() != GroupInvitationStatus.PENDING) {
            throw new IllegalArgumentException("Invitation is not pending");
        }
        invite.reject();
        invitationRepository.update(invite);
    }
}
