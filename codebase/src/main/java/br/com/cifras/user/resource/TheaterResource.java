package br.com.cifras.user.resource;

import br.com.cifras.shared.security.SecurityUtils;
import br.com.cifras.user.application.usecase.GetSongPreferenceUseCase;
import br.com.cifras.user.application.usecase.GetTheaterSessionUseCase;
import br.com.cifras.user.application.usecase.UpdateTheaterSessionUseCase;
import br.com.cifras.user.resource.dto.TheaterSessionStateDTO;
import io.quarkus.security.Authenticated;
import jakarta.inject.Inject;
import jakarta.ws.rs.*;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;
import java.util.UUID;

@Path("/theater")
@Authenticated
@Produces(MediaType.APPLICATION_JSON)
@Consumes(MediaType.APPLICATION_JSON)
public class TheaterResource {

    @Inject
    UpdateTheaterSessionUseCase updateTheaterSessionUseCase;

    @Inject
    GetTheaterSessionUseCase getTheaterSessionUseCase;

    @Inject
    GetSongPreferenceUseCase getSongPreferenceUseCase;

    @Inject
    SecurityUtils securityUtils;

    @PUT
    @Path("/session")
    public Response updateSession(TheaterSessionStateDTO req) {
        String userId = securityUtils.getCurrentUserId();
        updateTheaterSessionUseCase.execute(userId, req);
        return Response.noContent().build();
    }

    @GET
    @Path("/session")
    public Response getSession() {
        String userId = securityUtils.getCurrentUserId();
        return getTheaterSessionUseCase.execute(userId)
                .map(dto -> Response.ok(dto).build())
                .orElse(Response.noContent().build());
    }

    @GET
    @Path("/song-preferences/{songId}")
    public Response getSongPreference(@PathParam("songId") UUID songId) {
        String userId = securityUtils.getCurrentUserId();
        return getSongPreferenceUseCase.execute(userId, songId)
                .map(dto -> Response.ok(dto).build())
                .orElse(Response.noContent().build());
    }
}
