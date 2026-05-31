package br.com.cifras.group.application.usecase;

import br.com.cifras.group.model.Group;
import br.com.cifras.group.model.GroupMember;
import br.com.cifras.group.model.GroupRole;
import br.com.cifras.group.infra.persistence.repository.GroupRepository;
import br.com.cifras.shared.exception.ForbiddenException;
import br.com.cifras.shared.exception.NotFoundException;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import jakarta.transaction.Transactional;
import java.util.UUID;

@ApplicationScoped
public class AddGroupMemberUseCase {

    @Inject
    GroupRepository groupRepository;

    @Transactional
    public void execute(UUID groupId, String targetUserId, String requestingUserId) {
        Group group = groupRepository.findById(groupId).orElseThrow(() -> new NotFoundException("Group not found"));
        if (!groupRepository.isOwner(groupId, requestingUserId)) throw new ForbiddenException("Only OWNER can add members");

        GroupMember member = GroupMember.create(group, targetUserId, GroupRole.MEMBER);
        groupRepository.persistMember(member);
    }
}
