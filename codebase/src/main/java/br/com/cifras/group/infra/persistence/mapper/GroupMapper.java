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
        Group group = new Group();
        group.id = entity.id;
        group.name = entity.name;
        group.ownerId = entity.ownerId;
        return group;
    }

    public GroupMember toDomainMember(GroupMemberEntity entity) {
        if (entity == null) return null;
        GroupMember member = new GroupMember();
        member.id = entity.id;
        member.userId = entity.userId;
        member.role = entity.role;
        return member;
    }

    public GroupInvitation toDomainInvitation(GroupInvitationEntity entity) {
        if (entity == null) return null;
        GroupInvitation inv = new GroupInvitation();
        inv.id = entity.id;
        inv.group = toDomain(entity.group);
        inv.inviterId = entity.inviterId;
        inv.inviteeEmail = entity.inviteeEmail;
        inv.status = entity.status;
        return inv;
    }

    public GroupEntity toEntity(Group group) {
        if (group == null) return null;
        GroupEntity entity = new GroupEntity();
        entity.id = group.id;
        entity.name = group.name;
        entity.ownerId = group.ownerId;
        return entity;
    }

    public GroupMemberEntity toEntityMember(GroupMember member) {
        if (member == null) return null;
        GroupMemberEntity entity = new GroupMemberEntity();
        entity.id = member.id;
        entity.userId = member.userId;
        entity.role = member.role;
        return entity;
    }

    public GroupInvitationEntity toEntityInvitation(GroupInvitation inv) {
        if (inv == null) return null;
        GroupInvitationEntity entity = new GroupInvitationEntity();
        entity.id = inv.id;
        if (inv.group != null) {
            entity.group = toEntity(inv.group);
        }
        entity.inviterId = inv.inviterId;
        entity.inviteeEmail = inv.inviteeEmail;
        entity.status = inv.status;
        return entity;
    }

    public void updateEntity(Group group, GroupEntity entity) {
        entity.name = group.name;
    }
}
