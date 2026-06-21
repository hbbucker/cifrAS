package br.com.cifras.integration.resource;

import br.com.cifras.integration.application.GoogleDriveService;
import com.google.api.services.drive.model.File;
import jakarta.annotation.security.RolesAllowed;
import jakarta.inject.Inject;
import jakarta.ws.rs.Consumes;
import jakarta.ws.rs.GET;
import jakarta.ws.rs.POST;
import jakarta.ws.rs.Path;
import jakarta.ws.rs.PathParam;
import jakarta.ws.rs.Produces;
import jakarta.ws.rs.QueryParam;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;
import org.eclipse.microprofile.jwt.JsonWebToken;

import java.util.List;
import java.util.UUID;

@Path("/integrations/google")
@Produces(MediaType.APPLICATION_JSON)
@Consumes(MediaType.APPLICATION_JSON)
public class GoogleDriveResource {

    private final GoogleDriveService googleDriveService;
    private final JsonWebToken jwt;

    @Inject
    public GoogleDriveResource(GoogleDriveService googleDriveService, JsonWebToken jwt) {
        this.googleDriveService = googleDriveService;
        this.jwt = jwt;
    }

    private UUID getUserId() {
        return UUID.fromString(jwt.getSubject());
    }

    @GET
    @Path("/auth-url")
    @RolesAllowed("authenticated")
    public Response getAuthUrl() {
        try {
            String url = googleDriveService.getAuthUrl();
            return Response.ok(new AuthUrlResponse(url)).build();
        } catch (Exception e) {
            return Response.serverError().entity(new ErrorResponse("Failed to generate Auth URL: " + e.getMessage())).build();
        }
    }

    @POST
    @Path("/callback")
    @RolesAllowed("authenticated")
    public Response exchangeCode(CallbackRequest request) {
        try {
            googleDriveService.exchangeCode(request.code(), getUserId());
            return Response.ok().build();
        } catch (Exception e) {
            return Response.serverError().entity(new ErrorResponse("Failed to exchange token: " + e.getMessage())).build();
        }
    }

    @GET
    @Path("/drive/files")
    @RolesAllowed("authenticated")
    public Response listFiles() {
        try {
            List<File> files = googleDriveService.listFiles(getUserId());
            return Response.ok(files).build();
        } catch (Exception e) {
            return Response.serverError().entity(new ErrorResponse("Failed to list files: " + e.getMessage())).build();
        }
    }

    @POST
    @Path("/drive/extract-text/{fileId}")
    @RolesAllowed("authenticated")
    public Response extractText(@PathParam("fileId") String fileId) {
        try {
            String text = googleDriveService.extractTextFromFile(getUserId(), fileId);
            return Response.ok(new ExtractTextResponse(text)).build();
        } catch (Exception e) {
            return Response.serverError().entity(new ErrorResponse("Failed to extract text: " + e.getMessage())).build();
        }
    }

    public record AuthUrlResponse(String url) {}
    public record CallbackRequest(String code) {}
    public record ExtractTextResponse(String text) {}
    public record ErrorResponse(String error) {}
}
