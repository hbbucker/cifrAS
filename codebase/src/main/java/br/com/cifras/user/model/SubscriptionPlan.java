package br.com.cifras.user.model;

import io.quarkus.runtime.annotations.RegisterForReflection;

@RegisterForReflection
public enum SubscriptionPlan {
    FREE,
    PRO
}
