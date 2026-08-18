package br.com.cifras.group.resource;

import br.com.cifras.group.dto.CreateGroupRequest;
import br.com.cifras.group.dto.GroupDTO;
import br.com.cifras.group.model.Group;
import br.com.cifras.group.application.usecase.CreateGroupUseCase;
import br.com.cifras.group.application.usecase.ListUserGroupsUseCase;
import br.com.cifras.group.infra.persistence.repository.GroupRepository;
import br.com.cifras.shared.security.SecurityUtils;
import io.quarkus.security.Authenticated;
import jakarta.inject.Inject;
import jakarta.validation.Valid;
import jakarta.ws.rs.*;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;

import java.util.List;
import java.util.Map;
import java.util.UUID;

@Path("/groups")
@Authenticated
@Produces(MediaType.APPLICATION_JSON)
@Consumes(MediaType.APPLICATION_JSON)
public class GroupResource {

    @Inject
    CreateGroupUseCase createGroupUseCase;

    @Inject
    ListUserGroupsUseCase listUserGroupsUseCase;

    @Inject
    GroupRepository groupRepository;

    @Inject
    SecurityUtils securityUtils;

    @POST
    public Response createGroup(@Valid CreateGroupRequest request) {
        String userId = securityUtils.getCurrentUserId();
        Group group = createGroupUseCase.execute(request.name(), userId);
        return Response.status(Response.Status.CREATED).entity(GroupDTO.from(group, 1L)).build();
    }

    @GET
    public Response listGroups() {
        String userId = securityUtils.getCurrentUserId();
        List<Group> groups = listUserGroupsUseCase.execute(userId);
        List<UUID> groupIds = groups.stream().map(Group::getId).toList();
        Map<UUID, Long> memberCounts = groupRepository.countMembersForGroups(groupIds);
        List<GroupDTO> dtos = groups.stream()
            .map(g -> GroupDTO.from(g, memberCounts.getOrDefault(g.getId(), 1L)))
            .toList();
        return Response.ok(dtos).build();
    }
}
