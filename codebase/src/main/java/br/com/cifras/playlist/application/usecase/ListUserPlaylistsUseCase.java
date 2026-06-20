package br.com.cifras.playlist.application.usecase;

import br.com.cifras.playlist.model.Playlist;
import br.com.cifras.playlist.infra.persistence.repository.PlaylistRepository;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import java.util.List;

@ApplicationScoped
public class ListUserPlaylistsUseCase {

    @Inject
    PlaylistRepository playlistRepository;

    public List<Playlist> execute(String userId) {
        return playlistRepository.findByUserIdActive(userId);
    }
}
