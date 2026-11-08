package br.com.cifras.admin.user.application;

import br.com.cifras.admin.user.dto.AdminUserDTO;
import br.com.cifras.admin.user.infra.mapper.AdminUserMapper;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import jakarta.persistence.EntityManager;
import jakarta.transaction.Transactional;
import java.util.UUID;

@ApplicationScoped
public class BypassSubscriptionUseCase {

    @Inject
    EntityManager em;

    @Inject
    GetAdminUserUseCase getAdminUserUseCase;

    @Transactional
    public AdminUserDTO execute(String userId, String couponCode) {
        // Native query to upsert the subscription
        String sql = "INSERT INTO user_subscriptions (id, user_id, plan_type, active_until, created_at, updated_at, coupon_code) " +
                     "VALUES (:id, :userId, 'PRO', NOW() + INTERVAL '100 years', NOW(), NOW(), :couponCode) " +
                     "ON CONFLICT (user_id) DO UPDATE SET plan_type = 'PRO', active_until = NOW() + INTERVAL '100 years', updated_at = NOW(), coupon_code = :couponCode";
        
        em.createNativeQuery(sql)
          .setParameter("id", UUID.randomUUID())
          .setParameter("userId", userId)
          .setParameter("couponCode", couponCode)
          .executeUpdate();
          
        return getAdminUserUseCase.execute(userId);
    }
}
