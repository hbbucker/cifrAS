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
        Playlist playlist = new Playlist();
        playlist.userId = userId;
        playlist.name = req.name();
        playlist.isCollaborative = req.isCollaborative();
        
        if (req.isCollaborative() && req.groupId() != null) {
            GroupEntity group = GroupEntity.findById(req.groupId());
            if (group == null) throw new NotFoundException("Group not found");
            if (!groupRepository.isOwner(req.groupId(), userId)) {
                throw new ForbiddenException("Only group owner can link a playlist to it");
            }
            playlist.group = group;
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

        for (PlaylistSong ps : playlist.songs) {
            if (ps.position >= position) {
                ps.position++;
            }
        }

        PlaylistSong link = new PlaylistSong();
        link.song = song;
        link.position = position;

        playlist.songs.add(link);
        playlistRepository.update(playlist);
    }

    @Transactional
    public void removeSong(UUID playlistId, UUID songId, String userId) {
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

        for (PlaylistSong ps : playlist.songs) {
            if (ps.position > removedPosition) {
                ps.position--;
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
            playlist.songs.stream()
                .filter(ps -> ps.song.id.equals(targetSongId))
                .findFirst()
                .ifPresent(ps -> ps.position = newPos);
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

        playlist.deletedAt = Instant.now();
        playlistRepository.update(playlist);
    }

    private boolean canModify(Playlist playlist, String userId) {
        return userId.equals(playlist.userId);
    }

    private boolean canRead(Playlist playlist, String userId) {
        if (canModify(playlist, userId)) {
            return true;
        }
        if (playlist.isCollaborative && playlist.group != null) {
            return groupRepository.isMember(playlist.group.id, userId);
        }
        return false;
    }
}
