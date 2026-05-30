package br.com.cifras.group.model;

import java.time.Instant;
import java.util.UUID;

public class GroupMember {
    private UUID id;
    private Group group;
    private String userId;
    private GroupRole role = GroupRole.MEMBER;
    private Instant joinedAt;

    protected GroupMember() {}

    public static GroupMember create(Group group, String userId, GroupRole role) {
        GroupMember member = new GroupMember();
        member.group = group;
        member.userId = userId;
        member.role = role != null ? role : GroupRole.MEMBER;
        member.joinedAt = Instant.now();
        return member;
    }

    public static GroupMember restore(UUID id, Group group, String userId, GroupRole role, Instant joinedAt) {
        GroupMember member = new GroupMember();
        member.id = id;
        member.group = group;
        member.userId = userId;
        member.role = role;
        member.joinedAt = joinedAt;
        return member;
    }

    public void updateRole(GroupRole role) {
        this.role = role;
    }

    public UUID getId() { return id; }
    public Group getGroup() { return group; }
    public String getUserId() { return userId; }
    public GroupRole getRole() { return role; }
    public Instant getJoinedAt() { return joinedAt; }

    public void setId(UUID id) { this.id = id; }
    public void setGroup(Group group) { this.group = group; }
}
