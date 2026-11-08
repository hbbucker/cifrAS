package br.com.cifras.user.application;

import br.com.cifras.shared.exception.QuotaExceededException;
import br.com.cifras.user.infra.persistence.entity.UserSubscriptionEntity;
import br.com.cifras.user.infra.persistence.repository.UserSubscriptionRepository;
import br.com.cifras.user.model.SubscriptionPlan;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.Mockito;
import jakarta.persistence.EntityManager;
import jakarta.persistence.Query;

import java.time.OffsetDateTime;
import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.when;
import static org.mockito.ArgumentMatchers.eq;

public class QuotaServiceTest {

    private QuotaService quotaService;
    private UserSubscriptionRepository subscriptionRepository;
    private EntityManager em;

    @BeforeEach
    public void setup() {
        quotaService = new QuotaService();
        subscriptionRepository = Mockito.mock(UserSubscriptionRepository.class);
        em = Mockito.mock(EntityManager.class);
        
        quotaService.subscriptionRepository = subscriptionRepository;
        quotaService.em = em;
    }

    @Test
    public void testGetUserPlan_NoSubscription() {
        when(subscriptionRepository.findByUserId("user1")).thenReturn(Optional.empty());
        assertEquals(SubscriptionPlan.FREE, quotaService.getUserPlan("user1"));
    }

    @Test
    public void testGetUserPlan_ProActive() {
        UserSubscriptionEntity sub = new UserSubscriptionEntity();
        sub.planType = SubscriptionPlan.PRO;
        sub.activeUntil = OffsetDateTime.now().plusDays(30);
        when(subscriptionRepository.findByUserId("user2")).thenReturn(Optional.of(sub));
        
        assertEquals(SubscriptionPlan.PRO, quotaService.getUserPlan("user2"));
    }

    @Test
    public void testGetUserPlan_ProExpired() {
        UserSubscriptionEntity sub = new UserSubscriptionEntity();
        sub.planType = SubscriptionPlan.PRO;
        sub.activeUntil = OffsetDateTime.now().minusDays(1);
        when(subscriptionRepository.findByUserId("user3")).thenReturn(Optional.of(sub));
        
        assertEquals(SubscriptionPlan.FREE, quotaService.getUserPlan("user3"));
    }

    @Test
    public void testCheckSongQuota_ProUser() {
        UserSubscriptionEntity sub = new UserSubscriptionEntity();
        sub.planType = SubscriptionPlan.PRO;
        when(subscriptionRepository.findByUserId("user1")).thenReturn(Optional.of(sub));
        
        assertDoesNotThrow(() -> quotaService.checkSongQuota("user1"));
    }

    @Test
    public void testCheckSongQuota_FreeUser_UnderQuota() {
        when(subscriptionRepository.findByUserId("user1")).thenReturn(Optional.empty());
        
        Query query = Mockito.mock(Query.class);
        when(em.createQuery(anyString())).thenReturn(query);
        when(query.setParameter(eq("userId"), eq("user1"))).thenReturn(query);
        when(query.getSingleResult()).thenReturn(9L);
        
        assertDoesNotThrow(() -> quotaService.checkSongQuota("user1"));
    }

    @Test
    public void testCheckSongQuota_FreeUser_OverQuota() {
        when(subscriptionRepository.findByUserId("user1")).thenReturn(Optional.empty());
        
        Query query = Mockito.mock(Query.class);
        when(em.createQuery(anyString())).thenReturn(query);
        when(query.setParameter(eq("userId"), eq("user1"))).thenReturn(query);
        when(query.getSingleResult()).thenReturn(10L);
        
        assertThrows(QuotaExceededException.class, () -> quotaService.checkSongQuota("user1"));
    }

    @Test
    public void testCheckPlaylistQuota_FreeUser_UnderQuota() {
        when(subscriptionRepository.findByUserId("user1")).thenReturn(Optional.empty());
        
        Query query = Mockito.mock(Query.class);
        when(em.createQuery(anyString())).thenReturn(query);
        when(query.setParameter(eq("userId"), eq("user1"))).thenReturn(query);
        when(query.getSingleResult()).thenReturn(0L);
        
        assertDoesNotThrow(() -> quotaService.checkPlaylistQuota("user1"));
    }

    @Test
    public void testCheckPlaylistQuota_FreeUser_OverQuota() {
        when(subscriptionRepository.findByUserId("user1")).thenReturn(Optional.empty());
        
        Query query = Mockito.mock(Query.class);
        when(em.createQuery(anyString())).thenReturn(query);
        when(query.setParameter(eq("userId"), eq("user1"))).thenReturn(query);
        when(query.getSingleResult()).thenReturn(1L);
        
        assertThrows(QuotaExceededException.class, () -> quotaService.checkPlaylistQuota("user1"));
    }
    
    @Test
    public void testCheckGroupQuota_FreeUser_OverQuota() {
        when(subscriptionRepository.findByUserId("user1")).thenReturn(Optional.empty());
        
        Query query = Mockito.mock(Query.class);
        when(em.createQuery(anyString())).thenReturn(query);
        when(query.setParameter(eq("userId"), eq("user1"))).thenReturn(query);
        when(query.getSingleResult()).thenReturn(1L);
        
        assertThrows(QuotaExceededException.class, () -> quotaService.checkGroupQuota("user1"));
    }

    @Test
    public void testCheckGroupMemberQuota_FreeUser_OverQuota() {
        UUID groupId = UUID.randomUUID();
        when(subscriptionRepository.findByUserId("user1")).thenReturn(Optional.empty());
        
        Query queryOwner = Mockito.mock(Query.class);
        when(em.createQuery(eq("SELECT gm.userId FROM GroupMemberEntity gm WHERE gm.group.id = :groupId AND gm.role = 'OWNER'"))).thenReturn(queryOwner);
        when(queryOwner.setParameter(eq("groupId"), eq(groupId))).thenReturn(queryOwner);
        when(queryOwner.getSingleResult()).thenReturn("user1");

        Query queryCount = Mockito.mock(Query.class);
        when(em.createQuery(eq("SELECT count(gm) FROM GroupMemberEntity gm WHERE gm.group.id = :groupId"))).thenReturn(queryCount);
        when(queryCount.setParameter(eq("groupId"), eq(groupId))).thenReturn(queryCount);
        when(queryCount.getSingleResult()).thenReturn(3L);
        
        assertThrows(QuotaExceededException.class, () -> quotaService.checkGroupMemberQuota(groupId));
    }
}
