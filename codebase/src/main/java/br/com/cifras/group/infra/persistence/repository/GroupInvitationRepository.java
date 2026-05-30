package br.com.cifras.group.infra.persistence.repository;

import br.com.cifras.group.model.GroupInvitation;
import br.com.cifras.group.model.GroupInvitationStatus;
import io.quarkus.hibernate.orm.panache.PanacheRepositoryBase;
import jakarta.enterprise.context.ApplicationScoped;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@ApplicationScoped
public class GroupInvitationRepository implements PanacheRepositoryBase<GroupInvitation, UUID> {

    public List<GroupInvitation> findPendingByEmail(String email) {
        return list("inviteeEmail = ?1 and status = ?2", email, GroupInvitationStatus.PENDING);
    }

    public Optional<GroupInvitation> findPendingByIdAndEmail(UUID id, String email) {
        return find("id = ?1 and inviteeEmail = ?2 and status = ?3", id, email, GroupInvitationStatus.PENDING).firstResultOptional();
    }
}
