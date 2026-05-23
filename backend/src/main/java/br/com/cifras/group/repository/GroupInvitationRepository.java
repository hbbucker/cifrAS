package br.com.cifras.group.repository;

import br.com.cifras.group.domain.GroupInvitation;
import br.com.cifras.group.domain.GroupInvitationStatus;
import io.quarkus.hibernate.orm.panache.PanacheRepository;
import jakarta.enterprise.context.ApplicationScoped;

import java.util.List;
import java.util.Optional;

@ApplicationScoped
public class GroupInvitationRepository implements PanacheRepository<GroupInvitation> {

    public List<GroupInvitation> findPendingByEmail(String email) {
        return list("inviteeEmail = ?1 and status = ?2", email, GroupInvitationStatus.PENDING);
    }

    public Optional<GroupInvitation> findPendingByIdAndEmail(Long id, String email) {
        return find("id = ?1 and inviteeEmail = ?2 and status = ?3", id, email, GroupInvitationStatus.PENDING).firstResultOptional();
    }
}
