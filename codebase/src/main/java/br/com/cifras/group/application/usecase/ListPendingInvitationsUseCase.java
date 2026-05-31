package br.com.cifras.group.application.usecase;

import br.com.cifras.group.model.GroupInvitation;
import br.com.cifras.group.infra.persistence.repository.GroupInvitationRepository;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import java.util.List;

@ApplicationScoped
public class ListPendingInvitationsUseCase {

    @Inject
    GroupInvitationRepository invitationRepository;

    public List<GroupInvitation> execute(String email) {
        return invitationRepository.findPendingByEmail(email);
    }
}
