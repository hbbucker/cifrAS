package br.com.cifras.group.resource;

import br.com.cifras.group.domain.Group;
import br.com.cifras.group.dto.AddMemberRequest;
import br.com.cifras.group.dto.CreateGroupRequest;
import br.com.cifras.group.dto.GroupDTO;
import br.com.cifras.group.service.GroupService;
import br.com.cifras.shared.security.SecurityUtils;
import io.quarkus.security.Authenticated;
import jakarta.inject.Inject;
import jakarta.validation.Valid;
import jakarta.ws.rs.*;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;

import java.util.List;

@Path("/groups")
@Authenticated
@Produces(MediaType.APPLICATION_JSON)
@Consumes(MediaType.APPLICATION_JSON)
public class GroupResource {

    @Inject
    GroupService groupService;

    @Inject
    SecurityUtils securityUtils;

    @POST
    public Response createGroup(@Valid CreateGroupRequest request) {
        String userId = securityUtils.getCurrentUserId();
        Group group = groupService.createGroup(request.name(), userId);
        return Response.status(Response.Status.CREATED).entity(GroupDTO.from(group)).build();
    }

    @GET
    public Response listGroups() {
        String userId = securityUtils.getCurrentUserId();
        List<Group> groups = groupService.listGroupsByUser(userId);
        List<GroupDTO> dtos = groups.stream().map(GroupDTO::from).toList();
        return Response.ok(dtos).build();
    }

    @POST
    @Path("/{id}/members")
    public Response inviteMember(@PathParam("id") Long id, @Valid AddMemberRequest request) {
        String userId = securityUtils.getCurrentUserId();
        groupService.inviteMember(id, request.email(), userId);
        return Response.noContent().build();
    }

    @DELETE
    @Path("/{id}/members/{targetUserId}")
    public Response removeMember(@PathParam("id") Long id, @PathParam("targetUserId") String targetUserId) {
        String userId = securityUtils.getCurrentUserId();
        groupService.removeMember(id, targetUserId, userId);
        return Response.noContent().build();
    }
}
