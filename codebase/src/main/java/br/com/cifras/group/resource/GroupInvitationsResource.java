package br.com.cifras.group.resource;

import br.com.cifras.group.dto.GroupInvitationDTO;
import br.com.cifras.group.application.usecase.ListGroupInvitationsUseCase;
import br.com.cifras.group.application.usecase.CancelGroupInvitationUseCase;
import br.com.cifras.shared.security.SecurityUtils;
import io.quarkus.security.Authenticated;
import jakarta.inject.Inject;
import jakarta.ws.rs.*;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;

import java.util.List;
import java.util.UUID;

@Path("/groups/{id}/invitations")
@Authenticated
@Produces(MediaType.APPLICATION_JSON)
@Consumes(MediaType.APPLICATION_JSON)
public class GroupInvitationsResource {

    @Inject
    ListGroupInvitationsUseCase listGroupInvitationsUseCase;

    @Inject
    CancelGroupInvitationUseCase cancelGroupInvitationUseCase;

    @Inject
    SecurityUtils securityUtils;

    @GET
    public Response listGroupInvitations(@PathParam("id") UUID id) {
        String userId = securityUtils.getCurrentUserId();
        List<GroupInvitationDTO> invites = listGroupInvitationsUseCase.execute(id, userId);
        return Response.ok(invites).build();
    }

    @DELETE
    @Path("/{invitationId}")
    public Response cancelInvitation(@PathParam("id") UUID groupId, @PathParam("invitationId") UUID invitationId) {
        String userId = securityUtils.getCurrentUserId();
        cancelGroupInvitationUseCase.execute(groupId, invitationId, userId);
        return Response.noContent().build();
    }
}
