package br.com.cifras.group.application.usecase;

import br.com.cifras.group.model.GroupInvitation;
import br.com.cifras.group.infra.persistence.repository.GroupInvitationRepository;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import jakarta.transaction.Transactional;
import java.util.UUID;

@ApplicationScoped
public class DismissGroupInvitationUseCase {

    @Inject
    GroupInvitationRepository invitationRepository;

    @Transactional
    public void execute(UUID inviteId, String inviterId) {
        GroupInvitation invite = invitationRepository.findById(inviteId).orElse(null);
        if (invite != null && invite.getInviterId().equals(inviterId)) {
            invitationRepository.delete(invite.getId());
        }
    }
}
