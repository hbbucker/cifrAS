package br.com.cifras.admin.audit.infra.entity;

import io.quarkus.hibernate.orm.panache.PanacheEntityBase;
import jakarta.persistence.*;

import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "user_audit_logs")
public class UserAuditLogEntity extends PanacheEntityBase {

    @Id
    @Column(length = 36)
    public String id;

    @Column(name = "user_id", nullable = false, length = 36)
    public String userId;

    @Column(name = "admin_id", nullable = false, length = 36)
    public String adminId;

    @Column(name = "admin_email", nullable = false, length = 255)
    public String adminEmail;

    @Column(nullable = false, length = 20)
    public String action;

    @Column(nullable = false, columnDefinition = "TEXT")
    public String reason;

    @Column(name = "previous_status", nullable = false, length = 20)
    public String previousStatus;

    @Column(name = "new_status", nullable = false, length = 20)
    public String newStatus;

    @Column(name = "created_at", nullable = false, updatable = false)
    public Instant createdAt;

    @PrePersist
    public void prePersist() {
        if (this.id == null || this.id.isBlank()) {
            this.id = UUID.randomUUID().toString();
        }
        if (this.createdAt == null) {
            this.createdAt = Instant.now();
        }
    }
}
