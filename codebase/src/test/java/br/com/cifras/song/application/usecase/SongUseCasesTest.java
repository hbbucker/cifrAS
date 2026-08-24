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
class SongUseCasesTest extends BaseIntegrationTest {

    @Inject
    CreateSongUseCase createSongUseCase;

    @Inject
    ListUserSongsUseCase listUserSongsUseCase;

    @Inject
    GetSongUseCase getSongUseCase;

    @Inject
    UpdateSongUseCase updateSongUseCase;

    @Inject
    DeleteSongUseCase deleteSongUseCase;

    private static final String USER_A = "user-a-uuid";
    private static final String USER_B = "user-b-uuid";

    /**
     * Test 1: create() persists a song with the correct userId.
     */
    @Test
    @Transactional
    void givenValidRequest_whenCreate_thenSongPersistedWithUserId() {
        CreateSongRequest req = new CreateSongRequest("Highway to Hell", "AC/DC", "A", LyricsStructure.empty());

        Song song = createSongUseCase.execute(req, USER_A);

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
        createSongUseCase.execute(new CreateSongRequest("Song A1", "Artist A", "C", null), USER_A);
        createSongUseCase.execute(new CreateSongRequest("Song A2", "Artist A", "D", null), USER_A);
        createSongUseCase.execute(new CreateSongRequest("Song B1", "Artist B", "E", null), USER_B);

        PagedResponse<Song> response = listUserSongsUseCase.execute(USER_A, 1, 20, null);

        assertTrue(response.items().stream().allMatch(s -> USER_A.equals(s.getUserId())),
            "List must contain only USER_A's songs");
        assertTrue(response.items().size() >= 2);
    }

    /**
     * Test 3: Soft-deleted songs do not appear in listings.
     */
    @Test
    @Transactional
    void givenSoftDeletedSong_whenListByUser_thenNotIncluded() {
        Song song = createSongUseCase.execute(new CreateSongRequest("To Delete", "Artist", "G", null), USER_A);

        deleteSongUseCase.execute(song.getId(), USER_A);

        PagedResponse<Song> response = listUserSongsUseCase.execute(USER_A, 1, 20, null);
        boolean found = response.items().stream().anyMatch(s -> s.getId().equals(song.getId()));
        assertFalse(found, "Soft-deleted song must not appear in list");
    }

    /**
     * Test 4: update() throws ForbiddenException when USER_B tries to update USER_A's song.
     */
    @Test
    @Transactional
    void givenOtherUserSong_whenUpdate_thenThrowsForbiddenException() {
        Song song = createSongUseCase.execute(new CreateSongRequest("Protected Song", "Artist", "C", null), USER_A);
        UpdateSongRequest updateReq = new UpdateSongRequest("Hacked Title", "Hacker", "X", null);

        assertThrows(ForbiddenException.class,
            () -> updateSongUseCase.execute(song.getId(), updateReq, USER_B));
    }

    /**
     * Test 5: softDelete() marks deletedAt; song returns 404 on subsequent findByIdAndUser.
     */
    @Test
    @Transactional
    void givenExistingSong_whenSoftDelete_thenDisappearsFromActiveRecords() {
        Song song = createSongUseCase.execute(new CreateSongRequest("Deletable", "Artist", "D", null), USER_A);
        java.util.UUID songId = song.getId();

        deleteSongUseCase.execute(songId, USER_A);

        assertThrows(NotFoundException.class,
            () -> getSongUseCase.execute(songId, USER_A));
    }

    @Inject
    GetUserTagsUseCase getUserTagsUseCase;

    /**
     * Test 6: findByIdAndUser() throws NotFoundException when USER_B accesses USER_A's song.
     */
    @Test
    @Transactional
    void givenOtherUserSong_whenFindByIdAndUser_thenThrowsNotFoundException() {
        Song song = createSongUseCase.execute(new CreateSongRequest("Private Song", "Artist", "E", null), USER_A);

        assertThrows(NotFoundException.class,
            () -> getSongUseCase.execute(song.getId(), USER_B));
    }

    /**
     * Test 7: create, filter by tags and get tag counts.
     */
    @Test
    @Transactional
    void givenSongsWithTags_whenFilteredByTag_thenReturnsMatchingOnly() {
        String testUser = "user-tags-test-" + java.util.UUID.randomUUID();
        createSongUseCase.execute(new CreateSongRequest("Song Tag 1", "Artist 1", "C", LyricsStructure.empty(), java.util.List.of("Missa", "Entrada")), testUser);
        createSongUseCase.execute(new CreateSongRequest("Song Tag 2", "Artist 2", "D", LyricsStructure.empty(), java.util.List.of("Missa", "Comunhao")), testUser);
        createSongUseCase.execute(new CreateSongRequest("Song Tag 3", "Artist 3", "E", LyricsStructure.empty(), java.util.List.of("Rock")), testUser);

        PagedResponse<Song> missaSongs = listUserSongsUseCase.execute(testUser, 1, 10, null, java.util.List.of("Missa"));
        assertEquals(2, missaSongs.totalCount());

        PagedResponse<Song> entradaSongs = listUserSongsUseCase.execute(testUser, 1, 10, null, java.util.List.of("Entrada"));
        assertEquals(1, entradaSongs.totalCount());
        assertEquals("Song Tag 1", entradaSongs.items().get(0).getTitle());

        var tags = getUserTagsUseCase.execute(testUser);
        assertEquals(4, tags.size());
        assertEquals("Missa", tags.get(0).name());
        assertEquals(2, tags.get(0).count());
    }
}
