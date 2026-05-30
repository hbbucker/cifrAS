package br.com.cifras.song.application.usecase;

import br.com.cifras.song.model.LyricsStructure;
import br.com.cifras.song.model.Song;
import br.com.cifras.song.dto.CreateSongRequest;
import br.com.cifras.song.dto.UpdateSongRequest;
import br.com.cifras.shared.dto.PagedResponse;
import br.com.cifras.shared.exception.ForbiddenException;
import br.com.cifras.shared.exception.NotFoundException;
import io.quarkus.test.junit.QuarkusTest;
import jakarta.inject.Inject;
import jakarta.transaction.Transactional;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.*;

/**
 * T8: SongService integration tests
 * Tests: 6
 * 1. create() persists song and returns it with correct userId
 * 2. listByUser() returns only songs of that user (isolation)
 * 3. listByUser() does NOT return soft-deleted songs
 * 4. update() throws ForbiddenException if user is not owner
 * 5. softDelete() marks deletedAt; song disappears from list
 * 6. findByIdAndUser() throws NotFoundException for another user's song
 */
import br.com.cifras.BaseIntegrationTest;

@QuarkusTest
class SongServiceTest extends BaseIntegrationTest {

    @Inject
    SongService songService;

    private static final String USER_A = "user-a-uuid";
    private static final String USER_B = "user-b-uuid";

    /**
     * Test 1: create() persists a song with the correct userId.
     */
    @Test
    @Transactional
    void givenValidRequest_whenCreate_thenSongPersistedWithUserId() {
        CreateSongRequest req = new CreateSongRequest("Highway to Hell", "AC/DC", "A", LyricsStructure.empty());

        Song song = songService.create(req, USER_A);

        assertNotNull(song.getId());
        assertEquals("Highway to Hell", song.getTitle());
        assertEquals(USER_A, song.getUserId());
        assertNotNull(song.getCreatedAt());
    }

    /**
     * Test 2: listByUser() returns only songs belonging to USER_A, not USER_B.
     */
    @Test
    @Transactional
    void givenMultipleUsers_whenListByUser_thenReturnsOnlyOwnSongs() {
        songService.create(new CreateSongRequest("Song A1", "Artist A", "C", null), USER_A);
        songService.create(new CreateSongRequest("Song A2", "Artist A", "D", null), USER_A);
        songService.create(new CreateSongRequest("Song B1", "Artist B", "E", null), USER_B);

        PagedResponse<Song> response = songService.listByUser(USER_A, 1, 20, null);

        assertTrue(response.data().stream().allMatch(s -> USER_A.equals(s.getUserId())),
            "List must contain only USER_A's songs");
        assertTrue(response.data().size() >= 2);
    }

    /**
     * Test 3: Soft-deleted songs do not appear in listings.
     */
    @Test
    @Transactional
    void givenSoftDeletedSong_whenListByUser_thenNotIncluded() {
        Song song = songService.create(new CreateSongRequest("To Delete", "Artist", "G", null), USER_A);

        songService.softDelete(song.getId(), USER_A);

        PagedResponse<Song> response = songService.listByUser(USER_A, 1, 20, null);
        boolean found = response.data().stream().anyMatch(s -> s.getId().equals(song.getId()));
        assertFalse(found, "Soft-deleted song must not appear in list");
    }

    /**
     * Test 4: update() throws ForbiddenException when USER_B tries to update USER_A's song.
     */
    @Test
    @Transactional
    void givenOtherUserSong_whenUpdate_thenThrowsForbiddenException() {
        Song song = songService.create(new CreateSongRequest("Protected Song", "Artist", "C", null), USER_A);
        UpdateSongRequest updateReq = new UpdateSongRequest("Hacked Title", "Hacker", "X", null);

        assertThrows(ForbiddenException.class,
            () -> songService.update(song.getId(), updateReq, USER_B));
    }

    /**
     * Test 5: softDelete() marks deletedAt; song returns 404 on subsequent findByIdAndUser.
     */
    @Test
    @Transactional
    void givenExistingSong_whenSoftDelete_thenDisappearsFromActiveRecords() {
        Song song = songService.create(new CreateSongRequest("Deletable", "Artist", "D", null), USER_A);
        java.util.UUID songId = song.getId();

        songService.softDelete(songId, USER_A);

        assertThrows(NotFoundException.class,
            () -> songService.findByIdAndUser(songId, USER_A));
    }

    /**
     * Test 6: findByIdAndUser() throws NotFoundException when USER_B accesses USER_A's song.
     */
    @Test
    @Transactional
    void givenOtherUserSong_whenFindByIdAndUser_thenThrowsNotFoundException() {
        Song song = songService.create(new CreateSongRequest("Private Song", "Artist", "E", null), USER_A);

        assertThrows(NotFoundException.class,
            () -> songService.findByIdAndUser(song.getId(), USER_B));
    }
}
