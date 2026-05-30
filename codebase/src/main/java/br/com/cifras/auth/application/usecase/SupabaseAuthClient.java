package br.com.cifras.auth.application.usecase;

import jakarta.ws.rs.*;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;
import org.eclipse.microprofile.rest.client.annotation.ClientHeaderParam;
import org.eclipse.microprofile.rest.client.inject.RegisterRestClient;

/**
 * REST client for Supabase Auth API.
 * URL configured via quarkus.rest-client.supabase-auth.url in
 * application.properties.
 */
@RegisterRestClient(configKey = "supabase-auth")
@Path("/auth/v1")
@ClientHeaderParam(name = "apikey", value = "${supabase.apikey}")
@ClientHeaderParam(name = "Authorization", value = "Bearer ${supabase.apikey}")
public interface SupabaseAuthClient {

    @POST
    @Path("/signup")
    @Consumes(MediaType.APPLICATION_JSON)
    @Produces(MediaType.APPLICATION_JSON)
    Response signup(Object body);

    @POST
    @Path("/token")
    @Consumes(MediaType.APPLICATION_JSON)
    @Produces(MediaType.APPLICATION_JSON)
    Response login(@QueryParam("grant_type") String grantType, Object body);

    @POST
    @Path("/token")
    @Consumes(MediaType.APPLICATION_JSON)
    @Produces(MediaType.APPLICATION_JSON)
    Response refresh(@QueryParam("grant_type") String grantType, Object body);

    @POST
    @Path("/logout")
    @Consumes(MediaType.APPLICATION_JSON)
    @Produces(MediaType.APPLICATION_JSON)
    Response logout(@HeaderParam("Authorization") String authorization);

    @PUT
    @Path("/user")
    @Consumes(MediaType.APPLICATION_JSON)
    @Produces(MediaType.APPLICATION_JSON)
    Response updateUser(@HeaderParam("Authorization") String authorization, Object body);
}
