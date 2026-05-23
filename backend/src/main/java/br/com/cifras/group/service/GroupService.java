package br.com.cifras.group.service;

import br.com.cifras.group.domain.Group;
import br.com.cifras.group.domain.GroupMember;
import br.com.cifras.group.domain.GroupRole;
import br.com.cifras.group.repository.GroupRepository;
import br.com.cifras.shared.exception.ForbiddenException;
import br.com.cifras.shared.exception.NotFoundException;
import io.quarkus.hibernate.orm.panache.PanacheRepository;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import jakarta.transaction.Transactional;

import java.util.List;
import java.util.Optional;

/**
 * GroupService — group management and membership control.
 */
@ApplicationScoped
public class GroupService {

    @Inject
    GroupRepository groupRepository;

    public boolean isMember(Long groupId, String userId) {
        return groupRepository.isMember(groupId, userId);
    }

    public boolean isOwner(Long groupId, String userId) {
        return groupRepository.isOwner(groupId, userId);
    }

    @Transactional
    public Group createGroup(String name, String ownerId) {
        Group group = new Group();
        group.name = name;
        group.ownerId = ownerId;
        group.persist();

        // Add the creator as OWNER member
        GroupMember owner = new GroupMember();
        owner.group = group;
        owner.userId = ownerId;
        owner.role = GroupRole.OWNER;
        owner.persist();

        return group;
    }

    @Transactional
    public void addMember(Long groupId, String targetUserId, String requestingUserId) {
        Group group = Group.findById(groupId);
        if (group == null) throw new NotFoundException("Group not found");
        if (!isOwner(groupId, requestingUserId)) throw new ForbiddenException("Only OWNER can invite members");

        GroupMember member = new GroupMember();
        member.group = group;
        member.userId = targetUserId;
        member.role = GroupRole.MEMBER;
        member.persist();
    }

    @Transactional
    public void removeMember(Long groupId, String targetUserId, String requestingUserId) {
        if (!isOwner(groupId, requestingUserId)) throw new ForbiddenException("Only OWNER can remove members");
        GroupMember member = groupRepository.findMember(groupId, targetUserId)
            .orElseThrow(() -> new NotFoundException("Member not found"));
        member.delete();
    }

    public List<Group> listGroupsByUser(String userId) {
        return GroupMember.<GroupMember>list("userId", userId)
            .stream().map(m -> m.group).toList();
    }
}
