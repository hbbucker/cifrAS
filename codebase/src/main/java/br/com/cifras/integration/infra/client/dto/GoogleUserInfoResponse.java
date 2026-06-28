package br.com.cifras.integration.infra.client.dto;

import io.quarkus.runtime.annotations.RegisterForReflection;

/**
 * Response DTO for Google UserInfo endpoint.
 * Maps to the JSON body returned by {@code https://www.googleapis.com/oauth2/v2/userinfo}.
 */
@RegisterForReflection
public record GoogleUserInfoResponse(
        String email,
        String name
) {}
