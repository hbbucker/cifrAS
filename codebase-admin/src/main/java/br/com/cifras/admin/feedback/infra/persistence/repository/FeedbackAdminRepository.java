package br.com.cifras.admin.feedback.infra.persistence.repository;

import io.quarkus.hibernate.orm.panache.PanacheRepositoryBase;
import jakarta.enterprise.context.ApplicationScoped;
import java.util.UUID;
import br.com.cifras.admin.feedback.infra.persistence.entity.FeedbackEntity;
import io.quarkus.panache.common.Sort;
import java.util.List;

@ApplicationScoped
public class FeedbackAdminRepository implements PanacheRepositoryBase<FeedbackEntity, UUID> {
    
    public List<FeedbackEntity> findAllSorted() {
        return findAll(Sort.descending("createdAt")).list();
    }
}
