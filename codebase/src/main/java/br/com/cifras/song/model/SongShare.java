package br.com.cifras.song.model;

import java.time.Instant;
import java.util.UUID;

public class SongShare {

    private UUID id;
    private UUID songId;
    private String inviterId;
    private String inviteeEmail;
    private SongShareStatus status;
    private Instant createdAt;
    private Instant updatedAt;

    protected SongShare() {}

    public static SongShare create(UUID songId, String inviterId, String inviteeEmail) {
        if (songId == null) {
            throw new IllegalArgumentException("Song ID cannot be null");
        }
        if (inviterId == null || inviterId.isBlank()) {
            throw new IllegalArgumentException("Inviter ID cannot be blank");
        }
        if (inviteeEmail == null || inviteeEmail.isBlank()) {
            throw new IllegalArgumentException("Invitee email cannot be blank");
        }
        SongShare share = new SongShare();
        share.songId = songId;
        share.inviterId = inviterId;
        share.inviteeEmail = inviteeEmail.trim().toLowerCase();
        share.status = SongShareStatus.PENDING;
        share.createdAt = Instant.now();
        share.updatedAt = Instant.now();
        return share;
    }

    public static SongShare restore(UUID id, UUID songId, String inviterId, String inviteeEmail, 
                                    SongShareStatus status, Instant createdAt, Instant updatedAt) {
        SongShare share = new SongShare();
        share.id = id;
        share.songId = songId;
        share.inviterId = inviterId;
        share.inviteeEmail = inviteeEmail;
        share.status = status;
        share.createdAt = createdAt;
        share.updatedAt = updatedAt;
        return share;
    }

    public void accept() {
        if (this.status != SongShareStatus.PENDING) {
            throw new IllegalStateException("Only pending shares can be accepted");
        }
        this.status = SongShareStatus.ACCEPTED;
        this.updatedAt = Instant.now();
    }

    public void decline() {
        if (this.status != SongShareStatus.PENDING) {
            throw new IllegalStateException("Only pending shares can be declined");
        }
        this.status = SongShareStatus.DECLINED;
        this.updatedAt = Instant.now();
    }

    public UUID getId() { return id; }
    public UUID getSongId() { return songId; }
    public String getInviterId() { return inviterId; }
    public String getInviteeEmail() { return inviteeEmail; }
    public SongShareStatus getStatus() { return status; }
    public Instant getCreatedAt() { return createdAt; }
    public Instant getUpdatedAt() { return updatedAt; }

    public void setId(UUID id) { this.id = id; }
    public void setCreatedAt(Instant createdAt) { this.createdAt = createdAt; }
    public void setUpdatedAt(Instant updatedAt) { this.updatedAt = updatedAt; }
}
