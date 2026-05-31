package br.com.cifras.group.application.usecase;

import br.com.cifras.group.model.GroupMember;
import br.com.cifras.group.infra.persistence.repository.GroupRepository;
import br.com.cifras.shared.exception.ForbiddenException;
import br.com.cifras.shared.exception.NotFoundException;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import jakarta.transaction.Transactional;
import java.util.UUID;

@ApplicationScoped
public class RemoveGroupMemberUseCase {

    @Inject
    GroupRepository groupRepository;

    @Transactional
    public void execute(UUID groupId, String targetUserId, String requestingUserId) {
        if (!groupRepository.isOwner(groupId, requestingUserId)) throw new ForbiddenException("Only OWNER can remove members");
        GroupMember member = groupRepository.findMember(groupId, targetUserId)
            .orElseThrow(() -> new NotFoundException("Member not found"));
        groupRepository.deleteMember(member.getId());
    }
}
