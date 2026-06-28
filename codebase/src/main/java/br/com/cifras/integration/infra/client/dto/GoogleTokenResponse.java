package br.com.cifras.integration.infra.client.dto;

import io.quarkus.runtime.annotations.RegisterForReflection;

import com.fasterxml.jackson.annotation.JsonProperty;

/**
 * Response DTO for Google OAuth2 token endpoint.
 * Maps to the JSON body returned by {@code https://oauth2.googleapis.com/token}.
 */
@RegisterForReflection
public record GoogleTokenResponse(
        @JsonProperty("access_token") String accessToken,
        @JsonProperty("refresh_token") String refreshToken,
        @JsonProperty("token_type") String tokenType,
        @JsonProperty("expires_in") Long expiresIn
) {}
