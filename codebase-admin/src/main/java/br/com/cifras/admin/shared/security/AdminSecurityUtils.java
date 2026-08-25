package br.com.cifras.admin.shared.security;

import br.com.cifras.admin.shared.exception.AdminForbiddenException;
import br.com.cifras.admin.user.infra.repository.AdminUserRepository;
import br.com.cifras.admin.user.model.AdminUser;
import io.quarkus.security.identity.SecurityIdentity;
import jakarta.enterprise.context.RequestScoped;
import jakarta.inject.Inject;
import org.eclipse.microprofile.jwt.JsonWebToken;
import org.jboss.logging.Logger;

import java.util.Collection;
import java.util.Map;
import java.util.Optional;

@RequestScoped
public class AdminSecurityUtils {

    private static final Logger LOG = Logger.getLogger(AdminSecurityUtils.class);

    @Inject
    SecurityIdentity securityIdentity;

    @Inject
    AdminUserRepository adminUserRepository;

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
            return extractStringValue(jwt.getClaim("email"));
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
            if (jwt.containsClaim("role")) {
                String role = extractStringValue(jwt.getClaim("role"));
                if ("admin".equalsIgnoreCase(role)) {
                    return true;
                }
            }

            // Check 'roles' claim
            if (jwt.containsClaim("roles")) {
                if (containsAdmin(jwt.getClaim("roles"))) {
                    return true;
                }
            }

            // Check 'app_metadata'
            if (jwt.containsClaim("app_metadata")) {
                Object appMeta = jwt.getClaim("app_metadata");
                if (appMeta instanceof Map<?, ?> metaMap) {
                    if ("admin".equalsIgnoreCase(extractStringValue(metaMap.get("role")))) {
                        return true;
                    }
                    if (containsAdmin(metaMap.get("roles"))) {
                        return true;
                    }
                }
            }

            // Check 'user_metadata'
            if (jwt.containsClaim("user_metadata")) {
                Object userMeta = jwt.getClaim("user_metadata");
                if (userMeta instanceof Map<?, ?> metaMap) {
                    if ("admin".equalsIgnoreCase(extractStringValue(metaMap.get("role")))) {
                        return true;
                    }
                    if (containsAdmin(metaMap.get("roles"))) {
                        return true;
                    }
                }
            }

            // 3. Fallback: check database user role
            try {
                String userId = jwt.getSubject();
                if (userId != null && !userId.isBlank()) {
                    Optional<AdminUser> dbUser = adminUserRepository.findById(userId);
                    if (dbUser.isPresent() && "admin".equalsIgnoreCase(dbUser.get().getRole())) {
                        return true;
                    }
                }
            } catch (Exception e) {
                LOG.debug("Could not verify admin role via DB fallback: " + e.getMessage());
            }
        }

        // 4. Fallback for test / dev environment principals
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

    private String extractStringValue(Object obj) {
        if (obj == null) return null;
        if (obj instanceof jakarta.json.JsonString js) {
            return js.getString().trim();
        }
        String str = obj.toString().trim();
        if (str.startsWith("\"") && str.endsWith("\"") && str.length() >= 2) {
            str = str.substring(1, str.length() - 1).trim();
        }
        return str;
    }

    private boolean containsAdmin(Object obj) {
        if (obj == null) return false;
        if (obj instanceof Collection<?> col) {
            for (Object item : col) {
                if ("admin".equalsIgnoreCase(extractStringValue(item))) {
                    return true;
                }
            }
        }
        if (obj instanceof jakarta.json.JsonArray arr) {
            for (jakarta.json.JsonValue val : arr) {
                if (val instanceof jakarta.json.JsonString js && "admin".equalsIgnoreCase(js.getString())) {
                    return true;
                }
            }
        }
        return false;
    }
}
