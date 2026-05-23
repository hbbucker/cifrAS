package br.com.cifras.auth.service;

import jakarta.ws.rs.*;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;
import org.eclipse.microprofile.rest.client.inject.RegisterRestClient;

/**
 * REST client for Supabase Auth API.
 * URL configured via quarkus.rest-client.supabase-auth.url in application.properties.
 */
@RegisterRestClient(configKey = "supabase-auth")
@Path("/auth/v1")
public interface SupabaseAuthClient {

    @POST
    @Path("/signup")
    @Consumes(MediaType.APPLICATION_JSON)
    @Produces(MediaType.APPLICATION_JSON)
    Response signup(Object body);

    @POST
    @Path("/token?grant_type=password")
    @Consumes(MediaType.APPLICATION_JSON)
    @Produces(MediaType.APPLICATION_JSON)
    Response login(Object body);
}
