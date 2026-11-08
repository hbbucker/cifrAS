package br.com.cifras.user.resource.dto;

import br.com.cifras.user.model.SubscriptionPlan;
import io.quarkus.runtime.annotations.RegisterForReflection;

@RegisterForReflection
public record SubscriptionDTO(SubscriptionPlan plan) {
}
