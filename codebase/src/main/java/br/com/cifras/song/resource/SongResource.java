package br.com.cifras.song.resource;

import br.com.cifras.shared.dto.PagedResponse;
import br.com.cifras.shared.security.SecurityUtils;
import br.com.cifras.song.model.EnharmonicConvention;
import br.com.cifras.song.model.LyricsStructure;
import br.com.cifras.song.model.Song;
import br.com.cifras.song.dto.*;
import br.com.cifras.song.application.usecase.ListUserSongsUseCase;
import br.com.cifras.song.application.usecase.CreateSongUseCase;
import br.com.cifras.song.application.usecase.GetSongUseCase;
import br.com.cifras.song.application.usecase.UpdateSongUseCase;
import br.com.cifras.song.application.usecase.UpdateSongPreferencesUseCase;
import br.com.cifras.song.application.usecase.DeleteSongUseCase;
import br.com.cifras.song.application.usecase.TranspositionService;
import br.com.cifras.song.application.usecase.ToggleSongFavoriteUseCase;
import io.quarkus.security.Authenticated;
import jakarta.inject.Inject;
import jakarta.validation.Valid;
import jakarta.ws.rs.*;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;
import br.com.cifras.song.dto.SongPreferencesDTO;

import java.util.List;
import java.util.UUID;

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
    ListUserSongsUseCase listUserSongsUseCase;

    @Inject
    CreateSongUseCase createSongUseCase;

    @Inject
    GetSongUseCase getSongUseCase;

    @Inject
    UpdateSongUseCase updateSongUseCase;

    @Inject
    UpdateSongPreferencesUseCase updateSongPreferencesUseCase;

    @Inject
    DeleteSongUseCase deleteSongUseCase;

    @Inject
    ToggleSongFavoriteUseCase toggleSongFavoriteUseCase;

    @Inject
    SecurityUtils securityUtils;

    @Inject
    TranspositionService transpositionService;

    @GET
    public Response listSongs(
        @QueryParam("q") String query,
        @QueryParam("page") @DefaultValue("1") int page,
        @QueryParam("size") @DefaultValue("20") int size
    ) {
        if (page < 1) page = 1;
        if (size < 1) size = 20;
        if (size > 100) size = 100;

        String userId = securityUtils.getCurrentUserId();
        PagedResponse<Song> songs = listUserSongsUseCase.execute(userId, page, size, query);

        List<SongSummaryDTO> summaries = songs.items().stream()
            .map(SongSummaryDTO::from)
            .toList();

        return Response.ok(PagedResponse.of(summaries, songs.totalCount(), songs.page(), songs.size())).build();
    }

    @POST
    public Response createSong(@Valid CreateSongRequest request) {
        String userId = securityUtils.getCurrentUserId();
        Song song = createSongUseCase.execute(request, userId);
        return Response.status(Response.Status.CREATED).entity(SongDTO.from(song)).build();
    }

    @GET
    @Path("/{id}")
    public Response getSong(
        @PathParam("id") UUID id,
        @QueryParam("transpose") Integer transpose
    ) {
        String userId = securityUtils.getCurrentUserId();
        Song song = getSongUseCase.execute(id, userId);
        LyricsStructure lyrics = song.getLyrics();
        if (transpose != null && lyrics != null) {
            lyrics = transpositionService.transpose(lyrics, transpose, EnharmonicConvention.SHARPS);
        }
        SongDTO dto = new SongDTO(song.getId(), song.getTitle(), song.getArtist(), song.getOriginalKey(),
            lyrics, null, song.getIsFavorite(), song.getPrefUseBb(), song.getPrefUseEb(), song.getPrefAutoScrollSpeed(), song.getPrefTransposeSteps(), song.getCreatedAt(), song.getUpdatedAt());
        return Response.ok(dto).build();
    }

    @POST
    @Path("/{id}/transpose")
    public Response transposeSong(@PathParam("id") UUID id, @Valid TransposeRequest request) {
        String userId = securityUtils.getCurrentUserId();
        Song song = getSongUseCase.execute(id, userId);
        LyricsStructure transposed = transpositionService.transpose(
            song.getLyrics(), request.semitones(), request.convention());
        SongDTO dto = new SongDTO(song.getId(), song.getTitle(), song.getArtist(), song.getOriginalKey(),
            transposed, null, song.getIsFavorite(), song.getPrefUseBb(), song.getPrefUseEb(), song.getPrefAutoScrollSpeed(), song.getPrefTransposeSteps(), song.getCreatedAt(), song.getUpdatedAt());
        return Response.ok(dto).build();
    }

    @PUT
    @Path("/{id}")
    public Response updateSong(@PathParam("id") UUID id, @Valid UpdateSongRequest request) {
        String userId = securityUtils.getCurrentUserId();
        Song song = updateSongUseCase.execute(id, request, userId);
        return Response.ok(SongDTO.from(song)).build();
    }

    @PUT
    @Path("/{id}/preferences")
    public Response updatePreferences(@PathParam("id") UUID id, @Valid SongPreferencesDTO request) {
        String userId = securityUtils.getCurrentUserId();
        updateSongPreferencesUseCase.execute(id, request, userId);
        return Response.noContent().build();
    }

    @DELETE
    @Path("/{id}")
    public Response deleteSong(@PathParam("id") UUID id) {
        String userId = securityUtils.getCurrentUserId();
        deleteSongUseCase.execute(id, userId);
        return Response.noContent().build();
    }

    @PATCH
    @Path("/{id}/favorite")
    public Response toggleFavorite(@PathParam("id") UUID id) {
        String userId = securityUtils.getCurrentUserId();
        Song song = toggleSongFavoriteUseCase.execute(id, userId);
        SongSummaryDTO dto = SongSummaryDTO.from(song);
        return Response.ok(dto).build();
    }
}
