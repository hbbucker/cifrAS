package br.com.cifras.user.infra.persistence.entity;

import br.com.cifras.user.model.SubscriptionPlan;
import jakarta.persistence.*;
import java.time.OffsetDateTime;
import java.util.UUID;

@Entity
@Table(name = "user_subscriptions")
public class UserSubscriptionEntity {

    @Id
    public UUID id;

    @Column(name = "user_id", nullable = false, unique = true)
    public String userId;

    @Enumerated(EnumType.STRING)
    @Column(name = "plan_type", nullable = false)
    public SubscriptionPlan planType;

    @Column(name = "active_until")
    public OffsetDateTime activeUntil;

    @Column(name = "stripe_customer_id")
    public String stripeCustomerId;

    @Column(name = "coupon_code")
    public String couponCode;

    @Column(name = "created_at", nullable = false, updatable = false)
    public OffsetDateTime createdAt;

    @Column(name = "updated_at", nullable = false)
    public OffsetDateTime updatedAt;

    @PrePersist
    public void prePersist() {
        if (id == null) {
            id = UUID.randomUUID();
        }
        if (planType == null) {
            planType = SubscriptionPlan.FREE;
        }
        createdAt = OffsetDateTime.now();
        updatedAt = createdAt;
    }

    @PreUpdate
    public void preUpdate() {
        updatedAt = OffsetDateTime.now();
    }
}
