package br.com.cifras.shared.security;

import io.quarkus.security.identity.SecurityIdentity;
import jakarta.enterprise.context.RequestScoped;
import jakarta.inject.Inject;
import org.eclipse.microprofile.jwt.JsonWebToken;

/**
 * Utility bean to extract security context info from the current request.
 * Provides userId (sub claim) to service and resource layers.
 */
@RequestScoped
public class SecurityUtils {

    @Inject
    JsonWebToken jwt;

    @Inject
    SecurityIdentity securityIdentity;

    /**
     * Returns the authenticated user ID (Supabase Auth UUID from "sub" claim).
     * @throws IllegalStateException if called outside an authenticated context
     */
    public String getCurrentUserId() {
        if (jwt == null || jwt.getSubject() == null) {
            throw new IllegalStateException("No authenticated user in current context");
        }
        return jwt.getSubject();
    }

    public boolean isAuthenticated() {
        return !securityIdentity.isAnonymous();
    }
}
