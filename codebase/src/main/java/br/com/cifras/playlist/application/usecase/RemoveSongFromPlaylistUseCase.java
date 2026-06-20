package br.com.cifras.playlist.application.usecase;

import br.com.cifras.playlist.model.Playlist;
import br.com.cifras.playlist.model.PlaylistSong;
import br.com.cifras.playlist.infra.persistence.repository.PlaylistRepository;
import br.com.cifras.shared.exception.ForbiddenException;
import br.com.cifras.shared.exception.NotFoundException;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import jakarta.transaction.Transactional;
import java.util.UUID;

@ApplicationScoped
public class RemoveSongFromPlaylistUseCase {

    @Inject
    PlaylistRepository playlistRepository;

    @Transactional
    public void execute(UUID playlistId, UUID songId, String userId) {
        Playlist playlist = playlistRepository.findActiveById(playlistId)
            .orElseThrow(() -> new NotFoundException("Playlist not found"));

        if (!userId.equals(playlist.getUserId())) {
            throw new ForbiddenException("Access denied to playlist");
        }

        PlaylistSong toRemove = playlist.getSongs().stream()
            .filter(ps -> ps.getSong().getId().equals(songId))
            .findFirst()
            .orElseThrow(() -> new NotFoundException("Song not in playlist"));

        int removedPosition = toRemove.getPosition();
        playlist.removeSong(toRemove);

        for (PlaylistSong ps : playlist.getSongs()) {
            if (ps.getPosition() > removedPosition) {
                ps.updatePosition(ps.getPosition() - 1);
            }
        }
        playlistRepository.update(playlist);
    }
}
