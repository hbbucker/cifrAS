package br.com.cifras.song.application.usecase;

import br.com.cifras.shared.dto.PagedResponse;
import br.com.cifras.song.model.Song;
import br.com.cifras.song.infra.persistence.repository.SongRepository;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import java.util.List;

@ApplicationScoped
public class ListUserSongsUseCase {

    @Inject
    SongRepository songRepository;

    public PagedResponse<Song> execute(String userId, int page, int pageSize, String query) {
        List<Song> songs = songRepository.findByUserIdActive(userId, page, pageSize, query);
        long total = songRepository.countByUserIdActive(userId, query);
        return PagedResponse.of(songs, total, page, pageSize);
    }
}
