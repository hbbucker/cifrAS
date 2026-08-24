package br.com.cifras.song.application.usecase;

import br.com.cifras.song.dto.TagCountDTO;
import br.com.cifras.song.infra.persistence.repository.SongRepository;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import java.util.List;

@ApplicationScoped
public class GetUserTagsUseCase {

    @Inject
    SongRepository songRepository;

    public List<TagCountDTO> execute(String userId) {
        if (userId == null || userId.isBlank()) {
            return List.of();
        }
        return songRepository.getUserTagsWithCount(userId);
    }
}
