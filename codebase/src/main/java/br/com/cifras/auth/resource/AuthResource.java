package br.com.cifras.auth.resource;

import br.com.cifras.auth.dto.AuthRequest;
import br.com.cifras.auth.application.usecase.SupabaseAuthClient;
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
        Map<String, Object> body = new HashMap<>();
        body.put("email", request.email());
        body.put("password", request.password());
        
        if (request.name() != null && !request.name().isBlank()) {
            body.put("data", Map.of("full_name", request.name()));
        }

        Response supabaseResponse;
        try {
            supabaseResponse = supabaseClient.signup(body);
        } catch (jakarta.ws.rs.WebApplicationException ex) {
            supabaseResponse = ex.getResponse();
        }

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

        String errorMsg = "Registration failed";
        try {
            @SuppressWarnings("unchecked")
            Map<String, Object> errorBody = supabaseResponse.readEntity(Map.class);
            if (errorBody != null && errorBody.containsKey("msg")) {
                errorMsg = (String) errorBody.get("msg");
            } else if (errorBody != null && errorBody.containsKey("message")) {
                errorMsg = (String) errorBody.get("message");
            }
        } catch (Exception e) {
            // Ignora se não conseguir ler
        }

        return Response.status(status).entity(Map.of("error", errorMsg)).build();
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
                "password", request.password());

        Response supabaseResponse;
        try {
            supabaseResponse = supabaseClient.login("password", body);
        } catch (jakarta.ws.rs.WebApplicationException ex) {
            supabaseResponse = ex.getResponse();
        }

        int status = supabaseResponse.getStatus();

        if (status == 200) {
            @SuppressWarnings("unchecked")
            Map<String, Object> supabaseBody = supabaseResponse.readEntity(Map.class);
            Map<String, Object> result = new HashMap<>();
            result.put("accessToken", supabaseBody.get("access_token"));
            result.put("refreshToken", supabaseBody.get("refresh_token"));
            return Response.ok(result).build();
        }

        String errorMsg = "Credenciais inválidas";
        try {
            String rawBody = supabaseResponse.readEntity(String.class);
            if (rawBody != null) {
                if (rawBody.contains("\"error_description\":\"")) {
                    int start = rawBody.indexOf("\"error_description\":\"") + 21;
                    int end = rawBody.indexOf("\"", start);
                    errorMsg = rawBody.substring(start, end);
                } else if (rawBody.contains("\"msg\":\"")) {
                    int start = rawBody.indexOf("\"msg\":\"") + 7;
                    int end = rawBody.indexOf("\"", start);
                    errorMsg = rawBody.substring(start, end);
                } else if (rawBody.contains("\"message\":\"")) {
                    int start = rawBody.indexOf("\"message\":\"") + 11;
                    int end = rawBody.indexOf("\"", start);
                    errorMsg = rawBody.substring(start, end);
                } else {
                    errorMsg = rawBody; // Fallback to see raw content
                }
            }
        } catch (Exception e) {
            System.err.println("Failed to read Supabase error response: " + e.getMessage());
        }

        return Response.status(401)
                .entity(Map.of("error", errorMsg))
                .build();
    }

    /**
     * POST /auth/refresh — silent token refresh.
     * Returns 200 with new accessToken and refreshToken.
     */
    @POST
    @Path("/refresh")
    public Response refresh(Map<String, String> body) {
        if (body == null || !body.containsKey("refreshToken")) {
            return Response.status(400).entity(Map.of("error", "refresh token missing")).build();
        }

        Map<String, String> supabaseBody = Map.of(
                "refresh_token", body.get("refreshToken"));

        Response supabaseResponse;
        try {
            supabaseResponse = supabaseClient.refresh("refresh_token", supabaseBody);
        } catch (jakarta.ws.rs.WebApplicationException ex) {
            supabaseResponse = ex.getResponse();
        }

        int status = supabaseResponse.getStatus();

        if (status == 200) {
            @SuppressWarnings("unchecked")
            Map<String, Object> responseBody = supabaseResponse.readEntity(Map.class);
            Map<String, Object> result = new HashMap<>();
            result.put("accessToken", responseBody.get("access_token"));
            result.put("refreshToken", responseBody.get("refresh_token"));
            return Response.ok(result).build();
        }

        return Response.status(status).entity(Map.of("error", "Refresh token failed")).build();
    }

    /**
     * POST /auth/logout — invalidates the token in Supabase Auth.
     */
    @POST
    @Path("/logout")
    public Response logout(@HeaderParam("Authorization") String authorization) {
        if (authorization == null || authorization.isBlank()) {
            return Response.status(401).entity(Map.of("error", "No token provided")).build();
        }

        Response supabaseResponse;
        try {
            supabaseResponse = supabaseClient.logout(authorization);
        } catch (jakarta.ws.rs.WebApplicationException ex) {
            supabaseResponse = ex.getResponse();
        }

        int status = supabaseResponse.getStatus();
        if (status == 204 || status == 200) {
            return Response.ok(Map.of("message", "Logged out successfully")).build();
        }

        return Response.status(status).entity(Map.of("error", "Logout failed")).build();
    }

    @PUT
    @Path("/profile")
    public Response updateProfile(@HeaderParam("Authorization") String authorization, Map<String, Object> updates) {
        if (authorization == null || authorization.isBlank()) {
            return Response.status(401).entity(Map.of("error", "No token provided")).build();
        }

        String name = (String) updates.get("name");
        if (name == null || name.isBlank()) {
            return Response.status(400).entity(Map.of("error", "Name is required")).build();
        }

        Map<String, Object> body = new HashMap<>();
        body.put("data", Map.of("full_name", name));

        Response supabaseResponse;
        try {
            supabaseResponse = supabaseClient.updateUser(authorization, body);
        } catch (jakarta.ws.rs.WebApplicationException ex) {
            supabaseResponse = ex.getResponse();
        }

        int status = supabaseResponse.getStatus();
        if (status == 200) {
            @SuppressWarnings("unchecked")
            Map<String, Object> responseBody = supabaseResponse.readEntity(Map.class);
            return Response.ok(responseBody).build();
        }

        return Response.status(status).entity(Map.of("error", "Update profile failed")).build();
    }
}
