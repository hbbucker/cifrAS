package br.com.cifras.admin.song.infra.mapper;

import br.com.cifras.admin.song.dto.AdminSongDTO;
import br.com.cifras.admin.song.infra.entity.AdminSongEntity;
import br.com.cifras.admin.song.model.AdminSong;
import jakarta.enterprise.context.ApplicationScoped;

import java.util.List;

@ApplicationScoped
public class AdminSongMapper {

    public AdminSong toDomain(AdminSongEntity entity) {
        if (entity == null) return null;
        return new AdminSong(
            entity.id,
            entity.userId,
            entity.title,
            entity.artist,
            entity.originalKey,
            entity.isFavorite,
            entity.tags,
            entity.createdAt,
            entity.updatedAt,
            entity.deletedAt
        );
    }

    public AdminSongDTO toDTO(AdminSong domain, String authorEmail, String authorName) {
        if (domain == null) return null;
        return new AdminSongDTO(
            domain.getId(),
            domain.getUserId(),
            authorEmail,
            authorName,
            domain.getTitle(),
            domain.getArtist(),
            domain.getOriginalKey(),
            domain.getFavorite(),
            domain.getTags(),
            domain.getCreatedAt(),
            domain.getUpdatedAt(),
            domain.getDeletedAt(),
            domain.isDeleted()
        );
    }

    public List<AdminSong> toDomainList(List<AdminSongEntity> entities) {
        if (entities == null) return List.of();
        return entities.stream().map(this::toDomain).toList();
    }
}
