package br.com.cifras.user.resource;

import br.com.cifras.user.infra.persistence.entity.UserSubscriptionEntity;
import br.com.cifras.user.infra.persistence.repository.UserSubscriptionRepository;
import br.com.cifras.user.model.SubscriptionPlan;
import jakarta.inject.Inject;
import jakarta.transaction.Transactional;
import jakarta.ws.rs.Consumes;
import jakarta.ws.rs.POST;
import jakarta.ws.rs.Path;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;
import org.jboss.logging.Logger;

import java.time.OffsetDateTime;
import java.util.Map;
import java.util.Optional;

@Path("/webhooks/stripe")
public class StripeWebhookResource {

    private static final Logger LOG = Logger.getLogger(StripeWebhookResource.class);

    @Inject
    UserSubscriptionRepository subscriptionRepository;

    @POST
    @Consumes(MediaType.APPLICATION_JSON)
    @Transactional
    public Response handleWebhook(Map<String, Object> payload) {
        LOG.info("Received Stripe Webhook: " + payload);
        
        try {
            String type = (String) payload.get("type");
            
            if ("checkout.session.completed".equals(type)) {
                Map<String, Object> data = (Map<String, Object>) payload.get("data");
                if (data != null) {
                    Map<String, Object> object = (Map<String, Object>) data.get("object");
                    if (object != null) {
                        String clientReferenceId = (String) object.get("client_reference_id");
                        
                        if (clientReferenceId != null) {
                            LOG.info("Upgrading user to PRO: " + clientReferenceId);
                            upgradeUserToPro(clientReferenceId);
                        }
                    }
                }
            }
            
            return Response.ok().build();
        } catch (Exception e) {
            LOG.error("Error processing webhook", e);
            return Response.status(Response.Status.BAD_REQUEST).build();
        }
    }

    private void upgradeUserToPro(String userId) {
        Optional<UserSubscriptionEntity> subOpt = subscriptionRepository.findByUserId(userId);
        UserSubscriptionEntity sub;
        
        if (subOpt.isPresent()) {
            sub = subOpt.get();
        } else {
            sub = new UserSubscriptionEntity();
            sub.userId = userId;
        }
        
        sub.planType = SubscriptionPlan.PRO;
        // e.g. 1 month from now, or infinite if lifetime
        sub.activeUntil = OffsetDateTime.now().plusMonths(1);
        
        subscriptionRepository.persist(sub);
    }
}
