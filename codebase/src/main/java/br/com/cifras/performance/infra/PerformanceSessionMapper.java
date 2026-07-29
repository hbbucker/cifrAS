package br.com.cifras.performance.infra;

import br.com.cifras.performance.infra.persistence.entity.PerformanceSessionEntity;
import br.com.cifras.performance.model.PerformanceSession;
import jakarta.enterprise.context.ApplicationScoped;

@ApplicationScoped
public class PerformanceSessionMapper {
    public PerformanceSession toDomain(PerformanceSessionEntity entity) {
        if (entity == null) return null;
        return PerformanceSession.restore(
            entity.userId, entity.playlistId, entity.currentSongIndex, entity.scrollPosition, entity.updatedAt
        );
    }
    
    public PerformanceSessionEntity toEntity(PerformanceSession session) {
        if (session == null) return null;
        PerformanceSessionEntity entity = new PerformanceSessionEntity();
        entity.userId = session.getUserId();
        entity.playlistId = session.getPlaylistId();
        entity.currentSongIndex = session.getCurrentSongIndex();
        entity.scrollPosition = session.getScrollPosition();
        entity.updatedAt = session.getUpdatedAt();
        return entity;
    }
    
    public void updateEntity(PerformanceSession session, PerformanceSessionEntity entity) {
        entity.playlistId = session.getPlaylistId();
        entity.currentSongIndex = session.getCurrentSongIndex();
        entity.scrollPosition = session.getScrollPosition();
        entity.updatedAt = session.getUpdatedAt();
    }
}
