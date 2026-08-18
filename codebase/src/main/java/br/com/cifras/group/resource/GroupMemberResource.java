package br.com.cifras.group.resource;

import br.com.cifras.group.dto.AddMemberRequest;
import br.com.cifras.group.dto.GroupMemberDTO;
import br.com.cifras.group.application.usecase.ListGroupMembersUseCase;
import br.com.cifras.group.application.usecase.SendGroupInvitationUseCase;
import br.com.cifras.group.application.usecase.RemoveGroupMemberUseCase;
import br.com.cifras.shared.security.SecurityUtils;
import io.quarkus.security.Authenticated;
import jakarta.inject.Inject;
import jakarta.validation.Valid;
import jakarta.ws.rs.*;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;
import java.util.List;
import java.util.UUID;

@Path("/groups/{id}/members")
@Authenticated
@Produces(MediaType.APPLICATION_JSON)
@Consumes(MediaType.APPLICATION_JSON)
public class GroupMemberResource {

    @Inject
    ListGroupMembersUseCase listGroupMembersUseCase;

    @Inject
    SendGroupInvitationUseCase sendGroupInvitationUseCase;

    @Inject
    RemoveGroupMemberUseCase removeGroupMemberUseCase;

    @Inject
    SecurityUtils securityUtils;

    @GET
    public Response listMembers(@PathParam("id") UUID id) {
        String userId = securityUtils.getCurrentUserId();
        List<GroupMemberDTO> members = listGroupMembersUseCase.execute(id, userId);
        return Response.ok(members).build();
    }

    @POST
    public Response inviteMember(@PathParam("id") UUID id, @Valid AddMemberRequest request) {
        String userId = securityUtils.getCurrentUserId();
        sendGroupInvitationUseCase.execute(id, request.email(), userId);
        return Response.noContent().build();
    }

    @DELETE
    @Path("/{targetUserId}")
    public Response removeMember(@PathParam("id") UUID id, @PathParam("targetUserId") String targetUserId) {
        String userId = securityUtils.getCurrentUserId();
        removeGroupMemberUseCase.execute(id, targetUserId, userId);
        return Response.noContent().build();
    }
}
