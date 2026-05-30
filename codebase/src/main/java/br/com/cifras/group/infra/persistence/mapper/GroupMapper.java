package br.com.cifras.group.infra.persistence.mapper;

import br.com.cifras.group.infra.persistence.entity.GroupEntity;
import br.com.cifras.group.infra.persistence.entity.GroupMemberEntity;
import br.com.cifras.group.infra.persistence.entity.GroupInvitationEntity;
import br.com.cifras.group.model.Group;
import br.com.cifras.group.model.GroupMember;
import br.com.cifras.group.model.GroupInvitation;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;

@ApplicationScoped
public class GroupMapper {

    public Group toDomain(GroupEntity entity) {
        if (entity == null) return null;
        return Group.restore(entity.id, entity.name, entity.ownerId, null, null);
    }

    public GroupMember toDomainMember(GroupMemberEntity entity) {
        if (entity == null) return null;
        return GroupMember.restore(entity.id, toDomain(entity.group), entity.userId, entity.role, null);
    }

    public GroupInvitation toDomainInvitation(GroupInvitationEntity entity) {
        if (entity == null) return null;
        return GroupInvitation.restore(entity.id, toDomain(entity.group), entity.inviterId, entity.inviteeEmail, entity.status, null, null);
    }

    public GroupEntity toEntity(Group group) {
        if (group == null) return null;
        GroupEntity entity = new GroupEntity();
        entity.id = group.getId();
        entity.name = group.getName();
        entity.ownerId = group.getOwnerId();
        return entity;
    }

    public GroupMemberEntity toEntityMember(GroupMember member) {
        if (member == null) return null;
        GroupMemberEntity entity = new GroupMemberEntity();
        entity.id = member.getId();
        entity.userId = member.getUserId();
        entity.role = member.getRole();
        return entity;
    }

    public GroupInvitationEntity toEntityInvitation(GroupInvitation inv) {
        if (inv == null) return null;
        GroupInvitationEntity entity = new GroupInvitationEntity();
        entity.id = inv.getId();
        if (inv.getGroup() != null) {
            entity.group = toEntity(inv.getGroup());
        }
        entity.inviterId = inv.getInviterId();
        entity.inviteeEmail = inv.getInviteeEmail();
        entity.status = inv.getStatus();
        return entity;
    }

    public void updateEntity(Group group, GroupEntity entity) {
        entity.name = group.getName();
    }
}
