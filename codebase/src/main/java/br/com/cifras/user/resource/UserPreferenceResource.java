package br.com.cifras.user.resource;

import br.com.cifras.user.model.UserPreference;
import br.com.cifras.user.resource.dto.UserPreferenceDTO;
import br.com.cifras.user.application.usecase.UserPreferenceService;
import br.com.cifras.shared.security.SecurityUtils;
import io.quarkus.security.Authenticated;
import jakarta.ws.rs.*;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;
import jakarta.inject.Inject;

@Path("/users/preferences")
@Produces(MediaType.APPLICATION_JSON)
@Consumes(MediaType.APPLICATION_JSON)
public class UserPreferenceResource {

    @Inject
    SecurityUtils securityUtils;

    @Inject
    UserPreferenceService service;

    @GET
    @Authenticated
    public Response getPreferences() {
        String userId = securityUtils.getCurrentUserId();
        UserPreference pref = service.getPreferences(userId);
        return Response.ok(UserPreferenceDTO.fromDomain(pref)).build();
    }

    @PUT
    @Authenticated
    public Response updatePreferences(UserPreferenceDTO dto) {
        String userId = securityUtils.getCurrentUserId();
        UserPreference pref = service.updatePreferences(userId, dto.theme(), dto.language());
        return Response.ok(UserPreferenceDTO.fromDomain(pref)).build();
    }
}
