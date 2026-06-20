package br.com.cifras.group.application.usecase;

import br.com.cifras.group.model.Group;
import br.com.cifras.group.model.GroupMember;
import br.com.cifras.group.model.GroupRole;
import br.com.cifras.group.infra.persistence.repository.GroupRepository;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import jakarta.transaction.Transactional;

@ApplicationScoped
public class CreateGroupUseCase {

    @Inject
    GroupRepository groupRepository;

    @Transactional
    public Group execute(String name, String ownerId) {
        Group group = Group.create(name, ownerId);
        groupRepository.persist(group);

        GroupMember owner = GroupMember.create(group, ownerId, GroupRole.OWNER);
        groupRepository.persistMember(owner);

        return group;
    }
}
