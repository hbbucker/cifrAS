package br.com.cifras.playlist.application.usecase;

import br.com.cifras.playlist.model.Playlist;
import br.com.cifras.playlist.infra.persistence.repository.PlaylistRepository;
import br.com.cifras.playlist.dto.CreatePlaylistRequest;
import br.com.cifras.shared.exception.ForbiddenException;
import br.com.cifras.shared.exception.NotFoundException;
import br.com.cifras.song.model.Song;
import br.com.cifras.song.dto.CreateSongRequest;
import br.com.cifras.song.application.usecase.SongService;
import io.quarkus.test.junit.QuarkusTest;
import jakarta.inject.Inject;
import jakarta.transaction.Transactional;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.*;

/**
 * T11: PlaylistService integration tests
 */
import br.com.cifras.BaseIntegrationTest;

@QuarkusTest
class PlaylistServiceTest extends BaseIntegrationTest {

    @Inject
    PlaylistService playlistService;

    @Inject
    PlaylistRepository playlistRepository;

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

        assertNotNull(playlist.getId());
        assertEquals("My Setlist", playlist.getName());
        assertEquals(OWNER, playlist.getUserId());
        assertFalse(playlist.isCollaborative());
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

        playlistService.addSong(playlist.getId(), song.getId(), 0, OWNER);

        Playlist refreshed = playlistRepository.findActiveById(playlist.getId()).orElseThrow();
        assertEquals(1, refreshed.getSongs().size());
        assertEquals(song.getId(), refreshed.getSongs().get(0).getSong().getId());
        assertEquals(0, refreshed.getSongs().get(0).getPosition());
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

        playlistService.addSong(playlist.getId(), song.getId(), 0, OWNER);
        playlistService.removeSong(playlist.getId(), song.getId(), OWNER);

        Playlist refreshed = playlistRepository.findActiveById(playlist.getId()).orElseThrow();
        assertTrue(refreshed.getSongs().isEmpty(), "Song should be removed from playlist");
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
            () -> playlistService.addSong(playlist.getId(), song.getId(), 0, OTHER));
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
            () -> playlistService.addSong(java.util.UUID.randomUUID(), song.getId(), 0, OWNER));
    }
}
