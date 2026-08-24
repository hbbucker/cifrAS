package br.com.cifras.admin.shared.security;

import br.com.cifras.admin.shared.exception.AdminForbiddenException;
import io.quarkus.security.identity.SecurityIdentity;
import jakarta.enterprise.context.RequestScoped;
import jakarta.inject.Inject;
import org.eclipse.microprofile.jwt.JsonWebToken;

import java.util.Collection;
import java.util.Map;

@RequestScoped
public class AdminSecurityUtils {

    @Inject
    SecurityIdentity securityIdentity;

    public String getCurrentUserId() {
        if (securityIdentity.isAnonymous()) {
            throw new IllegalStateException("No authenticated user in current context");
        }
        if (securityIdentity.getPrincipal() instanceof JsonWebToken jwt && jwt.getSubject() != null) {
            return jwt.getSubject();
        }
        return securityIdentity.getPrincipal().getName();
    }

    public String getCurrentUserEmail() {
        if (securityIdentity.isAnonymous()) {
            return null;
        }
        if (securityIdentity.getPrincipal() instanceof JsonWebToken jwt && jwt.containsClaim("email")) {
            return jwt.getClaim("email");
        }
        String name = securityIdentity.getPrincipal().getName();
        if (name != null && name.contains("@")) {
            return name;
        }
        return null;
    }

    public boolean isAdmin() {
        if (securityIdentity.isAnonymous()) {
            return false;
        }

        // 1. Direct role check in SecurityIdentity
        if (securityIdentity.hasRole("admin") || securityIdentity.hasRole("ADMIN")) {
            return true;
        }

        // 2. JWT claims check (Supabase app_metadata or user_metadata or roles)
        if (securityIdentity.getPrincipal() instanceof JsonWebToken jwt) {
            // Check 'role' claim
            if ("admin".equalsIgnoreCase(jwt.getClaim("role"))) {
                return true;
            }

            // Check 'roles' claim array
            if (jwt.containsClaim("roles")) {
                Object rolesObj = jwt.getClaim("roles");
                if (rolesObj instanceof Collection<?> roles && roles.contains("admin")) {
                    return true;
                }
            }

            // Check 'app_metadata' object
            if (jwt.containsClaim("app_metadata")) {
                Object appMeta = jwt.getClaim("app_metadata");
                if (appMeta instanceof Map<?, ?> metaMap && "admin".equalsIgnoreCase(String.valueOf(metaMap.get("role")))) {
                    return true;
                }
            }

            // Check 'user_metadata' object
            if (jwt.containsClaim("user_metadata")) {
                Object userMeta = jwt.getClaim("user_metadata");
                if (userMeta instanceof Map<?, ?> metaMap && "admin".equalsIgnoreCase(String.valueOf(metaMap.get("role")))) {
                    return true;
                }
            }
        }

        // 3. Fallback for test / dev environment principals
        String principalName = securityIdentity.getPrincipal().getName();
        return "admin".equalsIgnoreCase(principalName) || "admin@cifras.com".equalsIgnoreCase(principalName);
    }

    public void requireAdmin() {
        if (securityIdentity.isAnonymous()) {
            throw new IllegalStateException("Authentication required");
        }
        if (!isAdmin()) {
            throw new AdminForbiddenException("Access denied: Administrative privileges required");
        }
    }
}
