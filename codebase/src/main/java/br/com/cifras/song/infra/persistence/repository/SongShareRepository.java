package br.com.cifras.song.infra.persistence.repository;

import br.com.cifras.song.infra.persistence.entity.SongShareEntity;
import br.com.cifras.song.infra.persistence.mapper.SongShareMapper;
import br.com.cifras.song.model.SongShare;
import br.com.cifras.song.model.SongShareStatus;
import io.quarkus.hibernate.orm.panache.PanacheRepositoryBase;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;

import java.util.List;
import java.util.Optional;
import java.util.UUID;
import java.util.stream.Collectors;

@ApplicationScoped
public class SongShareRepository {

    @ApplicationScoped
    public static class JpaSongShareRepository implements PanacheRepositoryBase<SongShareEntity, UUID> {}

    @Inject
    JpaSongShareRepository jpaRepo;

    @Inject
    SongShareMapper mapper;

    public Optional<SongShare> findById(UUID id) {
        return jpaRepo.findByIdOptional(id).map(mapper::toDomain);
    }

    public List<SongShare> findPendingByInviteeEmail(String email) {
        if (email == null) return List.of();
        List<SongShareEntity> entities = jpaRepo.find("LOWER(inviteeEmail) = LOWER(?1) AND status = ?2 ORDER BY createdAt DESC", email.trim(), SongShareStatus.PENDING).list();
        return entities.stream().map(mapper::toDomain).collect(Collectors.toList());
    }

    public Optional<SongShare> findBySongAndInvitee(UUID songId, String email, SongShareStatus status) {
        return jpaRepo.find("songId = ?1 AND LOWER(inviteeEmail) = LOWER(?2) AND status = ?3", songId, email.trim(), status)
                .firstResultOptional()
                .map(mapper::toDomain);
    }

    public void persist(SongShare share) {
        SongShareEntity entity = mapper.toEntity(share);
        jpaRepo.persistAndFlush(entity);
        share.setId(entity.id);
        share.setCreatedAt(entity.createdAt);
        share.setUpdatedAt(entity.updatedAt);
    }

    public void update(SongShare share) {
        SongShareEntity entity = jpaRepo.findById(share.getId());
        if (entity != null) {
            mapper.updateEntity(share, entity);
        }
    }
}
