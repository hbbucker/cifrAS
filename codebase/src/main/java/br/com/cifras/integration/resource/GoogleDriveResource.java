package br.com.cifras.integration.resource;

import br.com.cifras.integration.application.GoogleDriveService;
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
    private final br.com.cifras.user.application.UserIntegrationService integrationService;
    private final JsonWebToken jwt;

    @Inject
    public GoogleDriveResource(GoogleDriveService googleDriveService, br.com.cifras.user.application.UserIntegrationService integrationService, JsonWebToken jwt) {
        this.googleDriveService = googleDriveService;
        this.integrationService = integrationService;
        this.jwt = jwt;
    }

    private UUID getUserId() {
        return UUID.fromString(jwt.getSubject());
    }

    @GET
    @Path("/accounts")
    @RolesAllowed("authenticated")
    public Response getAccounts() {
        try {
            List<br.com.cifras.user.model.UserIntegration> integrations = integrationService.getGoogleTokens(getUserId());
            List<AccountResponse> accounts = integrations.stream()
                    .map(i -> new AccountResponse(i.getEmail()))
                    .toList();
            return Response.ok(accounts).build();
        } catch (Exception e) {
            return Response.serverError().entity(new ErrorResponse("Failed to list accounts: " + e.getMessage())).build();
        }
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
    public Response listFiles(@QueryParam("email") String email, @QueryParam("q") String query) {
        if (email == null || email.isBlank()) {
            return Response.status(Response.Status.BAD_REQUEST).entity(new ErrorResponse("Email is required")).build();
        }
        try {
            List<br.com.cifras.integration.dto.DriveFileDTO> files = googleDriveService.listFiles(getUserId(), email, query);
            return Response.ok(files).build();
        } catch (IllegalStateException e) {
            return Response.status(Response.Status.FORBIDDEN).entity(new ErrorResponse("NO_INTEGRATION")).build();
        } catch (Exception e) {
            return Response.serverError().entity(new ErrorResponse("Failed to list files: " + e.getMessage())).build();
        }
    }

    @POST
    @Path("/drive/extract-text/{fileId}")
    @RolesAllowed("authenticated")
    public Response extractText(@PathParam("fileId") String fileId, @QueryParam("email") String email) {
        if (email == null || email.isBlank()) {
            return Response.status(Response.Status.BAD_REQUEST).entity(new ErrorResponse("Email is required")).build();
        }
        try {
            String text = googleDriveService.extractTextFromFile(getUserId(), fileId, email);
            return Response.ok(new ExtractTextResponse(text)).build();
        } catch (IllegalStateException e) {
            return Response.status(Response.Status.FORBIDDEN).entity(new ErrorResponse("NO_INTEGRATION")).build();
        } catch (Exception e) {
            return Response.serverError().entity(new ErrorResponse("Failed to extract text: " + e.getMessage())).build();
        }
    }

    public record AuthUrlResponse(String url) {}
    public record CallbackRequest(String code) {}
    public record ExtractTextResponse(String text) {}
    public record ErrorResponse(String error) {}
    public record AccountResponse(String email) {}
}
