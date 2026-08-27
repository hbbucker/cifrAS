package br.com.cifras.admin.feedback.dto;

import org.junit.jupiter.api.Test;
import java.time.Instant;
import java.util.UUID;
import io.quarkus.test.junit.QuarkusTest;
import static org.junit.jupiter.api.Assertions.*;

@QuarkusTest
class FeedbackDTOTest {

    @Test
    void testRecord() {
        UUID id = UUID.randomUUID();
        Instant now = Instant.now();
        FeedbackDTO dto1 = new FeedbackDTO(id, "u1", "msg", "PENDING", null, now, now);
        FeedbackDTO dto2 = new FeedbackDTO(id, "u1", "msg", "PENDING", null, now, now);
        FeedbackDTO dto3 = new FeedbackDTO(UUID.randomUUID(), "u2", "msg2", "REPLIED", "rep", now, now);

        assertEquals(dto1, dto2);
        assertNotEquals(dto1, dto3);
        assertEquals(dto1.hashCode(), dto2.hashCode());
        assertNotNull(dto1.toString());
        
        assertEquals(id, dto1.id());
        assertEquals("u1", dto1.userId());
        assertEquals("msg", dto1.message());
        assertEquals("PENDING", dto1.status());
        assertNull(dto1.adminReply());
        assertEquals(now, dto1.createdAt());
        assertEquals(now, dto1.updatedAt());
    }

    @Test
    void testFeedbackReplyDTO() {
        FeedbackReplyDTO dto1 = new FeedbackReplyDTO("reply");
        FeedbackReplyDTO dto2 = new FeedbackReplyDTO("reply");
        FeedbackReplyDTO dto3 = new FeedbackReplyDTO("reply2");

        assertEquals(dto1, dto2);
        assertNotEquals(dto1, dto3);
        assertEquals(dto1.hashCode(), dto2.hashCode());
        assertNotNull(dto1.toString());
        assertEquals("reply", dto1.replyMessage());
    }
}
