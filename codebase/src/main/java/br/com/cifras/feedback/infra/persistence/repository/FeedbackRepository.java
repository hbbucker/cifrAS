package br.com.cifras.feedback.infra.persistence.repository;

import io.quarkus.hibernate.orm.panache.PanacheRepositoryBase;
import jakarta.enterprise.context.ApplicationScoped;
import java.util.UUID;
import br.com.cifras.feedback.infra.persistence.entity.FeedbackEntity;

@ApplicationScoped
public class FeedbackRepository implements PanacheRepositoryBase<FeedbackEntity, UUID> {
}
