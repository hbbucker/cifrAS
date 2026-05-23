package br.com.cifras.group.dto;

import br.com.cifras.group.domain.Group;

public record GroupDTO(
    Long id,
    String name,
    String ownerId
) {
    public static GroupDTO from(Group group) {
        return new GroupDTO(group.id, group.name, group.ownerId);
    }
}
