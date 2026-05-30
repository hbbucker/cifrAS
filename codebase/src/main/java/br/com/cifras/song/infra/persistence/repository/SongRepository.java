package br.com.cifras.song.infra.persistence.repository;

import br.com.cifras.song.infra.persistence.entity.SongEntity;
import br.com.cifras.song.infra.persistence.mapper.SongMapper;
import br.com.cifras.song.model.Song;
import io.quarkus.hibernate.orm.panache.PanacheRepositoryBase;
import io.quarkus.panache.common.Page;
import io.quarkus.panache.common.Sort;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;

import java.util.List;
import java.util.Optional;
import java.util.UUID;
import java.util.stream.Collectors;

@ApplicationScoped
public class SongRepository {

    @ApplicationScoped
    static class JpaSongRepository implements PanacheRepositoryBase<SongEntity, UUID> {}

    @Inject
    JpaSongRepository jpaRepo;

    @Inject
    SongMapper mapper;

    private static final String ACTIVE_FILTER = "deletedAt IS NULL";

    public List<Song> findByUserIdActive(String userId, int page, int pageSize, String query) {
        String baseQuery = "userId = ?1 AND " + ACTIVE_FILTER;
        List<SongEntity> entities;
        if (query != null && !query.isBlank()) {
            baseQuery += " AND (LOWER(title) LIKE LOWER(?2) OR LOWER(artist) LIKE LOWER(?2))";
            entities = jpaRepo.find(baseQuery, Sort.by("createdAt").descending(),
                    userId, "%" + query + "%")
                .page(Page.of(page - 1, pageSize))
                .list();
        } else {
            entities = jpaRepo.find(baseQuery, Sort.by("createdAt").descending(), userId)
                .page(Page.of(page - 1, pageSize))
                .list();
        }
        return entities.stream().map(mapper::toDomain).collect(Collectors.toList());
    }

    public long countByUserIdActive(String userId, String query) {
        if (query != null && !query.isBlank()) {
            return jpaRepo.count("userId = ?1 AND " + ACTIVE_FILTER + " AND (LOWER(title) LIKE LOWER(?2) OR LOWER(artist) LIKE LOWER(?2))",
                    userId, "%" + query + "%");
        }
        return jpaRepo.count("userId = ?1 AND " + ACTIVE_FILTER, userId);
    }

    public Optional<Song> findActiveById(UUID id) {
        return jpaRepo.find("id = ?1 AND " + ACTIVE_FILTER, id).firstResultOptional().map(mapper::toDomain);
    }

    public void persist(Song song) {
        SongEntity entity = mapper.toEntity(song);
        jpaRepo.persistAndFlush(entity);
        song.id = entity.id;
        song.createdAt = entity.createdAt;
        song.updatedAt = entity.updatedAt;
    }

    public void update(Song song) {
        SongEntity entity = jpaRepo.findById(song.id);
        if (entity != null) {
            mapper.updateEntity(song, entity);
            jpaRepo.persist(entity);
        }
    }
}
