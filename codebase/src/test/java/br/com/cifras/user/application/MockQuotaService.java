package br.com.cifras.user.application;

import br.com.cifras.user.model.SubscriptionPlan;
import io.quarkus.test.Mock;
import jakarta.enterprise.context.ApplicationScoped;

import java.util.UUID;

@Mock
@ApplicationScoped
public class MockQuotaService extends QuotaService {

    public static boolean bypass = true;

    @Override
    public SubscriptionPlan getUserPlan(String userId) {
        if (!bypass) {
            return super.getUserPlan(userId);
        }
        if ("user-free".equals(userId)) {
            return SubscriptionPlan.FREE;
        }
        return SubscriptionPlan.PRO;
    }

    @Override
    public void checkSongQuota(String userId) {
        if (!bypass) {
            super.checkSongQuota(userId);
            return;
        }
        if ("user-free".equals(userId)) {
            super.checkSongQuota(userId);
        }
    }

    @Override
    public void checkPlaylistQuota(String userId) {
        if (!bypass) {
            super.checkPlaylistQuota(userId);
            return;
        }
        if ("user-free".equals(userId)) {
            super.checkPlaylistQuota(userId);
        }
    }

    @Override
    public void checkGroupQuota(String userId) {
        if (!bypass) {
            super.checkGroupQuota(userId);
            return;
        }
        if ("user-free".equals(userId)) {
            super.checkGroupQuota(userId);
        }
    }

    @Override
    public void checkGroupMemberQuota(UUID groupId) {
        if (!bypass) {
            super.checkGroupMemberQuota(groupId);
        }
    }
}
