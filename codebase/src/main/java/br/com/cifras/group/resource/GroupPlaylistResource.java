package br.com.cifras.group.resource;

import br.com.cifras.group.dto.LinkPlaylistRequest;
import br.com.cifras.group.application.usecase.LinkGroupPlaylistUseCase;
import br.com.cifras.group.application.usecase.ListGroupPlaylistsUseCase;
import br.com.cifras.group.application.usecase.UnlinkGroupPlaylistUseCase;
import br.com.cifras.playlist.model.Playlist;
import br.com.cifras.playlist.dto.PlaylistDTO;
import br.com.cifras.shared.security.SecurityUtils;
import io.quarkus.security.Authenticated;
import jakarta.inject.Inject;
import jakarta.validation.Valid;
import jakarta.ws.rs.*;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;
import java.util.List;
import java.util.UUID;

@Path("/groups/{id}/playlists")
@Authenticated
@Produces(MediaType.APPLICATION_JSON)
@Consumes(MediaType.APPLICATION_JSON)
public class GroupPlaylistResource {

    @Inject
    LinkGroupPlaylistUseCase linkGroupPlaylistUseCase;

    @Inject
    ListGroupPlaylistsUseCase listGroupPlaylistsUseCase;

    @Inject
    UnlinkGroupPlaylistUseCase unlinkGroupPlaylistUseCase;

    @Inject
    SecurityUtils securityUtils;

    @POST
    public Response linkPlaylist(@PathParam("id") UUID id, @Valid LinkPlaylistRequest request) {
        String userId = securityUtils.getCurrentUserId();
        linkGroupPlaylistUseCase.execute(id, request.playlistId(), userId);
        return Response.noContent().build();
    }

    @GET
    public Response listGroupPlaylists(@PathParam("id") UUID id) {
        String userId = securityUtils.getCurrentUserId();
        List<Playlist> playlists = listGroupPlaylistsUseCase.execute(id, userId);
        List<PlaylistDTO> dtos = playlists.stream().map(PlaylistDTO::from).toList();
        return Response.ok(dtos).build();
    }

    @DELETE
    @Path("/{playlistId}")
    public Response unlinkPlaylist(@PathParam("id") UUID id, @PathParam("playlistId") UUID playlistId) {
        String userId = securityUtils.getCurrentUserId();
        unlinkGroupPlaylistUseCase.execute(id, playlistId, userId);
        return Response.noContent().build();
    }
}
