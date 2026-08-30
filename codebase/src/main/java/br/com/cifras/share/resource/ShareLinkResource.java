package br.com.cifras.share.resource;

import br.com.cifras.share.application.ShareLinkService;
import br.com.cifras.share.dto.ShareLinkCreateDTO;
import br.com.cifras.share.dto.ShareLinkResponseDTO;
import io.quarkus.security.Authenticated;
import io.quarkus.security.identity.SecurityIdentity;
import jakarta.inject.Inject;
import jakarta.validation.Valid;
import jakarta.ws.rs.*;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;
import org.eclipse.microprofile.jwt.JsonWebToken;

import java.util.Map;

@Path("/share-links")
@Produces(MediaType.APPLICATION_JSON)
@Consumes(MediaType.APPLICATION_JSON)
public class ShareLinkResource {

    @Inject
    ShareLinkService service;

    @Inject
    br.com.cifras.shared.security.SecurityUtils securityUtils;

    @POST
    @Authenticated
    public Response createShareLink(@Valid ShareLinkCreateDTO dto) {
        String userId = securityUtils.getCurrentUserId();
        ShareLinkResponseDTO responseDTO = service.createShareLink(dto, userId);
        return Response.status(Response.Status.CREATED).entity(responseDTO).build();
    }

    @GET
    @Path("/{token}")
    public Response getShareLink(@PathParam("token") String token) {
        ShareLinkResponseDTO responseDTO = service.getShareLink(token);
        return Response.ok(responseDTO).build();
    }

    @POST
    @Path("/{token}/accept")
    @Authenticated
    public Response acceptShareLink(@PathParam("token") String token) {
        String userId = securityUtils.getCurrentUserId();
        service.acceptShareLink(token, userId);
        return Response.ok(Map.of("success", true, "message", "Convite aceito com sucesso")).build();
    }
}
