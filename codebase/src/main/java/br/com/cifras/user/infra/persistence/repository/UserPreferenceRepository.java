package br.com.cifras.user.infra.persistence.repository;

import br.com.cifras.user.infra.persistence.entity.UserPreferenceEntity;
import br.com.cifras.user.infra.persistence.mapper.UserPreferenceMapper;
import br.com.cifras.user.model.UserPreference;
import io.quarkus.hibernate.orm.panache.PanacheRepositoryBase;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;

import java.util.Optional;

@ApplicationScoped
public class UserPreferenceRepository {

    @ApplicationScoped
    static class JpaUserPreferenceRepository implements PanacheRepositoryBase<UserPreferenceEntity, String> {}

    @Inject
    JpaUserPreferenceRepository jpaRepo;

    @Inject
    UserPreferenceMapper mapper;

    public Optional<UserPreference> findByUserId(String userId) {
        return jpaRepo.find("userId", userId).firstResultOptional().map(mapper::toDomain);
    }

    public void persist(UserPreference pref) {
        UserPreferenceEntity entity = mapper.toEntity(pref);
        jpaRepo.persist(entity);
    }

    public void update(UserPreference pref) {
        UserPreferenceEntity entity = jpaRepo.findById(pref.userId);
        if (entity != null) {
            mapper.updateEntity(pref, entity);
            jpaRepo.persist(entity);
        }
    }
}
