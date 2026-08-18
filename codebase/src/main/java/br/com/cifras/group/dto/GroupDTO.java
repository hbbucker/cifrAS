package br.com.cifras.group.dto;

import io.quarkus.runtime.annotations.RegisterForReflection;
import br.com.cifras.group.model.Group;
import java.util.UUID;

@RegisterForReflection
public record GroupDTO(
    UUID id,
    String name,
    String ownerId,
    long memberCount
) {
    public static GroupDTO from(Group group) {
        long count = group.getMembers() != null && !group.getMembers().isEmpty()
            ? group.getMembers().size()
            : 1;
        return new GroupDTO(group.getId(), group.getName(), group.getOwnerId(), count);
    }

    public static GroupDTO from(Group group, long memberCount) {
        return new GroupDTO(group.getId(), group.getName(), group.getOwnerId(), memberCount);
    }
}
