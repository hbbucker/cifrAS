package br.com.cifras.admin.audit.infra.repository;

import br.com.cifras.admin.audit.infra.entity.UserAuditLogEntity;
import io.quarkus.hibernate.orm.panache.PanacheRepositoryBase;
import jakarta.enterprise.context.ApplicationScoped;

import java.util.List;

@ApplicationScoped
public class UserAuditLogRepository implements PanacheRepositoryBase<UserAuditLogEntity, String> {

    public List<UserAuditLogEntity> findByUserId(String userId) {
        return list("userId = ?1 order by createdAt desc", userId);
    }
}
