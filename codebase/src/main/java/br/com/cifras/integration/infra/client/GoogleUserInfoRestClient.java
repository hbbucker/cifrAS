package br.com.cifras.integration.infra.client;

import br.com.cifras.integration.infra.client.dto.GoogleUserInfoResponse;
import jakarta.ws.rs.GET;
import jakarta.ws.rs.HeaderParam;
import jakarta.ws.rs.Path;
import org.eclipse.microprofile.rest.client.inject.RegisterRestClient;

/**
 * MicroProfile REST Client for the Google UserInfo endpoint.
 * <p>
 * Config key: {@code google-userinfo}
 * Base URL is configured via {@code quarkus.rest-client.google-userinfo.url}.
 */
@RegisterRestClient(configKey = "google-userinfo")
@Path("/oauth2/v2/userinfo")
public interface GoogleUserInfoRestClient {

    /**
     * Retrieves the profile of the authenticated Google user.
     *
     * @param bearerToken the {@code Authorization} header value, e.g. {@code "Bearer <access_token>"}
     */
    @GET
    GoogleUserInfoResponse getUserInfo(
            @HeaderParam("Authorization") String bearerToken
    );
}
