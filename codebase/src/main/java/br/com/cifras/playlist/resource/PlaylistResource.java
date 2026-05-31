package br.com.cifras.playlist.resource;

import br.com.cifras.playlist.model.Playlist;
import br.com.cifras.playlist.dto.*;
import br.com.cifras.playlist.application.usecase.CreatePlaylistUseCase;
import br.com.cifras.playlist.application.usecase.ListUserPlaylistsUseCase;
import br.com.cifras.playlist.application.usecase.GetPlaylistUseCase;
import br.com.cifras.playlist.application.usecase.DeletePlaylistUseCase;
import br.com.cifras.shared.security.SecurityUtils;
import io.quarkus.security.Authenticated;
import jakarta.inject.Inject;
import jakarta.validation.Valid;
import jakarta.ws.rs.*;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;

import java.util.List;
import java.util.UUID;

/**
 * PlaylistResource — REST endpoints for playlist CRUD, song management, and reordering.
 * All endpoints require authentication.
 */
@Path("/playlists")
@Authenticated
@Produces(MediaType.APPLICATION_JSON)
@Consumes(MediaType.APPLICATION_JSON)
public class PlaylistResource {

    @Inject
    CreatePlaylistUseCase createPlaylistUseCase;

    @Inject
    ListUserPlaylistsUseCase listUserPlaylistsUseCase;

    @Inject
    GetPlaylistUseCase getPlaylistUseCase;

    @Inject
    DeletePlaylistUseCase deletePlaylistUseCase;

    @Inject
    SecurityUtils securityUtils;

    @POST
    public Response createPlaylist(@Valid CreatePlaylistRequest request) {
        String userId = securityUtils.getCurrentUserId();
        Playlist playlist = createPlaylistUseCase.execute(request, userId);
        return Response.status(Response.Status.CREATED).entity(PlaylistDTO.from(playlist)).build();
    }

    @GET
    public Response listPlaylists() {
        String userId = securityUtils.getCurrentUserId();
        List<Playlist> playlists = listUserPlaylistsUseCase.execute(userId);
        List<PlaylistDTO> dtos = playlists.stream().map(PlaylistDTO::from).toList();
        return Response.ok(dtos).build();
    }

    @GET
    @Path("/{id}")
    public Response getPlaylist(@PathParam("id") UUID id) {
        String userId = securityUtils.getCurrentUserId();
        Playlist playlist = getPlaylistUseCase.execute(id, userId);
        return Response.ok(PlaylistDetailsDTO.from(playlist)).build();
    }

    @DELETE
    @Path("/{id}")
    public Response deletePlaylist(@PathParam("id") UUID id) {
        String userId = securityUtils.getCurrentUserId();
        deletePlaylistUseCase.execute(id, userId);
        return Response.noContent().build();
    }
}
