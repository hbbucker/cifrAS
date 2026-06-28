package br.com.cifras.group.dto;

import io.quarkus.runtime.annotations.RegisterForReflection;

import br.com.cifras.group.model.Group;
import java.util.UUID;

@RegisterForReflection
public record GroupDTO(
    UUID id,
    String name,
    String ownerId
) {
    public static GroupDTO from(Group group) {
        return new GroupDTO(group.getId(), group.getName(), group.getOwnerId());
    }
}
