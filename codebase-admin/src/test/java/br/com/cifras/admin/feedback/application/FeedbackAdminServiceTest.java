package br.com.cifras.admin.feedback.application;

import br.com.cifras.admin.feedback.dto.FeedbackDTO;
import br.com.cifras.admin.feedback.infra.persistence.entity.FeedbackEntity;
import br.com.cifras.admin.feedback.infra.persistence.repository.FeedbackAdminRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.Mockito;
import java.time.Instant;
import java.util.List;
import java.util.UUID;
import io.quarkus.hibernate.orm.panache.PanacheQuery;
import io.quarkus.test.junit.QuarkusTest;
import io.quarkus.test.InjectMock;
import jakarta.inject.Inject;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;

@QuarkusTest
class FeedbackAdminServiceTest {

    @Inject
    FeedbackAdminService service;

    @InjectMock
    FeedbackAdminRepository repository;

    @Test
    void testListAllFeedbacks() {
        FeedbackEntity entity = new FeedbackEntity();
        entity.id = UUID.randomUUID();
        entity.userId = "user1";
        entity.message = "msg";
        entity.status = "PENDING";
        entity.createdAt = Instant.now();
        entity.updatedAt = Instant.now();

        when(repository.findAllSorted()).thenReturn(List.of(entity));

        List<FeedbackDTO> result = service.listAllFeedbacks();
        assertEquals(1, result.size());
        assertEquals("msg", result.get(0).message());
    }

    @Test
    void testReplyToFeedbackFound() {
        UUID id = UUID.randomUUID();
        FeedbackEntity entity = new FeedbackEntity();
        entity.id = id;
        entity.status = "PENDING";

        when(repository.findById(id)).thenReturn(entity);

        boolean updated = service.replyToFeedback(id, "Thank you");
        assertTrue(updated);
        assertEquals("Thank you", entity.adminReply);
        assertEquals("REPLIED", entity.status);
    }

    @Test
    void testReplyToFeedbackNotFound() {
        UUID id = UUID.randomUUID();
        when(repository.findById(id)).thenReturn(null);

        boolean updated = service.replyToFeedback(id, "Thank you");
        assertFalse(updated);
    }
}
