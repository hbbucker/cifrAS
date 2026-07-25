package br.com.cifras.playlist.application.usecase;

import br.com.cifras.playlist.infra.persistence.repository.PlaylistRepository;
import br.com.cifras.playlist.model.Playlist;
import br.com.cifras.shared.exception.ForbiddenException;
import br.com.cifras.shared.exception.NotFoundException;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;

import java.util.UUID;

@ApplicationScoped
public class GenerateShareTokenUseCase {

    @Inject
    PlaylistRepository playlistRepository;

    public String execute(UUID playlistId, String userId) {
        Playlist playlist = playlistRepository.findActiveById(playlistId)
                .orElseThrow(() -> new NotFoundException("Playlist not found"));

        if (!playlist.getUserId().equals(userId)) {
            throw new ForbiddenException("Only the owner can generate a share link");
        }

        String token = playlist.generateShareToken();
        playlistRepository.update(playlist);
        
        return token;
    }
}
