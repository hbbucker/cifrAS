package br.com.cifras.playlist.repository;

import br.com.cifras.playlist.domain.Playlist;
import io.quarkus.hibernate.orm.panache.PanacheRepository;
import jakarta.enterprise.context.ApplicationScoped;

import java.util.List;
import java.util.Optional;

/**
 * PlaylistRepository — queries for Playlist entities with soft-delete filtering.
 */
@ApplicationScoped
public class PlaylistRepository implements PanacheRepository<Playlist> {

    public List<Playlist> findByUserIdActive(String userId) {
        return list("userId = ?1 AND deletedAt IS NULL ORDER BY createdAt DESC", userId);
    }

    public Optional<Playlist> findActiveById(Long id) {
        return find("id = ?1 AND deletedAt IS NULL", id).firstResultOptional();
    }
}
