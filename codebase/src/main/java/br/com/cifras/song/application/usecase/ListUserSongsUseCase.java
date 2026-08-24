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

    public PagedResponse<Song> execute(String userId, int page, int size, String query) {
        return execute(userId, page, size, query, null);
    }

    public PagedResponse<Song> execute(String userId, int page, int size, String query, List<String> tags) {
        List<Song> songs = songRepository.findByUserIdActive(userId, page, size, query, tags);
        long total = songRepository.countByUserIdActive(userId, query, tags);
        return PagedResponse.of(songs, total, page, size);
    }
}
