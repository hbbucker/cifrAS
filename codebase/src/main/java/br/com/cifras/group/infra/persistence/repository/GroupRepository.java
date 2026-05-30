package br.com.cifras.group.infra.persistence.repository;

import br.com.cifras.group.model.GroupMember;
import br.com.cifras.group.model.GroupRole;
import io.quarkus.hibernate.orm.panache.PanacheRepositoryBase;
import jakarta.enterprise.context.ApplicationScoped;

import java.util.Optional;
import java.util.UUID;

/**
 * GroupRepository — queries for Group and GroupMember entities.
 */
@ApplicationScoped
public class GroupRepository implements PanacheRepositoryBase<GroupMember, UUID> {

    public boolean isMember(UUID groupId, String userId) {
        return count("group.id = ?1 AND userId = ?2", groupId, userId) > 0;
    }

    public boolean isOwner(UUID groupId, String userId) {
        return count("group.id = ?1 AND userId = ?2 AND role = ?3",
            groupId, userId, GroupRole.OWNER) > 0;
    }

    public Optional<GroupMember> findMember(UUID groupId, String userId) {
        return find("group.id = ?1 AND userId = ?2", groupId, userId).firstResultOptional();
    }
}
