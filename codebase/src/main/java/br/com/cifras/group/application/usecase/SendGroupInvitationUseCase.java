package br.com.cifras.group.application.usecase;

import br.com.cifras.group.model.Group;
import br.com.cifras.group.model.GroupInvitation;
import br.com.cifras.group.infra.persistence.repository.GroupRepository;
import br.com.cifras.group.infra.persistence.repository.GroupInvitationRepository;
import br.com.cifras.shared.security.UserService;
import br.com.cifras.shared.exception.ForbiddenException;
import br.com.cifras.shared.exception.NotFoundException;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import jakarta.transaction.Transactional;
import java.util.UUID;

@ApplicationScoped
public class SendGroupInvitationUseCase {

    @Inject
    GroupRepository groupRepository;

    @Inject
    GroupInvitationRepository invitationRepository;

    @Inject
    UserService userService;

    @Transactional
    public void execute(UUID groupId, String targetEmail, String requestingUserId) {
        if (!groupRepository.isOwner(groupId, requestingUserId)) throw new ForbiddenException("Only OWNER can invite members");
        Group group = groupRepository.findById(groupId).orElseThrow(() -> new NotFoundException("Group not found"));

        String targetUserId = userService.getUserIdByEmail(targetEmail);
        if (targetUserId == null) {
            throw new IllegalArgumentException("User with provided email is not registered.");
        }
        
        if (groupRepository.isMember(groupId, targetUserId)) {
            throw new IllegalArgumentException("User is already a member of this group.");
        }

        GroupInvitation invite = GroupInvitation.create(group, requestingUserId, targetEmail);
        invitationRepository.persist(invite);
    }
}
