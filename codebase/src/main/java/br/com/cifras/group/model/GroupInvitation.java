package br.com.cifras.group.model;

import java.time.Instant;
import java.util.UUID;

public class GroupInvitation {
    private UUID id;
    private Group group;
    private String inviterId;
    private String inviteeEmail;
    private GroupInvitationStatus status = GroupInvitationStatus.PENDING;
    private Instant createdAt;
    private Instant updatedAt;

    protected GroupInvitation() {}

    public static GroupInvitation create(Group group, String inviterId, String inviteeEmail) {
        GroupInvitation inv = new GroupInvitation();
        inv.group = group;
        inv.inviterId = inviterId;
        inv.inviteeEmail = inviteeEmail;
        inv.status = GroupInvitationStatus.PENDING;
        inv.createdAt = Instant.now();
        inv.updatedAt = Instant.now();
        return inv;
    }

    public static GroupInvitation restore(UUID id, Group group, String inviterId, String inviteeEmail, 
                                          GroupInvitationStatus status, Instant createdAt, Instant updatedAt) {
        GroupInvitation inv = new GroupInvitation();
        inv.id = id;
        inv.group = group;
        inv.inviterId = inviterId;
        inv.inviteeEmail = inviteeEmail;
        inv.status = status;
        inv.createdAt = createdAt;
        inv.updatedAt = updatedAt;
        return inv;
    }

    public void accept() {
        this.status = GroupInvitationStatus.ACCEPTED;
        this.updatedAt = Instant.now();
    }

    public void reject() {
        this.status = GroupInvitationStatus.DECLINED;
        this.updatedAt = Instant.now();
    }

    public UUID getId() { return id; }
    public Group getGroup() { return group; }
    public String getInviterId() { return inviterId; }
    public String getInviteeEmail() { return inviteeEmail; }
    public GroupInvitationStatus getStatus() { return status; }
    public Instant getCreatedAt() { return createdAt; }
    public Instant getUpdatedAt() { return updatedAt; }

    public void setId(UUID id) { this.id = id; }
}
