package br.com.cifras.performance.infra;

import br.com.cifras.performance.infra.persistence.entity.PerformanceSessionEntity;
import io.quarkus.hibernate.orm.panache.PanacheRepositoryBase;
import jakarta.enterprise.context.ApplicationScoped;
import java.util.Optional;

@ApplicationScoped
public class PerformanceSessionRepository implements PanacheRepositoryBase<PerformanceSessionEntity, String> {
    public Optional<PerformanceSessionEntity> findByUserId(String userId) {
        return find("userId", userId).firstResultOptional();
    }
}
