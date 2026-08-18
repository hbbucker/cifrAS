package br.com.cifras.group.infra.persistence.repository;

import br.com.cifras.group.infra.persistence.entity.GroupInvitationEntity;
import br.com.cifras.group.infra.persistence.mapper.GroupMapper;
import br.com.cifras.group.model.GroupInvitation;
import br.com.cifras.group.model.GroupInvitationStatus;
import io.quarkus.hibernate.orm.panache.PanacheRepositoryBase;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;

import java.util.List;
import java.util.Optional;
import java.util.UUID;
import java.util.stream.Collectors;

@ApplicationScoped
public class GroupInvitationRepository {

    @ApplicationScoped
    public static class JpaGroupInvitationRepository implements PanacheRepositoryBase<GroupInvitationEntity, UUID> {}

    @Inject
    JpaGroupInvitationRepository jpaRepo;

    @Inject
    GroupMapper mapper;

    public List<GroupInvitation> findPendingByEmail(String email) {
        return jpaRepo.find("inviteeEmail = ?1 and status = ?2", email, GroupInvitationStatus.PENDING)
                .stream()
                .map(mapper::toDomainInvitation)
                .collect(Collectors.toList());
    }

    public List<GroupInvitation> findByInviterIdAndStatus(String inviterId, GroupInvitationStatus status) {
        return jpaRepo.find("inviterId = ?1 and status = ?2", inviterId, status)
                .stream()
                .map(mapper::toDomainInvitation)
                .collect(Collectors.toList());
    }

    public List<GroupInvitation> findByGroupId(UUID groupId) {
        return jpaRepo.find("group.id", groupId)
                .stream()
                .map(mapper::toDomainInvitation)
                .collect(Collectors.toList());
    }

    public List<GroupInvitation> findByGroupIdAndStatus(UUID groupId, GroupInvitationStatus status) {
        return jpaRepo.find("group.id = ?1 and status = ?2", groupId, status)
                .stream()
                .map(mapper::toDomainInvitation)
                .collect(Collectors.toList());
    }

    public Optional<GroupInvitation> findById(UUID id) {
        return jpaRepo.findByIdOptional(id).map(mapper::toDomainInvitation);
    }

    public void persist(GroupInvitation invitation) {
        GroupInvitationEntity entity = mapper.toEntityInvitation(invitation);
        jpaRepo.persist(entity);
        invitation.setId(entity.id);
    }

    public void update(GroupInvitation invitation) {
        GroupInvitationEntity entity = jpaRepo.findById(invitation.getId());
        if (entity != null) {
            entity.status = invitation.getStatus();
            // No complex updating needed for now, only status is changed
            jpaRepo.persist(entity);
        }
    }

    public void delete(UUID id) {
        jpaRepo.deleteById(id);
    }
}
