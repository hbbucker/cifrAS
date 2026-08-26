package br.com.cifras.feedback.application;

import br.com.cifras.feedback.infra.persistence.entity.FeedbackEntity;
import br.com.cifras.feedback.infra.persistence.repository.FeedbackRepository;
import br.com.cifras.feedback.model.FeedbackStatus;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.ArgumentCaptor;
import org.mockito.Mockito;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.Mockito.verify;

class FeedbackServiceTest {

    private FeedbackService service;
    private FeedbackRepository repository;

    @BeforeEach
    void setUp() {
        repository = Mockito.mock(FeedbackRepository.class);
        service = new FeedbackService();
        service.repository = repository;
    }

    @Test
    void testSubmitFeedback() {
        service.submitFeedback("user123", "Great app!");
        
        ArgumentCaptor<FeedbackEntity> captor = ArgumentCaptor.forClass(FeedbackEntity.class);
        verify(repository).persist(captor.capture());
        
        FeedbackEntity entity = captor.getValue();
        assertEquals("user123", entity.userId);
        assertEquals("Great app!", entity.message);
        assertEquals(FeedbackStatus.PENDING.name(), entity.status);
    }
}
