package br.com.cifras.group.infra.persistence.repository;

import br.com.cifras.group.infra.persistence.entity.GroupEntity;
import br.com.cifras.group.infra.persistence.entity.GroupMemberEntity;
import br.com.cifras.group.infra.persistence.mapper.GroupMapper;
import br.com.cifras.group.model.Group;
import br.com.cifras.group.model.GroupMember;
import br.com.cifras.group.model.GroupRole;
import io.quarkus.hibernate.orm.panache.PanacheRepositoryBase;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;

import java.util.List;
import java.util.Optional;
import java.util.UUID;
import java.util.stream.Collectors;

@ApplicationScoped
public class GroupRepository {

    @ApplicationScoped
    static class JpaGroupRepository implements PanacheRepositoryBase<GroupEntity, UUID> {}

    @ApplicationScoped
    static class JpaGroupMemberRepository implements PanacheRepositoryBase<GroupMemberEntity, UUID> {}

    @Inject
    JpaGroupRepository jpaRepo;

    @Inject
    JpaGroupMemberRepository jpaMemberRepo;

    @Inject
    GroupMapper mapper;

    public Optional<Group> findById(UUID id) {
        return jpaRepo.findByIdOptional(id).map(mapper::toDomain);
    }

    public boolean isMember(UUID groupId, String userId) {
        return jpaMemberRepo.count("group.id = ?1 and userId = ?2", groupId, userId) > 0;
    }

    public boolean isOwner(UUID groupId, String userId) {
        return jpaMemberRepo.count("group.id = ?1 and userId = ?2 and role = ?3", 
                groupId, userId, GroupRole.OWNER) > 0;
    }

    public Optional<GroupMember> findMember(UUID groupId, String userId) {
        return jpaMemberRepo.find("group.id = ?1 and userId = ?2", groupId, userId)
                .firstResultOptional()
                .map(mapper::toDomainMember);
    }

    public List<Group> listGroupsByUser(String userId) {
        return jpaMemberRepo.list("userId", userId).stream()
                .map(m -> mapper.toDomain(m.group))
                .collect(Collectors.toList());
    }

    public void persist(Group group) {
        GroupEntity entity = mapper.toEntity(group);
        jpaRepo.persistAndFlush(entity);
        group.id = entity.id;
    }

    public void persistMember(GroupMember member) {
        GroupMemberEntity entity = mapper.toEntityMember(member);
        if (member.group != null && member.group.id != null) {
            entity.group = jpaRepo.findById(member.group.id);
        }
        jpaMemberRepo.persist(entity);
        member.id = entity.id;
    }

    public void update(Group group) {
        GroupEntity entity = jpaRepo.findById(group.id);
        if (entity != null) {
            mapper.updateEntity(group, entity);
            jpaRepo.persist(entity);
        }
    }
    
    public void deleteMember(UUID memberId) {
        jpaMemberRepo.deleteById(memberId);
    }
}
