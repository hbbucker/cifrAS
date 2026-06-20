package br.com.cifras.user.resource;

import br.com.cifras.user.model.UserPreference;
import br.com.cifras.user.resource.dto.UserPreferenceDTO;
import br.com.cifras.user.application.usecase.GetUserPreferenceUseCase;
import br.com.cifras.user.application.usecase.UpdateUserPreferenceUseCase;
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
    GetUserPreferenceUseCase getUserPreferenceUseCase;

    @Inject
    UpdateUserPreferenceUseCase updateUserPreferenceUseCase;

    @jakarta.ws.rs.core.Context
    jakarta.ws.rs.core.HttpHeaders headers;

    @GET
    @Authenticated
    public Response getPreferences() {
        String userId = securityUtils.getCurrentUserId();
        
        br.com.cifras.user.model.Language defaultLanguage = br.com.cifras.user.model.Language.PT_BR;
        try {
            java.util.List<java.util.Locale> locales = headers.getAcceptableLanguages();
            if (locales != null && !locales.isEmpty()) {
                for (java.util.Locale locale : locales) {
                    String tag = locale.toLanguageTag();
                    try {
                        defaultLanguage = br.com.cifras.user.model.Language.fromString(tag);
                        break;
                    } catch (IllegalArgumentException e) {
                        try {
                            defaultLanguage = br.com.cifras.user.model.Language.fromString(locale.getLanguage());
                            break;
                        } catch (IllegalArgumentException ex) {
                            // continue searching
                        }
                    }
                }
            }
        } catch (Exception e) {
            // Keep default PT_BR on failure
        }

        UserPreference pref = getUserPreferenceUseCase.execute(userId, defaultLanguage);
        return Response.ok(UserPreferenceDTO.fromDomain(pref)).build();
    }

    @PUT
    @Authenticated
    public Response updatePreferences(UserPreferenceDTO dto) {
        String userId = securityUtils.getCurrentUserId();
        UserPreference pref = updateUserPreferenceUseCase.execute(userId, dto.theme(), dto.language());
        return Response.ok(UserPreferenceDTO.fromDomain(pref)).build();
    }
}
