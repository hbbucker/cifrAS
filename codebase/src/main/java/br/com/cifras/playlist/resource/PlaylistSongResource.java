package br.com.cifras.playlist.resource;

import br.com.cifras.playlist.dto.AddSongRequest;
import br.com.cifras.playlist.dto.ReorderRequest;
import br.com.cifras.playlist.application.usecase.AddSongToPlaylistUseCase;
import br.com.cifras.playlist.application.usecase.RemoveSongFromPlaylistUseCase;
import br.com.cifras.playlist.application.usecase.UpdatePlaylistSongPositionUseCase;
import br.com.cifras.shared.security.SecurityUtils;
import io.quarkus.security.Authenticated;
import jakarta.inject.Inject;
import jakarta.ws.rs.*;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;
import java.util.UUID;

@Path("/playlists/{id}/songs")
@Authenticated
@Produces(MediaType.APPLICATION_JSON)
@Consumes(MediaType.APPLICATION_JSON)
public class PlaylistSongResource {

    @Inject
    AddSongToPlaylistUseCase addSongToPlaylistUseCase;

    @Inject
    RemoveSongFromPlaylistUseCase removeSongFromPlaylistUseCase;

    @Inject
    UpdatePlaylistSongPositionUseCase updatePlaylistSongPositionUseCase;

    @Inject
    SecurityUtils securityUtils;

    @POST
    public Response addSong(@PathParam("id") UUID id, AddSongRequest request) {
        String userId = securityUtils.getCurrentUserId();
        addSongToPlaylistUseCase.execute(id, request.songId(), request.position(), userId);
        return Response.noContent().build();
    }

    @DELETE
    @Path("/{songId}")
    public Response removeSong(@PathParam("id") UUID id, @PathParam("songId") UUID songId) {
        String userId = securityUtils.getCurrentUserId();
        removeSongFromPlaylistUseCase.execute(id, songId, userId);
        return Response.noContent().build();
    }

    @PATCH
    @Path("/reorder")
    public Response reorderSongs(@PathParam("id") UUID id, ReorderRequest request) {
        String userId = securityUtils.getCurrentUserId();
        updatePlaylistSongPositionUseCase.execute(id, request.orderedSongIds(), userId);
        return Response.noContent().build();
    }
}
