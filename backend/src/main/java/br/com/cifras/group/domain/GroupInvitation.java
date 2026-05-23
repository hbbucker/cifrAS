package br.com.cifras.group.domain;

import io.quarkus.hibernate.orm.panache.PanacheEntity;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.time.Instant;

@Entity
@Table(name = "group_invitations")
public class GroupInvitation extends PanacheEntity {

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "group_id", nullable = false)
    public Group group;

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
