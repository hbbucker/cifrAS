package br.com.cifras.song.infra.persistence.repository;

import br.com.cifras.song.dto.TagCountDTO;
import br.com.cifras.song.infra.persistence.entity.SongEntity;
import br.com.cifras.song.infra.persistence.mapper.SongMapper;
import br.com.cifras.song.model.Song;
import io.quarkus.hibernate.orm.panache.PanacheRepositoryBase;
import io.quarkus.panache.common.Page;
import io.quarkus.panache.common.Sort;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;

import java.util.ArrayList;
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

    @Inject
    jakarta.persistence.EntityManager em;

    private static final String ACTIVE_FILTER = "deletedAt IS NULL";

    public List<Song> searchFts(String userId, String query) {
        String sql = "SELECT * FROM songs WHERE userId = :userId AND " + ACTIVE_FILTER + 
                     " AND fts_vector @@ to_tsquery('portuguese', :query)" +
                     " ORDER BY ts_rank(fts_vector, to_tsquery('portuguese', :query)) DESC";
        
        String formattedQuery = query.replaceAll("\\s+", " & ");
        
        List<SongEntity> entities = em.createNativeQuery(sql, SongEntity.class)
                .setParameter("userId", userId)
                .setParameter("query", formattedQuery)
                .getResultList();
        
        return entities.stream().map(mapper::toDomain).collect(Collectors.toList());
    }

    public List<Song> findByUserIdActive(String userId, int page, int size, String query) {
        return findByUserIdActive(userId, page, size, query, null);
    }

    public List<Song> findByUserIdActive(String userId, int page, int size, String query, List<String> tags) {
        boolean hasQuery = query != null && !query.isBlank();
        boolean hasTags = tags != null && !tags.isEmpty();

        if (hasQuery || hasTags) {
            StringBuilder sql = new StringBuilder("SELECT * FROM songs WHERE userId = :userId AND " + ACTIVE_FILTER);
            if (hasQuery) {
                sql.append(" AND fts_vector @@ to_tsquery('portuguese', :query)");
            }
            if (hasTags) {
                sql.append(" AND tags::text[] @> string_to_array(:tagsCsv, ',')");
            }
            if (hasQuery) {
                sql.append(" ORDER BY ts_rank(fts_vector, to_tsquery('portuguese', :query)) DESC, createdAt DESC");
            } else {
                sql.append(" ORDER BY createdAt DESC");
            }

            var nativeQuery = em.createNativeQuery(sql.toString(), SongEntity.class)
                    .setParameter("userId", userId);

            if (hasQuery) {
                String formattedQuery = query.trim().replaceAll("\\s+", " & ");
                nativeQuery.setParameter("query", formattedQuery);
            }
            if (hasTags) {
                String tagsCsv = String.join(",", tags.stream().map(String::trim).filter(s -> !s.isEmpty()).toList());
                nativeQuery.setParameter("tagsCsv", tagsCsv);
            }

            List<SongEntity> entities = nativeQuery
                    .setFirstResult((page - 1) * size)
                    .setMaxResults(size)
                    .getResultList();

            return entities.stream().map(mapper::toDomain).collect(Collectors.toList());
        }

        String baseQuery = "userId = ?1 AND " + ACTIVE_FILTER;
        List<SongEntity> entities = jpaRepo.find(baseQuery, Sort.by("createdAt").descending(), userId)
            .page(Page.of(page - 1, size))
            .list();
        return entities.stream().map(mapper::toDomain).collect(Collectors.toList());
    }

    public long countByUserIdActive(String userId, String query) {
        return countByUserIdActive(userId, query, null);
    }

    public long countByUserIdActive(String userId, String query, List<String> tags) {
        boolean hasQuery = query != null && !query.isBlank();
        boolean hasTags = tags != null && !tags.isEmpty();

        if (hasQuery || hasTags) {
            StringBuilder sql = new StringBuilder("SELECT COUNT(*) FROM songs WHERE userId = :userId AND " + ACTIVE_FILTER);
            if (hasQuery) {
                sql.append(" AND fts_vector @@ to_tsquery('portuguese', :query)");
            }
            if (hasTags) {
                sql.append(" AND tags::text[] @> string_to_array(:tagsCsv, ',')");
            }

            var nativeQuery = em.createNativeQuery(sql.toString())
                    .setParameter("userId", userId);

            if (hasQuery) {
                String formattedQuery = query.trim().replaceAll("\\s+", " & ");
                nativeQuery.setParameter("query", formattedQuery);
            }
            if (hasTags) {
                String tagsCsv = String.join(",", tags.stream().map(String::trim).filter(s -> !s.isEmpty()).toList());
                nativeQuery.setParameter("tagsCsv", tagsCsv);
            }

            Number count = (Number) nativeQuery.getSingleResult();
            return count.longValue();
        }
        return jpaRepo.count("userId = ?1 AND " + ACTIVE_FILTER, userId);
    }

    public List<TagCountDTO> getUserTagsWithCount(String userId) {
        String sql = "SELECT tag, COUNT(*) as cnt " +
                     "FROM (SELECT unnest(tags) as tag FROM songs WHERE userId = :userId AND " + ACTIVE_FILTER + ") t " +
                     "WHERE tag IS NOT NULL AND btrim(tag) != '' " +
                     "GROUP BY tag " +
                     "ORDER BY cnt DESC, tag ASC";

        List<?> results = em.createNativeQuery(sql)
                .setParameter("userId", userId)
                .getResultList();

        List<TagCountDTO> tagCounts = new ArrayList<>();
        for (Object rowObj : results) {
            Object[] row = (Object[]) rowObj;
            String name = (String) row[0];
            long count = ((Number) row[1]).longValue();
            tagCounts.add(new TagCountDTO(name, count));
        }
        return tagCounts;
    }

    public Optional<Song> findActiveById(UUID id) {
        return jpaRepo.find("id = ?1 AND " + ACTIVE_FILTER, id).firstResultOptional().map(mapper::toDomain);
    }

    public void persist(Song song) {
        SongEntity entity = mapper.toEntity(song);
        jpaRepo.persistAndFlush(entity);
        song.setId(entity.id);
        song.setCreatedAt(entity.createdAt);
        song.setUpdatedAt(entity.updatedAt);
    }

    public void update(Song song) {
        SongEntity entity = jpaRepo.findById(song.getId());
        if (entity != null) {
            mapper.updateEntity(song, entity);
        }
    }
}
