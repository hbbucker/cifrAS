package br.com.cifras.song.application.usecase;

import br.com.cifras.shared.dto.PagedResponse;
import br.com.cifras.shared.exception.ForbiddenException;
import br.com.cifras.shared.exception.NotFoundException;
import br.com.cifras.song.model.Song;
import br.com.cifras.song.dto.CreateSongRequest;
import br.com.cifras.song.dto.UpdateSongRequest;
import br.com.cifras.song.infra.persistence.repository.SongRepository;
import br.com.cifras.playlist.infra.persistence.entity.PlaylistSongEntity;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import jakarta.transaction.Transactional;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

/**
 * SongService — business logic for song CRUD operations.
 * Enforces user isolation: all mutations check that the requesting user owns the song.
 */
@ApplicationScoped
public class SongService {

    @Inject
    SongRepository songRepository;

    /**
     * Lists songs belonging to a user with optional text search and pagination.
     * Only returns active (non-soft-deleted) songs.
     */
    public PagedResponse<Song> listByUser(String userId, int page, int pageSize, String query) {
        List<Song> songs = songRepository.findByUserIdActive(userId, page, pageSize, query);
        long total = songRepository.countByUserIdActive(userId, query);
        return PagedResponse.of(songs, total, page, pageSize);
    }

    /**
     * Finds an active song by ID, enforcing that it belongs to the requesting user.
     *
     * @throws NotFoundException if the song doesn't exist, is soft-deleted, or belongs to another user
     */
    public Song findByIdAndUser(UUID id, String userId) {
        Song song = songRepository.findActiveById(id)
            .orElseThrow(() -> new NotFoundException("Song not found: " + id));

        if (!userId.equals(song.getUserId())) {
            long count = PlaylistSongEntity.count(
                "song.id = ?1 and playlist.isCollaborative = true and playlist.group.id in " +
                "(select gm.group.id from GroupMemberEntity gm where gm.userId = ?2)", id, userId);
            
            if (count == 0) {
                throw new NotFoundException("Song not found: " + id); // Don't leak existence to other users
            }
        }

        return song;
    }

    /**
     * Creates a new song belonging to the given user.
     */
    @Transactional
    public Song create(CreateSongRequest req, String userId) {
        Song song = Song.create(userId, req.title(), req.artist(), req.originalKey(), req.lyrics());
        songRepository.persist(song);
        return song;
    }

    /**
     * Updates an existing song. Only the owner can update.
     *
     * @throws ForbiddenException if the requesting user is not the song's owner
     * @throws NotFoundException  if the song doesn't exist or is soft-deleted
     */
    @Transactional
    public Song update(UUID id, UpdateSongRequest req, String userId) {
        Song song = songRepository.findActiveById(id)
            .orElseThrow(() -> new NotFoundException("Song not found: " + id));

        if (!userId.equals(song.getUserId())) {
            throw new ForbiddenException("You do not own this song");
        }

        song.updateDetails(req.title(), req.artist(), req.originalKey(), req.lyrics());
        songRepository.update(song);
        return song;
    }

    /**
     * Soft-deletes a song by setting its deletedAt field. Only the owner can delete.
     *
     * @throws ForbiddenException if the requesting user is not the song's owner
     * @throws NotFoundException  if the song doesn't exist or is already soft-deleted
     */
    @Transactional
    public void softDelete(UUID id, String userId) {
        Song song = songRepository.findActiveById(id)
            .orElseThrow(() -> new NotFoundException("Song not found: " + id));

        if (!userId.equals(song.getUserId())) {
            throw new ForbiddenException("You do not own this song");
        }

        song.softDelete();
        songRepository.update(song);
    }

    /**
     * Updates song preferences. Only the owner can update.
     */
    @Transactional
    public void updatePreferences(UUID id, br.com.cifras.song.dto.SongPreferencesDTO req, String userId) {
        Song song = songRepository.findActiveById(id)
            .orElseThrow(() -> new NotFoundException("Song not found: " + id));

        if (!userId.equals(song.getUserId())) {
            throw new ForbiddenException("You do not own this song");
        }

        song.updatePreferences(req.prefAutoScrollSpeed(), req.prefTransposeSteps(), req.prefUseBb(), req.prefUseEb());
        songRepository.update(song);
    }
}
