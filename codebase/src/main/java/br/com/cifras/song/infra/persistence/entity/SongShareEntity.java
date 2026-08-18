package br.com.cifras.song.infra.persistence.entity;

import br.com.cifras.song.model.SongShareStatus;
import io.quarkus.hibernate.orm.panache.PanacheEntityBase;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import org.hibernate.annotations.UuidGenerator;

import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "song_shares")
public class SongShareEntity extends PanacheEntityBase {

    @Id
    @GeneratedValue
    @UuidGenerator(style = UuidGenerator.Style.TIME)
    public UUID id;

    @NotNull
    @Column(name = "song_id", nullable = false)
    public UUID songId;

    @NotBlank
    @Column(name = "inviter_id", nullable = false)
    public String inviterId;

    @NotBlank
    @Column(name = "invitee_email", nullable = false)
    public String inviteeEmail;

    @NotNull
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    public SongShareStatus status;

    @Column(name = "created_at", nullable = false, updatable = false)
    public Instant createdAt;

    @Column(name = "updated_at")
    public Instant updatedAt;

    @PrePersist
    public void prePersist() {
        if (createdAt == null) {
            createdAt = Instant.now();
        }
        updatedAt = Instant.now();
    }

    @PreUpdate
    public void preUpdate() {
        updatedAt = Instant.now();
    }
}
