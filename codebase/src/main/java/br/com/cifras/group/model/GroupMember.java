package br.com.cifras.group.model;

import java.time.Instant;
import java.util.UUID;

public class GroupMember {
    public UUID id;
    public Group group;
    public String userId;
    public GroupRole role = GroupRole.MEMBER;
    public Instant joinedAt;

    public GroupMember() {}
}
