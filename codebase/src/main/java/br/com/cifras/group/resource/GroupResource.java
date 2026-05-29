package br.com.cifras.group.resource;

import br.com.cifras.group.domain.Group;
import br.com.cifras.group.dto.AddMemberRequest;
import br.com.cifras.group.dto.CreateGroupRequest;
import br.com.cifras.group.dto.GroupDTO;
import br.com.cifras.group.dto.LinkPlaylistRequest;
import br.com.cifras.playlist.domain.Playlist;
import br.com.cifras.playlist.dto.PlaylistDTO;
import br.com.cifras.group.service.GroupService;
import br.com.cifras.shared.security.SecurityUtils;
import io.quarkus.security.Authenticated;
import jakarta.inject.Inject;
import jakarta.validation.Valid;
import jakarta.ws.rs.*;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;

import java.util.List;
import java.util.UUID;

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
    public Response inviteMember(@PathParam("id") UUID id, @Valid AddMemberRequest request) {
        String userId = securityUtils.getCurrentUserId();
        groupService.inviteMember(id, request.email(), userId);
        return Response.noContent().build();
    }

    @DELETE
    @Path("/{id}/members/{targetUserId}")
    public Response removeMember(@PathParam("id") UUID id, @PathParam("targetUserId") String targetUserId) {
        String userId = securityUtils.getCurrentUserId();
        groupService.removeMember(id, targetUserId, userId);
        return Response.noContent().build();
    }

    @POST
    @Path("/{id}/playlists")
    public Response linkPlaylist(@PathParam("id") UUID id, @Valid LinkPlaylistRequest request) {
        String userId = securityUtils.getCurrentUserId();
        groupService.linkPlaylist(id, request.playlistId(), userId);
        return Response.noContent().build();
    }

    @GET
    @Path("/{id}/playlists")
    public Response listGroupPlaylists(@PathParam("id") UUID id) {
        String userId = securityUtils.getCurrentUserId();
        List<Playlist> playlists = groupService.listGroupPlaylists(id, userId);
        List<PlaylistDTO> dtos = playlists.stream().map(PlaylistDTO::from).toList();
        return Response.ok(dtos).build();
    }

    @DELETE
    @Path("/{id}/playlists/{playlistId}")
    public Response unlinkPlaylist(@PathParam("id") UUID id, @PathParam("playlistId") UUID playlistId) {
        String userId = securityUtils.getCurrentUserId();
        groupService.unlinkPlaylist(id, playlistId, userId);
        return Response.noContent().build();
    }
}
