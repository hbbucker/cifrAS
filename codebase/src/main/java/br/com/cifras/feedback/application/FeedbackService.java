package br.com.cifras.feedback.application;

import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import jakarta.transaction.Transactional;
import br.com.cifras.feedback.infra.persistence.entity.FeedbackEntity;
import br.com.cifras.feedback.infra.persistence.repository.FeedbackRepository;
import br.com.cifras.feedback.model.FeedbackStatus;

@ApplicationScoped
public class FeedbackService {

    @Inject
    FeedbackRepository repository;

    @Transactional
    public void submitFeedback(String userId, String message) {
        FeedbackEntity entity = new FeedbackEntity();
        entity.userId = userId;
        entity.message = message;
        entity.status = FeedbackStatus.PENDING.name();
        repository.persist(entity);
    }
}
