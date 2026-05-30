package br.com.cifras.song.infra.persistence.repository;

import br.com.cifras.song.model.Song;
import io.quarkus.hibernate.orm.panache.PanacheRepositoryBase;
import io.quarkus.panache.common.Page;
import io.quarkus.panache.common.Sort;
import jakarta.enterprise.context.ApplicationScoped;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

/**
 * SongRepository — Panache repository for Song entity.
 * All queries automatically filter deleted_at IS NULL (soft delete).
 */
@ApplicationScoped
public class SongRepository implements PanacheRepositoryBase<Song, UUID> {

    private static final String ACTIVE_FILTER = "deletedAt IS NULL";

    /**
     * Find active songs belonging to a specific user with optional full-text search.
     */
    public List<Song> findByUserIdActive(String userId, int page, int pageSize, String query) {
        String baseQuery = "userId = ?1 AND " + ACTIVE_FILTER;
        if (query != null && !query.isBlank()) {
            baseQuery += " AND (LOWER(title) LIKE LOWER(?2) OR LOWER(artist) LIKE LOWER(?2))";
            return find(baseQuery, Sort.by("createdAt").descending(),
                    userId, "%" + query + "%")
                .page(Page.of(page - 1, pageSize))
                .list();
        }
        return find(baseQuery, Sort.by("createdAt").descending(), userId)
            .page(Page.of(page - 1, pageSize))
            .list();
    }

    /**
     * Count active songs for a user (for pagination total).
     */
    public long countByUserIdActive(String userId, String query) {
        if (query != null && !query.isBlank()) {
            return count("userId = ?1 AND " + ACTIVE_FILTER + " AND (LOWER(title) LIKE LOWER(?2) OR LOWER(artist) LIKE LOWER(?2))",
                    userId, "%" + query + "%");
        }
        return count("userId = ?1 AND " + ACTIVE_FILTER, userId);
    }

    /**
     * Find an active song by ID (not soft-deleted).
     */
    public Optional<Song> findActiveById(UUID id) {
        return find("id = ?1 AND " + ACTIVE_FILTER, id).firstResultOptional();
    }
}
