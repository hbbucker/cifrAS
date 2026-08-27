package br.com.cifras.admin.feedback.infra.persistence.entity;

import org.junit.jupiter.api.Test;
import java.time.Instant;
import io.quarkus.test.junit.QuarkusTest;
import static org.junit.jupiter.api.Assertions.*;

@QuarkusTest
class FeedbackEntityTest {

    @Test
    void testPrePersistAndUpdate() throws InterruptedException {
        FeedbackEntity entity = new FeedbackEntity();
        assertNull(entity.createdAt);
        assertNull(entity.updatedAt);
        
        entity.prePersist();
        assertNotNull(entity.createdAt);
        assertNotNull(entity.updatedAt);

        Instant oldUpdated = entity.updatedAt;
        Thread.sleep(1);
        entity.preUpdate();
        assertNotNull(entity.updatedAt);
        assertTrue(entity.updatedAt.isAfter(oldUpdated));
    }
}
