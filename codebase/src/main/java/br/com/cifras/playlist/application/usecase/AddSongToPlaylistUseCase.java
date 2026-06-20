package br.com.cifras.playlist.application.usecase;

import br.com.cifras.playlist.model.Playlist;
import br.com.cifras.playlist.model.PlaylistSong;
import br.com.cifras.playlist.infra.persistence.repository.PlaylistRepository;
import br.com.cifras.shared.exception.ForbiddenException;
import br.com.cifras.shared.exception.NotFoundException;
import br.com.cifras.song.model.Song;
import br.com.cifras.song.infra.persistence.repository.SongRepository;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import jakarta.transaction.Transactional;
import java.util.UUID;

@ApplicationScoped
public class AddSongToPlaylistUseCase {

    @Inject
    PlaylistRepository playlistRepository;

    @Inject
    SongRepository songRepository;

    @Transactional
    public void execute(UUID playlistId, UUID songId, int position, String userId) {
        Playlist playlist = playlistRepository.findActiveById(playlistId)
            .orElseThrow(() -> new NotFoundException("Playlist not found"));

        if (!userId.equals(playlist.getUserId())) {
            throw new ForbiddenException("Access denied to playlist");
        }

        Song song = songRepository.findActiveById(songId).orElseThrow(() -> new NotFoundException("Song not found"));

        for (PlaylistSong ps : playlist.getSongs()) {
            if (ps.getPosition() >= position) {
                ps.updatePosition(ps.getPosition() + 1);
            }
        }

        PlaylistSong link = PlaylistSong.create(song, position);
        playlist.addSong(link);
        playlistRepository.update(playlist);
    }
}
