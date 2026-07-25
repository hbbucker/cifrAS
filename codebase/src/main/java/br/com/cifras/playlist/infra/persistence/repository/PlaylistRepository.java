package br.com.cifras.playlist.infra.persistence.repository;

import br.com.cifras.playlist.infra.persistence.entity.PlaylistEntity;
import br.com.cifras.playlist.infra.persistence.mapper.PlaylistMapper;
import br.com.cifras.playlist.model.Playlist;
import io.quarkus.hibernate.orm.panache.PanacheRepositoryBase;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;

import java.util.List;
import java.util.Optional;
import java.util.UUID;
import java.util.stream.Collectors;

@ApplicationScoped
public class PlaylistRepository {

    @ApplicationScoped
    static class JpaPlaylistRepository implements PanacheRepositoryBase<PlaylistEntity, UUID> {}

    @Inject
    JpaPlaylistRepository jpaRepo;

    @Inject
    PlaylistMapper mapper;

    public List<Playlist> findByUserIdActive(String userId) {
        return jpaRepo.find("userId = ?1 AND deletedAt IS NULL ORDER BY createdAt DESC", userId)
            .list()
            .stream()
            .map(mapper::toDomain)
            .collect(Collectors.toList());
    }

    public List<Playlist> findCollaborativeActive(String userId) {
        return jpaRepo.find("isCollaborative = true AND group.id IN (SELECT group.id FROM GroupMemberEntity WHERE userId = ?1) AND deletedAt IS NULL", userId)
            .list()
            .stream()
            .map(mapper::toDomain)
            .collect(Collectors.toList());
    }

    public Optional<Playlist> findActiveById(UUID id) {
        return jpaRepo.find("id = ?1 AND deletedAt IS NULL", id).firstResultOptional().map(mapper::toDomain);
    }

    public Optional<Playlist> findByShareToken(String shareToken) {
        return jpaRepo.find("shareToken = ?1 AND deletedAt IS NULL", shareToken).firstResultOptional().map(mapper::toDomain);
    }
    
    public void persist(Playlist playlist) {
        PlaylistEntity entity = mapper.toEntity(playlist);
        jpaRepo.persistAndFlush(entity);
        playlist.setId(entity.id);
    }
    
    public void update(Playlist playlist) {
        PlaylistEntity entity = jpaRepo.findById(playlist.getId());
        if (entity != null) {
            mapper.updateEntity(playlist, entity);
            jpaRepo.persist(entity);
        }
    }
}
