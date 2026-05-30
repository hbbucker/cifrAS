package br.com.cifras.group.dto;

import br.com.cifras.group.model.Group;
import java.util.UUID;

public record GroupDTO(
    UUID id,
    String name,
    String ownerId
) {
    public static GroupDTO from(Group group) {
        return new GroupDTO(group.getId(), group.getName(), group.getOwnerId());
    }
}
