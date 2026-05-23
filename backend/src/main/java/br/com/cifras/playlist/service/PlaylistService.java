package br.com.cifras.playlist.service;

import br.com.cifras.playlist.domain.Playlist;
import br.com.cifras.playlist.domain.PlaylistSong;
import br.com.cifras.playlist.dto.CreatePlaylistRequest;
import br.com.cifras.playlist.repository.PlaylistRepository;
import br.com.cifras.shared.exception.ForbiddenException;
import br.com.cifras.shared.exception.NotFoundException;
import br.com.cifras.song.domain.Song;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import jakarta.transaction.Transactional;

import java.util.List;

/**
 * PlaylistService — business logic for playlist CRUD, song management, and reordering.
 * Only the playlist owner (or group member for collaborative playlists) can modify.
 */
@ApplicationScoped
public class PlaylistService {

    @Inject
    PlaylistRepository playlistRepository;

    /**
     * Creates a new playlist for the given user.
     */
    @Transactional
    public Playlist create(CreatePlaylistRequest req, String userId) {
        Playlist playlist = new Playlist();
        playlist.userId = userId;
        playlist.name = req.name();
        playlist.isCollaborative = req.isCollaborative();
        playlistRepository.persist(playlist);
        return playlist;
    }

    /**
     * Lists all active playlists for a user.
     */
    public List<Playlist> listByUser(String userId) {
        return playlistRepository.findByUserIdActive(userId);
    }

    /**
     * Adds a song to a playlist at the given position.
     * Shifts existing songs at or after that position down by 1.
     *
     * @throws NotFoundException  if playlist not found
     * @throws ForbiddenException if user doesn't own the playlist
     */
    @Transactional
    public void addSong(Long playlistId, Long songId, int position, String userId) {
        Playlist playlist = playlistRepository.findActiveById(playlistId)
            .orElseThrow(() -> new NotFoundException("Playlist not found"));

        if (!canModify(playlist, userId)) {
            throw new ForbiddenException("Access denied to playlist");
        }

        Song song = Song.findById(songId);
        if (song == null) {
            throw new NotFoundException("Song not found");
        }

        // Shift positions for songs at or after the insertion point
        for (PlaylistSong ps : playlist.songs) {
            if (ps.position >= position) {
                ps.position++;
            }
        }

        PlaylistSong link = new PlaylistSong();
        link.playlist = playlist;
        link.song = song;
        link.position = position;
        link.persist();

        playlist.songs.add(link);
    }

    /**
     * Removes a song from a playlist and adjusts trailing positions.
     *
     * @throws NotFoundException  if playlist not found or song not in playlist
     * @throws ForbiddenException if user doesn't own the playlist
     */
    @Transactional
    public void removeSong(Long playlistId, Long songId, String userId) {
        Playlist playlist = playlistRepository.findActiveById(playlistId)
            .orElseThrow(() -> new NotFoundException("Playlist not found"));

        if (!canModify(playlist, userId)) {
            throw new ForbiddenException("Access denied to playlist");
        }

        PlaylistSong toRemove = playlist.songs.stream()
            .filter(ps -> ps.song.id.equals(songId))
            .findFirst()
            .orElseThrow(() -> new NotFoundException("Song not in playlist"));

        int removedPosition = toRemove.position;
        playlist.songs.remove(toRemove);
        toRemove.delete();

        // Adjust positions after removed song
        for (PlaylistSong ps : playlist.songs) {
            if (ps.position > removedPosition) {
                ps.position--;
            }
        }
    }

    /**
     * Reorders songs in a playlist using the provided ordered list of song IDs.
     * Each songId gets a new position = its index in orderedSongIds.
     *
     * @throws NotFoundException  if playlist not found
     * @throws ForbiddenException if user doesn't own the playlist
     */
    @Transactional
    public void reorder(Long playlistId, List<Long> orderedSongIds, String userId) {
        Playlist playlist = playlistRepository.findActiveById(playlistId)
            .orElseThrow(() -> new NotFoundException("Playlist not found"));

        if (!canModify(playlist, userId)) {
            throw new ForbiddenException("Access denied to playlist");
        }

        for (int i = 0; i < orderedSongIds.size(); i++) {
            final int newPos = i;
            final Long targetSongId = orderedSongIds.get(i);
            playlist.songs.stream()
                .filter(ps -> ps.song.id.equals(targetSongId))
                .findFirst()
                .ifPresent(ps -> ps.position = newPos);
        }
    }

    /**
     * Checks if the user can modify this playlist (is owner or group member for collaborative).
     */
    private boolean canModify(Playlist playlist, String userId) {
        return userId.equals(playlist.userId);
        // Note: collaborative group membership check is added in T14
    }
}
