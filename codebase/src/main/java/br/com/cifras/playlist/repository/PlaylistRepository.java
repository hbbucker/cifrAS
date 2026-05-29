package br.com.cifras.playlist.repository;

import br.com.cifras.playlist.domain.Playlist;
import io.quarkus.hibernate.orm.panache.PanacheRepositoryBase;
import jakarta.enterprise.context.ApplicationScoped;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

/**
 * PlaylistRepository — queries for Playlist entities with soft-delete filtering.
 */
@ApplicationScoped
public class PlaylistRepository implements PanacheRepositoryBase<Playlist, UUID> {

    public List<Playlist> findByUserIdActive(String userId) {
        return list("userId = ?1 AND deletedAt IS NULL ORDER BY createdAt DESC", userId);
    }

    public Optional<Playlist> findActiveById(UUID id) {
        return find("id = ?1 AND deletedAt IS NULL", id).firstResultOptional();
    }
}
