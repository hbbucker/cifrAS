package br.com.cifras.playlist.application.usecase;

import br.com.cifras.playlist.model.Playlist;
import br.com.cifras.playlist.infra.persistence.repository.PlaylistRepository;
import br.com.cifras.shared.exception.ForbiddenException;
import br.com.cifras.shared.exception.NotFoundException;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import jakarta.transaction.Transactional;
import java.util.List;
import java.util.UUID;

@ApplicationScoped
public class UpdatePlaylistSongPositionUseCase {

    @Inject
    PlaylistRepository playlistRepository;

    @Transactional
    public void execute(UUID playlistId, List<UUID> orderedSongIds, String userId) {
        Playlist playlist = playlistRepository.findActiveById(playlistId)
            .orElseThrow(() -> new NotFoundException("Playlist not found"));

        if (!userId.equals(playlist.getUserId())) {
            throw new ForbiddenException("Access denied to playlist");
        }

        for (int i = 0; i < orderedSongIds.size(); i++) {
            final int newPos = i;
            final UUID targetSongId = orderedSongIds.get(i);
            playlist.getSongs().stream()
                .filter(ps -> ps.getSong().getId().equals(targetSongId))
                .findFirst()
                .ifPresent(ps -> ps.updatePosition(newPos));
        }
        playlistRepository.update(playlist);
    }
}
