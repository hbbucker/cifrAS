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
     * Returns the authenticated user ID (Supabase Auth UUID from "sub" claim, or test user name).
     * Uses SecurityIdentity.getPrincipal().getName() which works with both real JWTs and @TestSecurity.
     *
     * @throws IllegalStateException if called outside an authenticated context
     */
    public String getCurrentUserId() {
        if (securityIdentity.isAnonymous()) {
            throw new IllegalStateException("No authenticated user in current context");
        }
        if (jwt != null && jwt.getSubject() != null) {
            return jwt.getSubject();
        }
        return securityIdentity.getPrincipal().getName();
    }

    public boolean isAuthenticated() {
        return !securityIdentity.isAnonymous();
    }

    /**
     * Returns the email from the JWT claims, if present.
     */
    public String getCurrentUserEmail() {
        if (jwt != null && jwt.containsClaim("email")) {
            return jwt.getClaim("email");
        }
        return null;
    }
}
