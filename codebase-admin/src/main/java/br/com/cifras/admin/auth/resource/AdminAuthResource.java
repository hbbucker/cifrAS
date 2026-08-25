package br.com.cifras.admin.auth.resource;

import jakarta.annotation.security.PermitAll;
import jakarta.ws.rs.*;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;
import org.eclipse.microprofile.config.inject.ConfigProperty;

import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.util.Map;

@Path("/admin/auth")
@PermitAll
@Produces(MediaType.APPLICATION_JSON)
@Consumes(MediaType.APPLICATION_JSON)
public class AdminAuthResource {

    @ConfigProperty(name = "quarkus.rest-client.supabase-auth.url", defaultValue = "http://localhost:8000")
    String supabaseUrl;

    @GET
    @Path("/google-url")
    @PermitAll
    public Response getGoogleLoginUrl(@QueryParam("redirectTo") String redirectTo) {
        String baseUrl = supabaseUrl;
        if (baseUrl.endsWith("/")) {
            baseUrl = baseUrl.substring(0, baseUrl.length() - 1);
        }
        String redirectTarget = redirectTo != null ? URLEncoder.encode(redirectTo, StandardCharsets.UTF_8) : "";
        String url = baseUrl + "/auth/v1/authorize?provider=google&redirect_to=" + redirectTarget;
        return Response.ok(Map.of("url", url)).build();
    }
}
