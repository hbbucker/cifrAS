package br.com.cifras.admin.user.model;

import java.time.Instant;
import java.util.Objects;

public class AdminUser {
    private final String id;
    private final String email;
    private final String fullName;
    private final String role;
    private final Instant createdAt;
    private final Instant lastSignInAt;
    private final long songCount;
    private UserStatus status;
    private boolean blocked;
    private String lastBlockReason;
    private Instant updatedAt;

    public AdminUser(
            String id,
            String email,
            String fullName,
            String role,
            Instant createdAt,
            Instant lastSignInAt,
            long songCount,
            UserStatus status,
            boolean blocked,
            String lastBlockReason,
            Instant updatedAt) {
        this.id = Objects.requireNonNull(id, "User ID cannot be null");
        this.email = Objects.requireNonNull(email, "Email cannot be null");
        this.fullName = fullName != null ? fullName : email;
        this.role = role != null ? role : "user";
        this.createdAt = createdAt != null ? createdAt : Instant.now();
        this.lastSignInAt = lastSignInAt;
        this.songCount = songCount;
        this.status = status != null ? status : (blocked ? UserStatus.BLOCKED : UserStatus.ACTIVE);
        this.blocked = blocked || this.status == UserStatus.BLOCKED;
        this.lastBlockReason = lastBlockReason;
        this.updatedAt = updatedAt != null ? updatedAt : Instant.now();
    }

    public AdminUser(
            String id,
            String email,
            String fullName,
            String role,
            Instant createdAt,
            Instant lastSignInAt,
            long songCount,
            boolean blocked) {
        this(id, email, fullName, role, createdAt, lastSignInAt, songCount,
                blocked ? UserStatus.BLOCKED : UserStatus.ACTIVE, blocked, null, Instant.now());
    }

    public void block(String reason, String adminId) {
        if (this.id.equals(adminId)) {
            throw new IllegalArgumentException("CANNOT_BLOCK_SELF");
        }
        if (reason == null || reason.trim().length() < 5 || reason.trim().length() > 1000) {
            throw new IllegalArgumentException("INVALID_REASON_LENGTH");
        }
        this.status = UserStatus.BLOCKED;
        this.blocked = true;
        this.lastBlockReason = reason.trim();
        this.updatedAt = Instant.now();
    }

    public void unblock(String reason, String adminId) {
        this.status = UserStatus.ACTIVE;
        this.blocked = false;
        this.lastBlockReason = null;
        this.updatedAt = Instant.now();
    }

    public String getId() { return id; }
    public String getEmail() { return email; }
    public String getFullName() { return fullName; }
    public String getRole() { return role; }
    public Instant getCreatedAt() { return createdAt; }
    public Instant getLastSignInAt() { return lastSignInAt; }
    public long getSongCount() { return songCount; }
    public UserStatus getStatus() { return status; }
    public boolean isBlocked() { return blocked; }
    public boolean isBanned() { return blocked; }
    public String getLastBlockReason() { return lastBlockReason; }
    public Instant getUpdatedAt() { return updatedAt; }
    public boolean isAdmin() { return "admin".equalsIgnoreCase(role); }
}
