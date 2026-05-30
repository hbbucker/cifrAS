package br.com.cifras.playlist.application.usecase;

import br.com.cifras.group.infra.persistence.entity.GroupEntity;
import br.com.cifras.group.infra.persistence.repository.GroupRepository;
import br.com.cifras.playlist.model.Playlist;
import br.com.cifras.playlist.model.PlaylistSong;
import br.com.cifras.playlist.dto.CreatePlaylistRequest;
import br.com.cifras.playlist.infra.persistence.repository.PlaylistRepository;
import br.com.cifras.shared.exception.ForbiddenException;
import br.com.cifras.shared.exception.NotFoundException;
import br.com.cifras.song.model.Song;
import br.com.cifras.song.infra.persistence.repository.SongRepository;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import jakarta.transaction.Transactional;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

/**
 * PlaylistService — business logic for playlist CRUD, song management, and reordering.
 * Only the playlist owner (or group member for collaborative playlists) can modify.
 */
@ApplicationScoped
public class PlaylistService {

    @Inject
    PlaylistRepository playlistRepository;

    @Inject
    SongRepository songRepository;

    @Inject
    GroupRepository groupRepository;

    @Transactional
    public Playlist create(CreatePlaylistRequest req, String userId) {
        Playlist playlist = Playlist.create(userId, req.name());
        
        if (req.isCollaborative() && req.groupId() != null) {
            br.com.cifras.group.model.Group group = groupRepository.findById(req.groupId()).orElse(null);
            if (group == null) throw new NotFoundException("Group not found");
            if (!groupRepository.isOwner(req.groupId(), userId)) {
                throw new ForbiddenException("Only group owner can link a playlist to it");
            }
            playlist.makeCollaborative(group);
        }
        
        playlistRepository.persist(playlist);
        return playlist;
    }

    public List<Playlist> listByUser(String userId) {
        return playlistRepository.findByUserIdActive(userId);
    }

    public Playlist getById(UUID playlistId, String userId) {
        Playlist playlist = playlistRepository.findActiveById(playlistId)
            .orElseThrow(() -> new NotFoundException("Playlist not found"));

        if (!canRead(playlist, userId)) {
            throw new ForbiddenException("Access denied to playlist");
        }
        return playlist;
    }

    @Transactional
    public void addSong(UUID playlistId, UUID songId, int position, String userId) {
        Playlist playlist = playlistRepository.findActiveById(playlistId)
            .orElseThrow(() -> new NotFoundException("Playlist not found"));

        if (!canModify(playlist, userId)) {
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

    @Transactional
    public void removeSong(UUID playlistId, UUID songId, String userId) {
        Playlist playlist = playlistRepository.findActiveById(playlistId)
            .orElseThrow(() -> new NotFoundException("Playlist not found"));

        if (!canModify(playlist, userId)) {
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

    @Transactional
    public void reorder(UUID playlistId, List<UUID> orderedSongIds, String userId) {
        Playlist playlist = playlistRepository.findActiveById(playlistId)
            .orElseThrow(() -> new NotFoundException("Playlist not found"));

        if (!canModify(playlist, userId)) {
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

    @Transactional
    public void delete(UUID playlistId, String userId) {
        Playlist playlist = playlistRepository.findActiveById(playlistId)
            .orElseThrow(() -> new NotFoundException("Playlist not found"));

        if (!canModify(playlist, userId)) {
            throw new ForbiddenException("Access denied to playlist");
        }

        playlist.softDelete();
        playlistRepository.update(playlist);
    }

    private boolean canModify(Playlist playlist, String userId) {
        return userId.equals(playlist.getUserId());
    }

    private boolean canRead(Playlist playlist, String userId) {
        if (canModify(playlist, userId)) {
            return true;
        }
        if (playlist.isCollaborative() && playlist.getGroup() != null) {
            return groupRepository.isMember(playlist.getGroup().getId(), userId);
        }
        return false;
    }
}
