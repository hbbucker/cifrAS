package br.com.cifras.user.resource;

import br.com.cifras.user.application.QuotaService;
import br.com.cifras.user.model.SubscriptionPlan;
import br.com.cifras.user.resource.dto.SubscriptionDTO;
import io.quarkus.security.Authenticated;
import jakarta.inject.Inject;
import jakarta.ws.rs.GET;
import jakarta.ws.rs.Path;
import jakarta.ws.rs.Produces;
import jakarta.ws.rs.core.MediaType;
import org.eclipse.microprofile.jwt.JsonWebToken;

@Path("/users/me/subscription")
@Authenticated
@Produces(MediaType.APPLICATION_JSON)
public class UserSubscriptionResource {

    @Inject
    JsonWebToken jwt;

    @Inject
    QuotaService quotaService;

    @GET
    public SubscriptionDTO getCurrentUserSubscription() {
        String userId = jwt.getSubject();
        SubscriptionPlan plan = quotaService.getUserPlan(userId);
        return new SubscriptionDTO(plan);
    }
}
