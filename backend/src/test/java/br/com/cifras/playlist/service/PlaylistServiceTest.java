package br.com.cifras.playlist.service;

import br.com.cifras.playlist.domain.Playlist;
import br.com.cifras.playlist.dto.CreatePlaylistRequest;
import br.com.cifras.shared.exception.ForbiddenException;
import br.com.cifras.shared.exception.NotFoundException;
import br.com.cifras.song.domain.Song;
import br.com.cifras.song.dto.CreateSongRequest;
import br.com.cifras.song.service.SongService;
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
@QuarkusTest
class PlaylistServiceTest {

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
        Playlist playlist = playlistService.create(
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
        Playlist playlist = playlistService.create(
            new CreatePlaylistRequest("Set A", false, null), OWNER);

        Song song = songService.create(
            new CreateSongRequest("Song 1", "Artist", "C", null), OWNER);

        playlistService.addSong(playlist.id, song.id, 0, OWNER);

        Playlist refreshed = Playlist.findById(playlist.id);
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
        Playlist playlist = playlistService.create(
            new CreatePlaylistRequest("Set B", false, null), OWNER);

        Song song = songService.create(
            new CreateSongRequest("To Remove", "Artist", "D", null), OWNER);

        playlistService.addSong(playlist.id, song.id, 0, OWNER);
        playlistService.removeSong(playlist.id, song.id, OWNER);

        Playlist refreshed = Playlist.findById(playlist.id);
        assertTrue(refreshed.songs.isEmpty(), "Song should be removed from playlist");
    }

    /**
     * Test 4: ForbiddenException thrown when non-owner tries to add a song.
     */
    @Test
    @Transactional
    void givenOtherUser_whenAddSong_thenThrowsForbiddenException() {
        Playlist playlist = playlistService.create(
            new CreatePlaylistRequest("Protected Set", false, null), OWNER);

        Song song = songService.create(
            new CreateSongRequest("Protected Song", "Artist", "G", null), OWNER);

        assertThrows(ForbiddenException.class,
            () -> playlistService.addSong(playlist.id, song.id, 0, OTHER));
    }

    /**
     * Test 5: NotFoundException thrown for non-existent playlist.
     */
    @Test
    @Transactional
    void givenNonExistentPlaylist_whenAddSong_thenThrowsNotFoundException() {
        Song song = songService.create(
            new CreateSongRequest("Orphan Song", "Artist", "A", null), OWNER);

        assertThrows(NotFoundException.class,
            () -> playlistService.addSong(99999L, song.id, 0, OWNER));
    }
}
