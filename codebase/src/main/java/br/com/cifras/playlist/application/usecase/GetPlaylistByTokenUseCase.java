package br.com.cifras.playlist.application.usecase;

import br.com.cifras.playlist.infra.persistence.repository.PlaylistRepository;
import br.com.cifras.playlist.model.Playlist;
import br.com.cifras.shared.exception.NotFoundException;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;

@ApplicationScoped
public class GetPlaylistByTokenUseCase {

    @Inject
    PlaylistRepository playlistRepository;

    public Playlist execute(String shareToken) {
        return playlistRepository.findByShareToken(shareToken)
                .orElseThrow(() -> new NotFoundException("Playlist not found or link expired"));
    }
}
