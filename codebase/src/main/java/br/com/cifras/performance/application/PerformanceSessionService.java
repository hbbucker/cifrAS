package br.com.cifras.performance.application;

import br.com.cifras.performance.dto.PerformanceSessionRequest;
import br.com.cifras.performance.dto.PerformanceSessionResponse;
import br.com.cifras.performance.infra.PerformanceSessionMapper;
import br.com.cifras.performance.infra.PerformanceSessionRepository;
import br.com.cifras.performance.infra.persistence.entity.PerformanceSessionEntity;
import br.com.cifras.performance.model.PerformanceSession;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import jakarta.transaction.Transactional;

import java.util.Optional;

@ApplicationScoped
public class PerformanceSessionService {
    
    @Inject
    PerformanceSessionRepository repository;
    
    @Inject
    PerformanceSessionMapper mapper;

    @Transactional
    public void upsertSession(String userId, PerformanceSessionRequest request) {
        Optional<PerformanceSessionEntity> existingEntity = repository.findByUserId(userId);
        if (existingEntity.isPresent()) {
            PerformanceSession session = mapper.toDomain(existingEntity.get());
            session.updateProgress(request.playlistId(), request.currentSongIndex(), request.scrollPosition());
            mapper.updateEntity(session, existingEntity.get());
            repository.persist(existingEntity.get());
        } else {
            PerformanceSession session = PerformanceSession.create(userId, request.playlistId(), request.currentSongIndex(), request.scrollPosition());
            repository.persist(mapper.toEntity(session));
        }
    }
    
    public Optional<PerformanceSessionResponse> getActiveSession(String userId) {
        return repository.findByUserId(userId)
            .map(mapper::toDomain)
            .map(s -> new PerformanceSessionResponse(s.getPlaylistId(), s.getCurrentSongIndex(), s.getScrollPosition(), s.getUpdatedAt()));
    }
    
    @Transactional
    public void deleteSession(String userId) {
        repository.deleteById(userId);
    }
}
