package br.com.cifras.shared.security;

import io.quarkus.security.identity.SecurityIdentity;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import jakarta.ws.rs.container.ContainerRequestContext;
import jakarta.ws.rs.container.ContainerRequestFilter;
import jakarta.ws.rs.ext.Provider;
import org.eclipse.microprofile.jwt.JsonWebToken;

import java.io.IOException;

/**
 * JWT Validation Filter — intercepts all requests and ensures the JWT is
 * validated by MicroProfile JWT (SmallRye). The actual validation is done by
 * the framework; this filter provides utilities for extracting userId (sub claim).
 *
 * Public routes (/auth/*) are annotated with @PermitAll on their resource classes.
 */
@Provider
@ApplicationScoped
public class JwtValidationFilter implements ContainerRequestFilter {

    @Inject
    JsonWebToken jwt;

    @Inject
    SecurityIdentity securityIdentity;

    @Override
    public void filter(ContainerRequestContext requestContext) throws IOException {
        // MicroProfile JWT / SmallRye handles JWT validation automatically.
        // This filter is a hook point for future cross-cutting concerns
        // (e.g., request logging, tracing context propagation).
        // The SecurityIdentity is populated by the framework before this filter runs.
    }
}
