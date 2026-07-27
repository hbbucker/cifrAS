package br.com.cifras.user.application.usecase;

import br.com.cifras.user.infra.persistence.entity.UserSongPreferenceEntity;
import br.com.cifras.user.resource.dto.TheaterSessionStateDTO;
import jakarta.enterprise.context.ApplicationScoped;
import java.util.Optional;
import java.util.UUID;

@ApplicationScoped
public class GetSongPreferenceUseCase {

    public Optional<TheaterSessionStateDTO> execute(String userId, UUID songId) {
        UserSongPreferenceEntity.UserSongPreferenceId id = 
            new UserSongPreferenceEntity.UserSongPreferenceId(userId, songId);
            
        UserSongPreferenceEntity entity = UserSongPreferenceEntity.findById(id);
        
        if (entity == null) {
            return Optional.empty();
        }
        
        return Optional.of(new TheaterSessionStateDTO(
            entity.songId,
            entity.transposeSteps,
            entity.autoScrollSpeed,
            entity.fontSize
        ));
    }
}
