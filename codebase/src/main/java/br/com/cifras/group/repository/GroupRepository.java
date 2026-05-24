package br.com.cifras.group.repository;

import br.com.cifras.group.domain.GroupMember;
import br.com.cifras.group.domain.GroupRole;
import io.quarkus.hibernate.orm.panache.PanacheRepository;
import jakarta.enterprise.context.ApplicationScoped;

import java.util.Optional;

/**
 * GroupRepository — queries for Group and GroupMember entities.
 */
@ApplicationScoped
public class GroupRepository implements PanacheRepository<GroupMember> {

    public boolean isMember(Long groupId, String userId) {
        return count("group.id = ?1 AND userId = ?2", groupId, userId) > 0;
    }

    public boolean isOwner(Long groupId, String userId) {
        return count("group.id = ?1 AND userId = ?2 AND role = ?3",
            groupId, userId, GroupRole.OWNER) > 0;
    }

    public Optional<GroupMember> findMember(Long groupId, String userId) {
        return find("group.id = ?1 AND userId = ?2", groupId, userId).firstResultOptional();
    }
}
