package br.com.cifras.admin.song.infra.repository;

import br.com.cifras.admin.song.infra.entity.AdminSongEntity;
import io.quarkus.hibernate.orm.panache.PanacheRepositoryBase;
import io.quarkus.panache.common.Page;
import io.quarkus.panache.common.Parameters;
import jakarta.enterprise.context.ApplicationScoped;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

@ApplicationScoped
public class AdminSongRepository implements PanacheRepositoryBase<AdminSongEntity, UUID> {

    public List<AdminSongEntity> findFiltered(String search, Boolean showDeletedOnly, Page page) {
        StringBuilder query = new StringBuilder("1 = 1");
        Parameters params = new Parameters();

        if (showDeletedOnly != null && showDeletedOnly) {
            query.append(" AND deletedAt IS NOT NULL");
        } else if (showDeletedOnly != null && !showDeletedOnly) {
            query.append(" AND deletedAt IS NULL");
        }

        if (search != null && !search.isBlank()) {
            query.append(" AND (LOWER(title) LIKE LOWER(:search) OR LOWER(artist) LIKE LOWER(:search) OR userId LIKE :search)");
            params.and("search", "%" + search.trim() + "%");
        }

        return find(query.toString() + " ORDER BY createdAt DESC", params).page(page).list();
    }

    public long countFiltered(String search, Boolean showDeletedOnly) {
        StringBuilder query = new StringBuilder("1 = 1");
        Parameters params = new Parameters();

        if (showDeletedOnly != null && showDeletedOnly) {
            query.append(" AND deletedAt IS NOT NULL");
        } else if (showDeletedOnly != null && !showDeletedOnly) {
            query.append(" AND deletedAt IS NULL");
        }

        if (search != null && !search.isBlank()) {
            query.append(" AND (LOWER(title) LIKE LOWER(:search) OR LOWER(artist) LIKE LOWER(:search) OR userId LIKE :search)");
            params.and("search", "%" + search.trim() + "%");
        }

        return count(query.toString(), params);
    }

    public long countActive() {
        return count("deletedAt IS NULL");
    }

    public long countDeleted() {
        return count("deletedAt IS NOT NULL");
    }

    public long countCreatedAfter(Instant timestamp) {
        return count("createdAt >= ?1", timestamp);
    }

    public List<AdminSongEntity> findRecent(int limit) {
        return find("ORDER BY createdAt DESC").page(Page.of(0, limit)).list();
    }
}
