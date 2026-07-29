package br.com.cifras.performance.resource;

import br.com.cifras.performance.application.PerformanceSessionService;
import br.com.cifras.performance.dto.PerformanceSessionRequest;
import br.com.cifras.performance.dto.PerformanceSessionResponse;
import br.com.cifras.shared.security.SecurityUtils;
import io.quarkus.security.Authenticated;
import jakarta.inject.Inject;
import jakarta.validation.Valid;
import jakarta.ws.rs.*;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;

@Path("/performance/sessions/active")
@Produces(MediaType.APPLICATION_JSON)
@Consumes(MediaType.APPLICATION_JSON)
@Authenticated
public class PerformanceSessionResource {

    @Inject
    PerformanceSessionService service;

    @Inject
    SecurityUtils securityUtils;

    @GET
    public Response getActiveSession() {
        String userId = securityUtils.getCurrentUserId();
        return service.getActiveSession(userId)
                .map(response -> Response.ok(response).build())
                .orElseGet(() -> Response.status(Response.Status.NOT_FOUND).build());
    }

    @PATCH
    public Response upsertSession(@Valid PerformanceSessionRequest request) {
        String userId = securityUtils.getCurrentUserId();
        service.upsertSession(userId, request);
        return Response.noContent().build();
    }
    
    @DELETE
    public Response deleteSession() {
        String userId = securityUtils.getCurrentUserId();
        service.deleteSession(userId);
        return Response.noContent().build();
    }
}
