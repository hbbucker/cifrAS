package br.com.cifras.playlist.resource;

import br.com.cifras.playlist.model.Playlist;
import br.com.cifras.playlist.dto.*;
import br.com.cifras.playlist.application.usecase.PlaylistService;
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
    PlaylistService playlistService;

    @Inject
    SecurityUtils securityUtils;

    /** POST /playlists → 201 */
    @POST
    public Response createPlaylist(@Valid CreatePlaylistRequest request) {
        String userId = securityUtils.getCurrentUserId();
        Playlist playlist = playlistService.create(request, userId);
        return Response.status(Response.Status.CREATED).entity(PlaylistDTO.from(playlist)).build();
    }

    /** GET /playlists → 200 list */
    @GET
    public Response listPlaylists() {
        String userId = securityUtils.getCurrentUserId();
        List<Playlist> playlists = playlistService.listByUser(userId);
        List<PlaylistDTO> dtos = playlists.stream().map(PlaylistDTO::from).toList();
        return Response.ok(dtos).build();
    }

    /** GET /playlists/{id} → 200 */
    @GET
    @Path("/{id}")
    public Response getPlaylist(@PathParam("id") UUID id) {
        String userId = securityUtils.getCurrentUserId();
        Playlist playlist = playlistService.getById(id, userId);
        return Response.ok(PlaylistDetailsDTO.from(playlist)).build();
    }

    /** DELETE /playlists/{id} → 204 */
    @DELETE
    @Path("/{id}")
    public Response deletePlaylist(@PathParam("id") UUID id) {
        String userId = securityUtils.getCurrentUserId();
        playlistService.delete(id, userId);
        return Response.noContent().build();
    }

    /** POST /playlists/{id}/songs → 204 */
    @POST
    @Path("/{id}/songs")
    public Response addSong(@PathParam("id") UUID id, AddSongRequest request) {
        String userId = securityUtils.getCurrentUserId();
        playlistService.addSong(id, request.songId(), request.position(), userId);
        return Response.noContent().build();
    }

    /** DELETE /playlists/{id}/songs/{songId} → 204 */
    @DELETE
    @Path("/{id}/songs/{songId}")
    public Response removeSong(@PathParam("id") UUID id, @PathParam("songId") UUID songId) {
        String userId = securityUtils.getCurrentUserId();
        playlistService.removeSong(id, songId, userId);
        return Response.noContent().build();
    }

    /** PATCH /playlists/{id}/songs/reorder → 204 */
    @PATCH
    @Path("/{id}/songs/reorder")
    public Response reorderSongs(@PathParam("id") UUID id, ReorderRequest request) {
        String userId = securityUtils.getCurrentUserId();
        playlistService.reorder(id, request.orderedSongIds(), userId);
        return Response.noContent().build();
    }
}
