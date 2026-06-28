package br.com.cifras.integration.infra.client;

import br.com.cifras.integration.infra.client.dto.GoogleTokenResponse;
import jakarta.ws.rs.Consumes;
import jakarta.ws.rs.FormParam;
import jakarta.ws.rs.POST;
import jakarta.ws.rs.Path;
import jakarta.ws.rs.core.MediaType;
import org.eclipse.microprofile.rest.client.inject.RegisterRestClient;

/**
 * MicroProfile REST Client for the Google OAuth2 token endpoint.
 * <p>
 * Config key: {@code google-oauth}
 * Base URL is configured via {@code quarkus.rest-client.google-oauth.url}.
 */
@RegisterRestClient(configKey = "google-oauth")
@Path("/")
public interface GoogleOAuthRestClient {

    /**
     * Exchanges an authorization code for access and refresh tokens.
     */
    @POST
    @Path("/token")
    @Consumes(MediaType.APPLICATION_FORM_URLENCODED)
    GoogleTokenResponse exchangeCode(
            @FormParam("code") String code,
            @FormParam("client_id") String clientId,
            @FormParam("client_secret") String clientSecret,
            @FormParam("redirect_uri") String redirectUri,
            @FormParam("grant_type") String grantType
    );

    /**
     * Refreshes a short-lived access token using a long-lived refresh token.
     */
    @POST
    @Path("/token")
    @Consumes(MediaType.APPLICATION_FORM_URLENCODED)
    GoogleTokenResponse refreshToken(
            @FormParam("refresh_token") String refreshToken,
            @FormParam("client_id") String clientId,
            @FormParam("client_secret") String clientSecret,
            @FormParam("grant_type") String grantType
    );
}
