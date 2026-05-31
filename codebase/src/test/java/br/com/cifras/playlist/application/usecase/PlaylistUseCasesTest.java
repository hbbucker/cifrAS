package br.com.cifras.playlist.application.usecase;

import br.com.cifras.playlist.model.Playlist;
import br.com.cifras.playlist.infra.persistence.repository.PlaylistRepository;
import br.com.cifras.playlist.dto.CreatePlaylistRequest;
import br.com.cifras.shared.exception.ForbiddenException;
import br.com.cifras.shared.exception.NotFoundException;
import br.com.cifras.song.model.Song;
import br.com.cifras.song.dto.CreateSongRequest;
import br.com.cifras.song.application.usecase.CreateSongUseCase;
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
class PlaylistUseCasesTest extends BaseIntegrationTest {

    @Inject
    CreatePlaylistUseCase createPlaylistUseCase;

    @Inject
    AddSongToPlaylistUseCase addSongToPlaylistUseCase;

    @Inject
    RemoveSongFromPlaylistUseCase removeSongFromPlaylistUseCase;

    @Inject
    PlaylistRepository playlistRepository;

    @Inject
    CreateSongUseCase createSongUseCase;

    private static final String OWNER = "playlist-owner-uuid";
    private static final String OTHER = "playlist-other-uuid";

    /**
     * Test 1: create() persists playlist with correct userId and name.
     */
    @Test
    @Transactional
    void givenValidRequest_whenCreate_thenPlaylistPersisted() {
        Playlist playlist = createPlaylistUseCase.execute(
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
        Playlist playlist = createPlaylistUseCase.execute(
            new CreatePlaylistRequest("Set A", false, null), OWNER);

        Song song = createSongUseCase.execute(
            new CreateSongRequest("Song 1", "Artist", "C", null), OWNER);

        addSongToPlaylistUseCase.execute(playlist.getId(), song.getId(), 0, OWNER);

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
        Playlist playlist = createPlaylistUseCase.execute(
            new CreatePlaylistRequest("Set B", false, null), OWNER);

        Song song = createSongUseCase.execute(
            new CreateSongRequest("To Remove", "Artist", "D", null), OWNER);

        addSongToPlaylistUseCase.execute(playlist.getId(), song.getId(), 0, OWNER);
        removeSongFromPlaylistUseCase.execute(playlist.getId(), song.getId(), OWNER);

        Playlist refreshed = playlistRepository.findActiveById(playlist.getId()).orElseThrow();
        assertTrue(refreshed.getSongs().isEmpty(), "Song should be removed from playlist");
    }

    /**
     * Test 4: ForbiddenException thrown when non-owner tries to add a song.
     */
    @Test
    @Transactional
    void givenOtherUser_whenAddSong_thenThrowsForbiddenException() {
        Playlist playlist = createPlaylistUseCase.execute(
            new CreatePlaylistRequest("Protected Set", false, null), OWNER);

        Song song = createSongUseCase.execute(
            new CreateSongRequest("Protected Song", "Artist", "G", null), OWNER);

        assertThrows(ForbiddenException.class,
            () -> addSongToPlaylistUseCase.execute(playlist.getId(), song.getId(), 0, OTHER));
    }

    /**
     * Test 5: NotFoundException thrown for non-existent playlist.
     */
    @Test
    @Transactional
    void givenNonExistentPlaylist_whenAddSong_thenThrowsNotFoundException() {
        Song song = createSongUseCase.execute(
            new CreateSongRequest("Orphan Song", "Artist", "A", null), OWNER);

        assertThrows(NotFoundException.class,
            () -> addSongToPlaylistUseCase.execute(java.util.UUID.randomUUID(), song.getId(), 0, OWNER));
    }
}
