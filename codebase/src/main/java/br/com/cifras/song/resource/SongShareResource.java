package br.com.cifras.song.resource;

import br.com.cifras.shared.security.SecurityUtils;
import br.com.cifras.song.application.usecase.AcceptSongShareUseCase;
import br.com.cifras.song.application.usecase.DeclineSongShareUseCase;
import br.com.cifras.song.application.usecase.ListPendingSongSharesUseCase;
import br.com.cifras.song.application.usecase.ShareSongUseCase;
import br.com.cifras.song.dto.PendingSongShareItemDTO;
import br.com.cifras.song.dto.ShareSongRequestDTO;
import br.com.cifras.song.dto.SongDTO;
import br.com.cifras.song.dto.SongShareResponseDTO;
import br.com.cifras.song.model.Song;
import br.com.cifras.song.model.SongShare;
import io.quarkus.security.Authenticated;
import jakarta.inject.Inject;
import jakarta.validation.Valid;
import jakarta.ws.rs.*;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;

import java.util.List;
import java.util.UUID;

@Path("/songs")
@Authenticated
@Produces(MediaType.APPLICATION_JSON)
@Consumes(MediaType.APPLICATION_JSON)
public class SongShareResource {

    @Inject
    ShareSongUseCase shareSongUseCase;

    @Inject
    ListPendingSongSharesUseCase listPendingSongSharesUseCase;

    @Inject
    AcceptSongShareUseCase acceptSongShareUseCase;

    @Inject
    DeclineSongShareUseCase declineSongShareUseCase;

    @Inject
    SecurityUtils securityUtils;

    @POST
    @Path("/{id}/share")
    public Response shareSong(@PathParam("id") UUID songId, @Valid ShareSongRequestDTO request) {
        String userId = securityUtils.getCurrentUserId();
        SongShare share = shareSongUseCase.execute(songId, request.email(), userId);
        return Response.status(Response.Status.CREATED).entity(SongShareResponseDTO.from(share)).build();
    }

    @GET
    @Path("/shares/pending")
    public Response listPendingShares() {
        String email = securityUtils.getCurrentUserEmail();
        if (email == null) {
            return Response.status(Response.Status.BAD_REQUEST).entity("Email not found in token").build();
        }
        List<PendingSongShareItemDTO> list = listPendingSongSharesUseCase.execute(email);
        return Response.ok(list).build();
    }

    @POST
    @Path("/shares/{shareId}/accept")
    public Response acceptShare(@PathParam("shareId") UUID shareId) {
        String email = securityUtils.getCurrentUserEmail();
        String userId = securityUtils.getCurrentUserId();
        if (email == null) {
            return Response.status(Response.Status.BAD_REQUEST).entity("Email not found in token").build();
        }
        Song clonedSong = acceptSongShareUseCase.execute(shareId, email, userId);
        return Response.ok(SongDTO.from(clonedSong)).build();
    }

    @POST
    @Path("/shares/{shareId}/decline")
    public Response declineShare(@PathParam("shareId") UUID shareId) {
        String email = securityUtils.getCurrentUserEmail();
        if (email == null) {
            return Response.status(Response.Status.BAD_REQUEST).entity("Email not found in token").build();
        }
        declineSongShareUseCase.execute(shareId, email);
        return Response.noContent().build();
    }
}
