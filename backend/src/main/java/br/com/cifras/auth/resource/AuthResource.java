package br.com.cifras.auth.resource;

import br.com.cifras.auth.dto.AuthRequest;
import br.com.cifras.auth.service.SupabaseAuthClient;
import jakarta.annotation.security.PermitAll;
import jakarta.inject.Inject;
import jakarta.validation.Valid;
import jakarta.ws.rs.*;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;
import org.eclipse.microprofile.rest.client.inject.RestClient;

import java.util.HashMap;
import java.util.Map;

/**
 * AuthResource — proxies authentication requests to Supabase Auth.
 * No passwords are stored locally; Supabase handles all credential management.
 */
@Path("/auth")
@PermitAll
@Produces(MediaType.APPLICATION_JSON)
@Consumes(MediaType.APPLICATION_JSON)
public class AuthResource {

    @Inject
    @RestClient
    SupabaseAuthClient supabaseClient;

    /**
     * POST /auth/register — creates a new user in Supabase Auth.
     * Returns 201 with user_id and email on success.
     * Returns 409 if email is already registered.
     */
    @POST
    @Path("/register")
    public Response register(@Valid AuthRequest request) {
        Map<String, String> body = Map.of(
            "email", request.email(),
            "password", request.password()
        );

        Response supabaseResponse = supabaseClient.signup(body);
        int status = supabaseResponse.getStatus();

        if (status == 200 || status == 201) {
            @SuppressWarnings("unchecked")
            Map<String, Object> supabaseBody = supabaseResponse.readEntity(Map.class);
            Map<String, Object> result = new HashMap<>();
            result.put("userId", supabaseBody.get("id"));
            result.put("email", supabaseBody.get("email"));
            return Response.status(Response.Status.CREATED).entity(result).build();
        }

        if (status == 422) {
            return Response.status(409)
                .entity(Map.of("error", "Email já cadastrado"))
                .build();
        }

        return Response.status(status).entity(Map.of("error", "Registration failed")).build();
    }

    /**
     * POST /auth/login — authenticates a user via Supabase Auth.
     * Returns 200 with accessToken and refreshToken on success.
     * Returns 401 on invalid credentials.
     */
    @POST
    @Path("/login")
    public Response login(@Valid AuthRequest request) {
        Map<String, String> body = Map.of(
            "email", request.email(),
            "password", request.password()
        );

        Response supabaseResponse = supabaseClient.login(body);
        int status = supabaseResponse.getStatus();

        if (status == 200) {
            @SuppressWarnings("unchecked")
            Map<String, Object> supabaseBody = supabaseResponse.readEntity(Map.class);
            Map<String, Object> result = new HashMap<>();
            result.put("accessToken", supabaseBody.get("access_token"));
            result.put("refreshToken", supabaseBody.get("refresh_token"));
            return Response.ok(result).build();
        }

        return Response.status(401)
            .entity(Map.of("error", "Credenciais inválidas"))
            .build();
    }
}
