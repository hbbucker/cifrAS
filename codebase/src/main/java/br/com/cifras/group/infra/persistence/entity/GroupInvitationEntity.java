package br.com.cifras.group.infra.persistence.entity;

import io.quarkus.hibernate.orm.panache.PanacheEntityBase;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import org.hibernate.annotations.UuidGenerator;

import br.com.cifras.group.model.GroupInvitationStatus;
import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "group_invitations")
public class GroupInvitationEntity extends PanacheEntityBase {

    @Id
    @GeneratedValue
    @UuidGenerator(style = UuidGenerator.Style.TIME)
    public UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "group_id", nullable = false)
    public GroupEntity group;

    @NotBlank
    @Column(name = "inviter_id", nullable = false)
    public String inviterId;

    @NotBlank
    @Column(name = "invitee_email", nullable = false)
    public String inviteeEmail;

    @NotNull
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    public GroupInvitationStatus status;

    @Column(name = "created_at", nullable = false, updatable = false)
    public Instant createdAt;

    @PrePersist
    protected void onCreate() {
        if (createdAt == null) {
            createdAt = Instant.now();
        }
    }
}
