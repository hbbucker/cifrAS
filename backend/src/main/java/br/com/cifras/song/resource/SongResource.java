package br.com.cifras.song.resource;

import br.com.cifras.shared.dto.PagedResponse;
import br.com.cifras.shared.security.SecurityUtils;
import br.com.cifras.song.domain.Song;
import br.com.cifras.song.dto.CreateSongRequest;
import br.com.cifras.song.dto.SongDTO;
import br.com.cifras.song.dto.SongSummaryDTO;
import br.com.cifras.song.dto.UpdateSongRequest;
import br.com.cifras.song.service.SongService;
import io.quarkus.security.Authenticated;
import jakarta.inject.Inject;
import jakarta.validation.Valid;
import jakarta.ws.rs.*;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;

import java.util.List;

/**
 * SongResource — REST endpoints for song CRUD operations.
 *
 * All routes require authentication (@Authenticated at class level).
 * Public access is NOT permitted on any song endpoint.
 */
@Path("/songs")
@Authenticated
@Produces(MediaType.APPLICATION_JSON)
@Consumes(MediaType.APPLICATION_JSON)
public class SongResource {

    @Inject
    SongService songService;

    @Inject
    SecurityUtils securityUtils;

    /**
     * GET /songs — list songs with optional search and pagination.
     * Defaults: page=1, pageSize=20
     */
    @GET
    public Response listSongs(
        @QueryParam("q") String query,
        @QueryParam("page") @DefaultValue("1") int page,
        @QueryParam("pageSize") @DefaultValue("20") int pageSize
    ) {
        String userId = securityUtils.getCurrentUserId();
        PagedResponse<Song> songs = songService.listByUser(userId, page, pageSize, query);

        List<SongSummaryDTO> summaries = songs.data().stream()
            .map(SongSummaryDTO::from)
            .toList();

        return Response.ok(PagedResponse.of(summaries, songs.total(), songs.page(), songs.pageSize())).build();
    }

    /**
     * POST /songs — create a new song.
     * Returns 201 Created with the full SongDTO.
     */
    @POST
    public Response createSong(@Valid CreateSongRequest request) {
        String userId = securityUtils.getCurrentUserId();
        Song song = songService.create(request, userId);
        return Response.status(Response.Status.CREATED).entity(SongDTO.from(song)).build();
    }

    /**
     * GET /songs/{id} — get a specific song by ID.
     * Returns 404 if not found or belongs to another user.
     */
    @GET
    @Path("/{id}")
    public Response getSong(@PathParam("id") Long id) {
        String userId = securityUtils.getCurrentUserId();
        Song song = songService.findByIdAndUser(id, userId);
        return Response.ok(SongDTO.from(song)).build();
    }

    /**
     * PUT /songs/{id} — update a song. Only the owner can update.
     * Returns 403 if not owner, 404 if not found.
     */
    @PUT
    @Path("/{id}")
    public Response updateSong(@PathParam("id") Long id, @Valid UpdateSongRequest request) {
        String userId = securityUtils.getCurrentUserId();
        Song song = songService.update(id, request, userId);
        return Response.ok(SongDTO.from(song)).build();
    }

    /**
     * DELETE /songs/{id} — soft-delete a song.
     * Returns 204 No Content. Only the owner can delete.
     */
    @DELETE
    @Path("/{id}")
    public Response deleteSong(@PathParam("id") Long id) {
        String userId = securityUtils.getCurrentUserId();
        songService.softDelete(id, userId);
        return Response.noContent().build();
    }
}
