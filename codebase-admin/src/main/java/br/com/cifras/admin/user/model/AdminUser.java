package br.com.cifras.admin.user.model;

import java.time.Instant;

public class AdminUser {
    private final String id;
    private final String email;
    private final String fullName;
    private final String role;
    private final Instant createdAt;
    private final Instant lastSignInAt;
    private final long songCount;
    private final boolean banned;

    public AdminUser(
            String id,
            String email,
            String fullName,
            String role,
            Instant createdAt,
            Instant lastSignInAt,
            long songCount,
            boolean banned) {
        this.id = id;
        this.email = email;
        this.fullName = fullName;
        this.role = role != null ? role : "user";
        this.createdAt = createdAt;
        this.lastSignInAt = lastSignInAt;
        this.songCount = songCount;
        this.banned = banned;
    }

    public String getId() { return id; }
    public String getEmail() { return email; }
    public String getFullName() { return fullName; }
    public String getRole() { return role; }
    public Instant getCreatedAt() { return createdAt; }
    public Instant getLastSignInAt() { return lastSignInAt; }
    public long getSongCount() { return songCount; }
    public boolean isBanned() { return banned; }
    public boolean isAdmin() { return "admin".equalsIgnoreCase(role); }
}
