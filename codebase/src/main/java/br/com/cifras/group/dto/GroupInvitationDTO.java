package br.com.cifras.group.dto;

import io.quarkus.runtime.annotations.RegisterForReflection;

import br.com.cifras.group.model.GroupInvitation;
import java.util.UUID;

@RegisterForReflection
public record GroupInvitationDTO(
    UUID id,
    UUID groupId,
    String groupName,
    String inviterId,
    String inviteeEmail,
    String status
) {
    public static GroupInvitationDTO from(GroupInvitation invite) {
        return new GroupInvitationDTO(
            invite.getId(),
            invite.getGroup().getId(),
            invite.getGroup().getName(),
            invite.getInviterId(),
            invite.getInviteeEmail(),
            invite.getStatus().name()
        );
    }
}
