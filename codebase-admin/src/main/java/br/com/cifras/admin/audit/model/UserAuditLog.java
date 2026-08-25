package br.com.cifras.admin.audit.model;

import br.com.cifras.admin.user.model.UserStatus;

import java.time.Instant;
import java.util.Objects;
import java.util.UUID;

public class UserAuditLog {
    private final String id;
    private final String userId;
    private final String adminId;
    private final String adminEmail;
    private final AuditAction action;
    private final String reason;
    private final UserStatus previousStatus;
    private final UserStatus newStatus;
    private final Instant createdAt;

    public UserAuditLog(
            String id,
            String userId,
            String adminId,
            String adminEmail,
            AuditAction action,
            String reason,
            UserStatus previousStatus,
            UserStatus newStatus,
            Instant createdAt) {
        this.id = id != null ? id : UUID.randomUUID().toString();
        this.userId = Objects.requireNonNull(userId, "userId is required");
        this.adminId = Objects.requireNonNull(adminId, "adminId is required");
        this.adminEmail = Objects.requireNonNull(adminEmail, "adminEmail is required");
        this.action = Objects.requireNonNull(action, "action is required");
        this.reason = Objects.requireNonNull(reason, "reason is required");
        this.previousStatus = Objects.requireNonNull(previousStatus, "previousStatus is required");
        this.newStatus = Objects.requireNonNull(newStatus, "newStatus is required");
        this.createdAt = createdAt != null ? createdAt : Instant.now();
    }

    public String getId() { return id; }
    public String getUserId() { return userId; }
    public String getAdminId() { return adminId; }
    public String getAdminEmail() { return adminEmail; }
    public AuditAction getAction() { return action; }
    public String getReason() { return reason; }
    public UserStatus getPreviousStatus() { return previousStatus; }
    public UserStatus getNewStatus() { return newStatus; }
    public Instant getCreatedAt() { return createdAt; }
}
