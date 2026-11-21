package br.com.cifras.user.application;

import br.com.cifras.shared.exception.QuotaExceededException;
import br.com.cifras.user.infra.persistence.entity.UserSubscriptionEntity;
import br.com.cifras.user.infra.persistence.repository.UserSubscriptionRepository;
import br.com.cifras.user.model.SubscriptionPlan;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import jakarta.persistence.EntityManager;

import java.time.OffsetDateTime;
import java.util.UUID;

@ApplicationScoped
public class QuotaService {

    @Inject
    UserSubscriptionRepository subscriptionRepository;

    @Inject
    EntityManager em;

    public SubscriptionPlan getUserPlan(String userId) {
        return subscriptionRepository.findByUserId(userId)
                .filter(sub -> sub.activeUntil == null || sub.activeUntil.isAfter(OffsetDateTime.now()))
                .map(sub -> sub.planType)
                .orElse(SubscriptionPlan.FREE);
    }

    public void checkSongQuota(String userId) {
        if (getUserPlan(userId) == SubscriptionPlan.PRO) {
            return;
        }
        
        long count = ((Number) em.createQuery("SELECT count(s) FROM SongEntity s WHERE s.userId = :userId AND s.deletedAt IS NULL")
                .setParameter("userId", userId)
                .getSingleResult()).longValue();
                
        if (count >= 10) {
            throw new QuotaExceededException("You have reached the maximum number of songs (10) for the FREE plan.");
        }
    }

    public void checkPlaylistQuota(String userId) {
        if (getUserPlan(userId) == SubscriptionPlan.PRO) {
            return;
        }

        long count = ((Number) em.createQuery("SELECT count(p) FROM PlaylistEntity p WHERE p.userId = :userId AND p.deletedAt IS NULL")
                .setParameter("userId", userId)
                .getSingleResult()).longValue();

        if (count >= 1) {
            throw new QuotaExceededException("You have reached the maximum number of playlists (1) for the FREE plan.");
        }
    }

    public void checkGroupQuota(String userId) {
        if (getUserPlan(userId) == SubscriptionPlan.PRO) {
            return;
        }

        // For Groups, we check how many groups the user owns.
        long count = ((Number) em.createQuery("SELECT count(gm) FROM GroupMemberEntity gm WHERE gm.userId = :userId AND gm.role = 'OWNER'")
                .setParameter("userId", userId)
                .getSingleResult()).longValue();

        if (count >= 1) {
            throw new QuotaExceededException("You have reached the maximum number of groups (1) for the FREE plan.");
        }
    }

    public void checkGroupMemberQuota(UUID groupId) {
        String ownerId = (String) em.createQuery("SELECT gm.userId FROM GroupMemberEntity gm WHERE gm.group.id = :groupId AND gm.role = 'OWNER'")
                .setParameter("groupId", groupId)
                .getSingleResult();

        if (getUserPlan(ownerId) == SubscriptionPlan.PRO) {
            return;
        }

        long count = ((Number) em.createQuery("SELECT count(gm) FROM GroupMemberEntity gm WHERE gm.group.id = :groupId")
                .setParameter("groupId", groupId)
                .getSingleResult()).longValue();

        if (count >= 3) {
            throw new QuotaExceededException("This group has reached the maximum number of members (3) for the FREE plan.");
        }
    }
}
