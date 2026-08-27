package br.com.cifras.admin.feedback.infra.persistence.entity;

import io.quarkus.hibernate.orm.panache.PanacheEntityBase;
import jakarta.persistence.*;
import org.hibernate.annotations.UuidGenerator;

import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "feedbacks")
public class FeedbackEntity extends PanacheEntityBase {

    @Id
    @GeneratedValue
    @UuidGenerator
    public UUID id;

    @Column(name = "user_id", nullable = false)
    public String userId;

    @Column(nullable = false, columnDefinition = "TEXT")
    public String message;

    @Column(nullable = false)
    public String status;

    @Column(name = "admin_reply", columnDefinition = "TEXT")
    public String adminReply;

    @Column(name = "created_at", nullable = false, updatable = false)
    public Instant createdAt;

    @Column(name = "updated_at", nullable = false)
    public Instant updatedAt;

    @PrePersist
    public void prePersist() {
        if (createdAt == null) createdAt = Instant.now();
        if (updatedAt == null) updatedAt = Instant.now();
    }

    @PreUpdate
    public void preUpdate() {
        updatedAt = Instant.now();
    }
}
