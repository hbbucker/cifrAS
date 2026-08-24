package br.com.cifras.admin.song.resource;

import br.com.cifras.admin.shared.dto.PagedResponseDTO;
import br.com.cifras.admin.shared.security.AdminSecurityUtils;
import br.com.cifras.admin.song.application.GetAdminSongUseCase;
import br.com.cifras.admin.song.application.ListAdminSongsUseCase;
import br.com.cifras.admin.song.application.ModerateSongUseCase;
import br.com.cifras.admin.song.dto.AdminSongDTO;
import jakarta.inject.Inject;
import jakarta.ws.rs.*;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;

import java.util.UUID;

@Path("/admin/songs")
@Produces(MediaType.APPLICATION_JSON)
@Consumes(MediaType.APPLICATION_JSON)
public class AdminSongResource {

    @Inject
    AdminSecurityUtils securityUtils;

    @Inject
    ListAdminSongsUseCase listAdminSongsUseCase;

    @Inject
    GetAdminSongUseCase getAdminSongUseCase;

    @Inject
    ModerateSongUseCase moderateSongUseCase;

    @GET
    public Response listSongs(
            @QueryParam("search") String search,
            @QueryParam("deletedOnly") Boolean deletedOnly,
            @QueryParam("page") @DefaultValue("0") int page,
            @QueryParam("pageSize") @DefaultValue("20") int pageSize) {
        securityUtils.requireAdmin();
        PagedResponseDTO<AdminSongDTO> response = listAdminSongsUseCase.execute(search, deletedOnly, page, pageSize);
        return Response.ok(response).build();
    }

    @GET
    @Path("/{id}")
    public Response getSong(@PathParam("id") UUID id) {
        securityUtils.requireAdmin();
        AdminSongDTO song = getAdminSongUseCase.execute(id);
        return Response.ok(song).build();
    }

    @DELETE
    @Path("/{id}")
    public Response softDeleteSong(@PathParam("id") UUID id) {
        securityUtils.requireAdmin();
        AdminSongDTO updated = moderateSongUseCase.softDelete(id);
        return Response.ok(updated).build();
    }

    @POST
    @Path("/{id}/restore")
    public Response restoreSong(@PathParam("id") UUID id) {
        securityUtils.requireAdmin();
        AdminSongDTO updated = moderateSongUseCase.restore(id);
        return Response.ok(updated).build();
    }

    @DELETE
    @Path("/{id}/permanent")
    public Response permanentDeleteSong(@PathParam("id") UUID id) {
        securityUtils.requireAdmin();
        moderateSongUseCase.hardDelete(id);
        return Response.noContent().build();
    }
}
