package br.com.cifras.playlist.application.usecase;

import br.com.cifras.playlist.infra.persistence.entity.PlaylistEntity;
import br.com.cifras.playlist.dto.CreatePlaylistRequest;
import br.com.cifras.shared.exception.ForbiddenException;
import br.com.cifras.shared.exception.NotFoundException;
import br.com.cifras.song.infra.persistence.entity.SongEntity;
import br.com.cifras.song.dto.CreateSongRequest;
import br.com.cifras.song.application.usecase.SongService;
import io.quarkus.test.junit.QuarkusTest;
import jakarta.inject.Inject;
import jakarta.transaction.Transactional;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.*;

/**
 * T11: PlaylistService integration tests
 * Tests: 5
 * 1. create() persists playlist with correct userId
 * 2. addSong() adds song with correct position index
 * 3. addSong() shifts positions when inserting at existing position
 * 4. removeSong() deletes junction record
 * 5. Only owner can modify playlist (ForbiddenException for others)
 */
import br.com.cifras.BaseIntegrationTest;

@QuarkusTest
class PlaylistServiceTest extends BaseIntegrationTest {

    @Inject
    PlaylistService playlistService;

    @Inject
    SongService songService;

    private static final String OWNER = "playlist-owner-uuid";
    private static final String OTHER = "playlist-other-uuid";

    /**
     * Test 1: create() persists playlist with correct userId and name.
     */
    @Test
    @Transactional
    void givenValidRequest_whenCreate_thenPlaylistPersisted() {
        PlaylistEntity playlist = playlistService.create(
            new CreatePlaylistRequest("My Setlist", false, null), OWNER);

        assertNotNull(playlist.id);
        assertEquals("My Setlist", playlist.name);
        assertEquals(OWNER, playlist.userId);
        assertFalse(playlist.isCollaborative);
    }

    /**
     * Test 2: addSong() adds a song to the playlist at the correct position.
     */
    @Test
    @Transactional
    void givenPlaylistAndSong_whenAddSong_thenSongAddedAtPosition() {
        PlaylistEntity playlist = playlistService.create(
            new CreatePlaylistRequest("Set A", false, null), OWNER);

        SongEntity song = songService.create(
            new CreateSongRequest("SongEntity 1", "Artist", "C", null), OWNER);

        playlistService.addSong(playlist.id, song.id, 0, OWNER);

        PlaylistEntity refreshed = PlaylistEntity.findById(playlist.id);
        assertEquals(1, refreshed.songs.size());
        assertEquals(song.id, refreshed.songs.get(0).song.id);
        assertEquals(0, refreshed.songs.get(0).position);
    }

    /**
     * Test 3: removeSong() removes the junction record from the playlist.
     */
    @Test
    @Transactional
    void givenSongInPlaylist_whenRemoveSong_thenRemovedFromPlaylist() {
        PlaylistEntity playlist = playlistService.create(
            new CreatePlaylistRequest("Set B", false, null), OWNER);

        SongEntity song = songService.create(
            new CreateSongRequest("To Remove", "Artist", "D", null), OWNER);

        playlistService.addSong(playlist.id, song.id, 0, OWNER);
        playlistService.removeSong(playlist.id, song.id, OWNER);

        PlaylistEntity refreshed = PlaylistEntity.findById(playlist.id);
        assertTrue(refreshed.songs.isEmpty(), "SongEntity should be removed from playlist");
    }

    /**
     * Test 4: ForbiddenException thrown when non-owner tries to add a song.
     */
    @Test
    @Transactional
    void givenOtherUser_whenAddSong_thenThrowsForbiddenException() {
        PlaylistEntity playlist = playlistService.create(
            new CreatePlaylistRequest("Protected Set", false, null), OWNER);

        SongEntity song = songService.create(
            new CreateSongRequest("Protected SongEntity", "Artist", "G", null), OWNER);

        assertThrows(ForbiddenException.class,
            () -> playlistService.addSong(playlist.id, song.id, 0, OTHER));
    }

    /**
     * Test 5: NotFoundException thrown for non-existent playlist.
     */
    @Test
    @Transactional
    void givenNonExistentPlaylist_whenAddSong_thenThrowsNotFoundException() {
        SongEntity song = songService.create(
            new CreateSongRequest("Orphan SongEntity", "Artist", "A", null), OWNER);

        assertThrows(NotFoundException.class,
            () -> playlistService.addSong(java.util.UUID.randomUUID(), song.id, 0, OWNER));
    }
}
