package br.com.cifras.group.model;

import java.time.Instant;
import java.util.UUID;

public class GroupInvitation {
    public UUID id;
    public Group group;
    public String inviterId;
    public String inviteeEmail;
    public GroupInvitationStatus status = GroupInvitationStatus.PENDING;
    public Instant createdAt;
    public Instant updatedAt;

    public GroupInvitation() {}
}
