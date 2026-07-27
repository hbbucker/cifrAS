package br.com.cifras.user.application.usecase;

import br.com.cifras.user.infra.persistence.entity.UserSongPreferenceEntity;
import br.com.cifras.user.resource.dto.TheaterSessionStateDTO;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.transaction.Transactional;
import java.time.Instant;

@ApplicationScoped
public class UpdateTheaterSessionUseCase {

    @Transactional
    public void execute(String userId, TheaterSessionStateDTO req) {
        UserSongPreferenceEntity.UserSongPreferenceId id = 
            new UserSongPreferenceEntity.UserSongPreferenceId(userId, req.songId());
            
        UserSongPreferenceEntity entity = UserSongPreferenceEntity.findById(id);
        
        if (entity == null) {
            entity = new UserSongPreferenceEntity();
            entity.userId = userId;
            entity.songId = req.songId();
        }
        
        entity.transposeSteps = req.transposeSteps();
        entity.autoScrollSpeed = req.autoScrollSpeed();
        entity.fontSize = req.fontSize();
        entity.updatedAt = Instant.now();
        
        entity.persist();
    }
}
