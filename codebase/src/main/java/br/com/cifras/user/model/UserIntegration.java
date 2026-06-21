package br.com.cifras.user.model;

import java.time.Instant;
import java.util.UUID;

public class UserIntegration {
    private UUID id;
    private UUID userId;
    private String provider;
    private String email;
    private String refreshToken;
    private Instant createdAt;
    private Instant updatedAt;

    public UserIntegration(UUID id, UUID userId, String provider, String email, String refreshToken, Instant createdAt, Instant updatedAt) {
        if (userId == null) {
            throw new IllegalArgumentException("UserId cannot be null");
        }
        if (provider == null || provider.isBlank()) {
            throw new IllegalArgumentException("Provider cannot be blank");
        }
        
        this.id = id;
        this.userId = userId;
        this.provider = provider;
        this.email = email;
        this.refreshToken = refreshToken;
        this.createdAt = createdAt != null ? createdAt : Instant.now();
        this.updatedAt = updatedAt != null ? updatedAt : Instant.now();
    }
    
    public static UserIntegration connect(UUID userId, String provider, String email, String refreshToken) {
        return new UserIntegration(UUID.randomUUID(), userId, provider, email, refreshToken, Instant.now(), Instant.now());
    }

    public void updateToken(String newEmail, String newRefreshToken) {
        this.email = newEmail;
        this.refreshToken = newRefreshToken;
        this.updatedAt = Instant.now();
    }

    public UUID getId() {
        return id;
    }

    public UUID getUserId() {
        return userId;
    }

    public String getProvider() {
        return provider;
    }

    public String getEmail() {
        return email;
    }

    public String getRefreshToken() {
        return refreshToken;
    }

    public Instant getCreatedAt() {
        return createdAt;
    }

    public Instant getUpdatedAt() {
        return updatedAt;
    }
}
