package br.com.cifras.admin.feedback.application;

import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import jakarta.transaction.Transactional;
import br.com.cifras.admin.feedback.infra.persistence.entity.FeedbackEntity;
import br.com.cifras.admin.feedback.infra.persistence.repository.FeedbackAdminRepository;
import br.com.cifras.admin.feedback.dto.FeedbackDTO;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@ApplicationScoped
public class FeedbackAdminService {

    @Inject
    FeedbackAdminRepository repository;

    public List<FeedbackDTO> listAllFeedbacks() {
        return repository.findAllSorted().stream()
            .map(e -> new FeedbackDTO(e.id, e.userId, e.message, e.status, e.adminReply, e.createdAt, e.updatedAt))
            .collect(Collectors.toList());
    }

    @Transactional
    public boolean replyToFeedback(UUID id, String replyMessage) {
        FeedbackEntity entity = repository.findById(id);
        if (entity == null) {
            return false;
        }
        entity.adminReply = replyMessage;
        entity.status = "REPLIED";
        return true;
    }
}
