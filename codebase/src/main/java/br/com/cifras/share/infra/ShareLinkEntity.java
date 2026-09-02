package br.com.cifras.share.infra;

import br.com.cifras.share.model.ShareLinkType;
import jakarta.persistence.*;
import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "share_links")
public class ShareLinkEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(nullable = false, unique = true)
    private String token;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private ShareLinkType type;

    @Column(name = "resource_id", nullable = false)
    private UUID resourceId;

    @Column(name = "created_by", nullable = false)
    private String createdBy;

    @Column(name = "expires_at", nullable = false)
    private Instant expiresAt;

    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt = Instant.now();

    public ShareLinkEntity() {
    }

    public ShareLinkEntity(String token, ShareLinkType type, UUID resourceId, String createdBy, Instant expiresAt) {
        this.token = token;
        this.type = type;
        this.resourceId = resourceId;
        this.createdBy = createdBy;
        this.expiresAt = expiresAt;
    }

    public UUID getId() { return id; }
    public String getToken() { return token; }
    public ShareLinkType getType() { return type; }
    public UUID getResourceId() { return resourceId; }
    public String getCreatedBy() { return createdBy; }
    public Instant getExpiresAt() { return expiresAt; }
    public Instant getCreatedAt() { return createdAt; }
    
    public void setToken(String token) { this.token = token; }
    public void setType(ShareLinkType type) { this.type = type; }
    public void setResourceId(UUID resourceId) { this.resourceId = resourceId; }
    public void setCreatedBy(String createdBy) { this.createdBy = createdBy; }
    public void setExpiresAt(Instant expiresAt) { this.expiresAt = expiresAt; }
}
