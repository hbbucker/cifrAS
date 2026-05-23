package br.com.cifras.shared.security;

import io.quarkus.security.Authenticated;
import io.quarkus.security.identity.SecurityIdentity;
import jakarta.inject.Inject;
import jakarta.ws.rs.GET;
import jakarta.ws.rs.Path;
import jakarta.ws.rs.Produces;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;

/**
 * Internal test resource to exercise JWT security.
 * NOT exposed as a public endpoint in production.
 */
@Path("/internal/ping")
public class PingResource {

    @Inject
    SecurityIdentity securityIdentity;

    @GET
    @Authenticated
    @Produces(MediaType.APPLICATION_JSON)
    public Response ping() {
        String userId = securityIdentity.getPrincipal().getName();
        return Response.ok("{\"userId\":\"" + userId + "\"}").build();
    }
}
