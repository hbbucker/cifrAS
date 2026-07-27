package br.com.cifras.user.application.usecase;

import br.com.cifras.user.infra.persistence.entity.UserSongPreferenceEntity;
import br.com.cifras.user.resource.dto.TheaterSessionStateDTO;
import io.quarkus.panache.common.Sort;
import jakarta.enterprise.context.ApplicationScoped;

import java.util.Optional;

@ApplicationScoped
public class GetTheaterSessionUseCase {

    public Optional<TheaterSessionStateDTO> execute(String userId) {
        UserSongPreferenceEntity entity = UserSongPreferenceEntity
            .find("userId", Sort.by("updatedAt").descending(), userId)
            .firstResult();
            
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
