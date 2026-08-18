package br.com.cifras.song.infra.persistence.mapper;

import br.com.cifras.song.infra.persistence.entity.SongShareEntity;
import br.com.cifras.song.model.SongShare;
import jakarta.enterprise.context.ApplicationScoped;

@ApplicationScoped
public class SongShareMapper {

    public SongShare toDomain(SongShareEntity entity) {
        if (entity == null) return null;
        return SongShare.restore(
            entity.id,
            entity.songId,
            entity.inviterId,
            entity.inviteeEmail,
            entity.status,
            entity.createdAt,
            entity.updatedAt
        );
    }

    public SongShareEntity toEntity(SongShare domain) {
        if (domain == null) return null;
        SongShareEntity entity = new SongShareEntity();
        entity.id = domain.getId();
        entity.songId = domain.getSongId();
        entity.inviterId = domain.getInviterId();
        entity.inviteeEmail = domain.getInviteeEmail();
        entity.status = domain.getStatus();
        entity.createdAt = domain.getCreatedAt();
        entity.updatedAt = domain.getUpdatedAt();
        return entity;
    }

    public void updateEntity(SongShare domain, SongShareEntity entity) {
        if (domain == null || entity == null) return;
        entity.status = domain.getStatus();
        entity.updatedAt = domain.getUpdatedAt();
    }
}
