package br.com.cifras.user.resource;

import br.com.cifras.user.domain.UserPreference;
import br.com.cifras.shared.security.SecurityUtils;
import io.quarkus.security.Authenticated;
import jakarta.transaction.Transactional;
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

    @GET
    @Authenticated
    public Response getPreferences() {
        String userId = securityUtils.getCurrentUserId();
        UserPreference pref = UserPreference.findByUserId(userId);
        if (pref == null) {
            pref = new UserPreference();
            pref.userId = userId;
            pref.theme = "light";
        }
        return Response.ok(pref).build();
    }

    @PUT
    @Authenticated
    @Transactional
    public Response updatePreferences(UserPreference newPref) {
        String userId = securityUtils.getCurrentUserId();
        UserPreference pref = UserPreference.findByUserId(userId);
        if (pref == null) {
            pref = new UserPreference();
            pref.userId = userId;
        }
        if (newPref.theme != null) {
            pref.theme = newPref.theme;
        }
        if (newPref.language != null) {
            pref.language = newPref.language;
        }
        pref.persist();
        return Response.ok(pref).build();
    }
}
