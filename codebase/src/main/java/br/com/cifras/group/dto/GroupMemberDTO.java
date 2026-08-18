package br.com.cifras.group.dto;

import io.quarkus.runtime.annotations.RegisterForReflection;
import br.com.cifras.group.model.GroupMember;
import java.time.Instant;
import java.util.UUID;

@RegisterForReflection
public record GroupMemberDTO(
    UUID id,
    UUID groupId,
    String userId,
    String email,
    String name,
    String role,
    Instant joinedAt
) {
    public static GroupMemberDTO from(GroupMember member, String email, String name) {
        return new GroupMemberDTO(
            member.getId(),
            member.getGroup() != null ? member.getGroup().getId() : null,
            member.getUserId(),
            email,
            name,
            member.getRole() != null ? member.getRole().name() : "MEMBER",
            member.getJoinedAt() != null ? member.getJoinedAt() : Instant.now()
        );
    }
}
