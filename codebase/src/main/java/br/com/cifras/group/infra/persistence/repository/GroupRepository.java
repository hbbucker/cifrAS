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

import java.util.*;
import java.util.stream.Collectors;

@ApplicationScoped
public class GroupRepository {

    @ApplicationScoped
    public static class JpaGroupRepository implements PanacheRepositoryBase<GroupEntity, UUID> {}

    @ApplicationScoped
    public static class JpaGroupMemberRepository implements PanacheRepositoryBase<GroupMemberEntity, UUID> {}

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

    public boolean isOwnerOrAdmin(UUID groupId, String userId) {
        return jpaMemberRepo.count("group.id = ?1 and userId = ?2 and (role = ?3 or role = ?4)", 
                groupId, userId, GroupRole.OWNER, GroupRole.ADMIN) > 0;
    }

    public Optional<GroupMember> findMember(UUID groupId, String userId) {
        return jpaMemberRepo.find("group.id = ?1 and userId = ?2", groupId, userId)
                .firstResultOptional()
                .map(mapper::toDomainMember);
    }

    public List<GroupMember> findMembersByGroupId(UUID groupId) {
        return jpaMemberRepo.list("group.id", groupId).stream()
                .map(mapper::toDomainMember)
                .collect(Collectors.toList());
    }

    public long countMembers(UUID groupId) {
        return jpaMemberRepo.count("group.id", groupId);
    }

    public Map<UUID, Long> countMembersForGroups(List<UUID> groupIds) {
        if (groupIds == null || groupIds.isEmpty()) return Collections.emptyMap();
        List<?> results = jpaMemberRepo.getEntityManager()
            .createQuery("SELECT m.group.id, count(m.id) FROM GroupMemberEntity m WHERE m.group.id IN (:groupIds) GROUP BY m.group.id")
            .setParameter("groupIds", groupIds)
            .getResultList();
        Map<UUID, Long> counts = new HashMap<>();
        for (Object item : results) {
            if (item instanceof Object[] row) {
                counts.put((UUID) row[0], ((Number) row[1]).longValue());
            }
        }
        return counts;
    }

    public List<Group> listGroupsByUser(String userId) {
        return jpaMemberRepo.list("userId", userId).stream()
                .map(m -> mapper.toDomain(m.group))
                .collect(Collectors.toList());
    }

    public void persist(Group group) {
        GroupEntity entity = mapper.toEntity(group);
        jpaRepo.persistAndFlush(entity);
        group.setId(entity.id);
    }

    public void persistMember(GroupMember member) {
        GroupMemberEntity entity = mapper.toEntityMember(member);
        if (member.getGroup() != null && member.getGroup().getId() != null) {
            entity.group = jpaRepo.findById(member.getGroup().getId());
        }
        jpaMemberRepo.persist(entity);
        member.setId(entity.id);
    }

    public void update(Group group) {
        GroupEntity entity = jpaRepo.findById(group.getId());
        if (entity != null) {
            mapper.updateEntity(group, entity);
            jpaRepo.persist(entity);
        }
    }
    
    public void deleteMember(UUID memberId) {
        jpaMemberRepo.deleteById(memberId);
    }
}
