package br.com.cifras.group.resource;

import br.com.cifras.group.domain.GroupInvitation;
import br.com.cifras.group.dto.GroupInvitationDTO;
import br.com.cifras.group.service.GroupService;
import br.com.cifras.shared.security.SecurityUtils;
import io.quarkus.security.Authenticated;
import jakarta.inject.Inject;
import jakarta.ws.rs.*;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;

import java.util.List;
import java.util.UUID;

@Path("/invites")
@Authenticated
@Produces(MediaType.APPLICATION_JSON)
@Consumes(MediaType.APPLICATION_JSON)
public class InvitationResource {

    @Inject
    GroupService groupService;

    @Inject
    SecurityUtils securityUtils;

    @GET
    public Response listMyInvites() {
        String email = securityUtils.getCurrentUserEmail();
        if (email == null) {
            return Response.status(Response.Status.BAD_REQUEST).entity("Email not found in token").build();
        }
        List<GroupInvitation> invites = groupService.getPendingInvites(email);
        List<GroupInvitationDTO> dtos = invites.stream().map(GroupInvitationDTO::from).toList();
        return Response.ok(dtos).build();
    }

    @POST
    @Path("/{id}/accept")
    public Response acceptInvite(@PathParam("id") UUID id) {
        String email = securityUtils.getCurrentUserEmail();
        String userId = securityUtils.getCurrentUserId();
        groupService.acceptInvite(id, email, userId);
        return Response.noContent().build();
    }

    @POST
    @Path("/{id}/decline")
    public Response declineInvite(@PathParam("id") UUID id) {
        String email = securityUtils.getCurrentUserEmail();
        groupService.declineInvite(id, email);
        return Response.noContent().build();
    }

    @GET
    @Path("/declined")
    public Response listDeclinedInvites() {
        String userId = securityUtils.getCurrentUserId();
        List<GroupInvitation> invites = groupService.getDeclinedInvites(userId);
        List<GroupInvitationDTO> dtos = invites.stream().map(GroupInvitationDTO::from).toList();
        return Response.ok(dtos).build();
    }

    @DELETE
    @Path("/{id}")
    public Response dismissInvite(@PathParam("id") UUID id) {
        String userId = securityUtils.getCurrentUserId();
        groupService.dismissInvite(id, userId);
        return Response.noContent().build();
    }
}
