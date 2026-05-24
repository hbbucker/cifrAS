package br.com.cifras.group.dto;

import br.com.cifras.group.domain.GroupInvitation;

public record GroupInvitationDTO(
    Long id,
    Long groupId,
    String groupName,
    String inviterId,
    String inviteeEmail,
    String status
) {
    public static GroupInvitationDTO from(GroupInvitation invite) {
        return new GroupInvitationDTO(
            invite.id,
            invite.group.id,
            invite.group.name,
            invite.inviterId,
            invite.inviteeEmail,
            invite.status.name()
        );
    }
}
