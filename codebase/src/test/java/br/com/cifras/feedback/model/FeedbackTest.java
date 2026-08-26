package br.com.cifras.feedback.model;

import org.junit.jupiter.api.Test;
import java.time.Instant;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;

class FeedbackTest {

    @Test
    void testFeedbackGettersAndSetters() {
        Feedback feedback = new Feedback();
        UUID id = UUID.randomUUID();
        Instant now = Instant.now();

        feedback.setId(id);
        feedback.setUserId("user1");
        feedback.setMessage("msg");
        feedback.setStatus(FeedbackStatus.PENDING);
        feedback.setAdminReply("reply");
        feedback.setCreatedAt(now);
        feedback.setUpdatedAt(now);

        assertEquals(id, feedback.getId());
        assertEquals("user1", feedback.getUserId());
        assertEquals("msg", feedback.getMessage());
        assertEquals(FeedbackStatus.PENDING, feedback.getStatus());
        assertEquals("reply", feedback.getAdminReply());
        assertEquals(now, feedback.getCreatedAt());
        assertEquals(now, feedback.getUpdatedAt());
    }

    @Test
    void testEqualsAndHashCode() {
        Feedback f1 = new Feedback();
        UUID id = UUID.randomUUID();
        f1.setId(id);

        Feedback f2 = new Feedback();
        f2.setId(id);

        Feedback f3 = new Feedback();
        f3.setId(UUID.randomUUID());

        assertEquals(f1, f1);
        assertEquals(f1, f2);
        assertNotEquals(f1, f3);
        assertNotEquals(f1, null);
        assertNotEquals(f1, new Object());
        assertEquals(f1.hashCode(), f2.hashCode());
    }
}
