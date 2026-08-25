package br.com.cifras.shared.security;

import br.com.cifras.shared.exception.AccountBlockedException;
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
 * validated by MicroProfile JWT (SmallRye). Also checks if the user is suspended/blocked.
 */
@Provider
@ApplicationScoped
public class JwtValidationFilter implements ContainerRequestFilter {

    @Inject
    JsonWebToken jwt;

    @Inject
    SecurityIdentity securityIdentity;

    @Inject
    UserService userService;

    @Override
    public void filter(ContainerRequestContext requestContext) throws IOException {
        if (securityIdentity != null && !securityIdentity.isAnonymous() && securityIdentity.getPrincipal() != null) {
            String userId = null;
            if (securityIdentity.getPrincipal() instanceof JsonWebToken jwtPrincipal && jwtPrincipal.getSubject() != null) {
                userId = jwtPrincipal.getSubject();
            } else {
                userId = securityIdentity.getPrincipal().getName();
            }

            if (userId != null && userService.isUserBlocked(userId)) {
                throw new AccountBlockedException();
            }
        }
    }
}
