package br.com.cifras.song.application.usecase;

import br.com.cifras.BaseIntegrationTest;
import br.com.cifras.shared.exception.ConflictException;
import br.com.cifras.shared.exception.ForbiddenException;
import br.com.cifras.shared.exception.NotFoundException;
import br.com.cifras.shared.security.UserService;
import br.com.cifras.song.dto.PendingSongShareItemDTO;
import br.com.cifras.song.infra.persistence.repository.SongRepository;
import br.com.cifras.song.infra.persistence.repository.SongShareRepository;
import br.com.cifras.song.model.Song;
import br.com.cifras.song.model.SongShare;
import br.com.cifras.song.model.SongShareStatus;
import io.quarkus.test.InjectMock;
import io.quarkus.test.junit.QuarkusTest;
import jakarta.inject.Inject;
import jakarta.transaction.Transactional;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.Mockito;

import java.util.List;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;

@QuarkusTest
class SongShareUseCasesTest extends BaseIntegrationTest {

    @Inject
    ShareSongUseCase shareSongUseCase;

    @Inject
    ListPendingSongSharesUseCase listPendingSongSharesUseCase;

    @Inject
    AcceptSongShareUseCase acceptSongShareUseCase;

    @Inject
    DeclineSongShareUseCase declineSongShareUseCase;

    @Inject
    SongRepository songRepository;

    @Inject
    SongShareRepository songShareRepository;

    @InjectMock
    UserService userService;

    private static final String SENDER_ID = "sender-user-id";
    private static final String RECEIVER_ID = "receiver-user-id";
    private static final String RECEIVER_EMAIL = "receiver@cifras.com";

    @BeforeEach
    void setupMocks() {
        Mockito.when(userService.getUserIdByEmail(RECEIVER_EMAIL)).thenReturn(RECEIVER_ID);
        Mockito.when(userService.getUserIdByEmail("unknown@cifras.com")).thenReturn(null);
    }

    private Song createTestSong(String userId, String title) {
        Song song = Song.create(userId, title, "Artista", "C", null);
        songRepository.persist(song);
        return song;
    }

    @Test
    @Transactional
    void givenValidSongAndRecipient_whenShareSong_thenShareIsCreatedPending() {
        Song song = createTestSong(SENDER_ID, "Música Compartilhada");

        SongShare share = shareSongUseCase.execute(song.getId(), RECEIVER_EMAIL, SENDER_ID);

        assertNotNull(share.getId());
        assertEquals(song.getId(), share.getSongId());
        assertEquals(SENDER_ID, share.getInviterId());
        assertEquals(RECEIVER_EMAIL, share.getInviteeEmail());
        assertEquals(SongShareStatus.PENDING, share.getStatus());
    }

    @Test
    @Transactional
    void givenBlankEmail_whenShareSong_thenThrowsIllegalArgumentException() {
        Song song = createTestSong(SENDER_ID, "Música 1");

        assertThrows(IllegalArgumentException.class, () ->
            shareSongUseCase.execute(song.getId(), "   ", SENDER_ID)
        );
    }

    @Test
    @Transactional
    void givenNonExistentSong_whenShareSong_thenThrowsNotFoundException() {
        assertThrows(NotFoundException.class, () ->
            shareSongUseCase.execute(UUID.randomUUID(), RECEIVER_EMAIL, SENDER_ID)
        );
    }

    @Test
    @Transactional
    void givenSongOwnedByAnother_whenShareSong_thenThrowsForbiddenException() {
        Song song = createTestSong("another-user", "Música Alheia");

        assertThrows(ForbiddenException.class, () ->
            shareSongUseCase.execute(song.getId(), RECEIVER_EMAIL, SENDER_ID)
        );
    }

    @Test
    @Transactional
    void givenUnregisteredEmail_whenShareSong_thenThrowsNotFoundException() {
        Song song = createTestSong(SENDER_ID, "Música 2");

        assertThrows(NotFoundException.class, () ->
            shareSongUseCase.execute(song.getId(), "unknown@cifras.com", SENDER_ID)
        );
    }

    @Test
    @Transactional
    void givenSelfEmail_whenShareSong_thenThrowsIllegalArgumentException() {
        Song song = createTestSong(SENDER_ID, "Música Auto");
        Mockito.when(userService.getUserIdByEmail("sender@cifras.com")).thenReturn(SENDER_ID);

        assertThrows(IllegalArgumentException.class, () ->
            shareSongUseCase.execute(song.getId(), "sender@cifras.com", SENDER_ID)
        );
    }

    @Test
    @Transactional
    void givenDuplicatePendingShare_whenShareSong_thenThrowsConflictException() {
        Song song = createTestSong(SENDER_ID, "Música Duplicada");
        shareSongUseCase.execute(song.getId(), RECEIVER_EMAIL, SENDER_ID);

        assertThrows(ConflictException.class, () ->
            shareSongUseCase.execute(song.getId(), RECEIVER_EMAIL, SENDER_ID)
        );
    }

    @Test
    @Transactional
    void givenPendingShares_whenListPending_thenReturnsPendingItemsWithSongDetails() {
        Song song = createTestSong(SENDER_ID, "Música para Listar");
        shareSongUseCase.execute(song.getId(), RECEIVER_EMAIL, SENDER_ID);

        List<PendingSongShareItemDTO> pending = listPendingSongSharesUseCase.execute(RECEIVER_EMAIL);

        assertFalse(pending.isEmpty());
        PendingSongShareItemDTO item = pending.stream()
                .filter(p -> p.songId().equals(song.getId()))
                .findFirst()
                .orElse(null);

        assertNotNull(item);
        assertEquals("Música para Listar", item.songTitle());
        assertEquals("Artista", item.songArtist());
        assertEquals(RECEIVER_EMAIL, item.inviteeEmail());
    }

    @Test
    @Transactional
    void givenNullEmail_whenListPending_thenReturnsEmptyList() {
        List<PendingSongShareItemDTO> pending = listPendingSongSharesUseCase.execute(null);
        assertTrue(pending.isEmpty());
    }

    @Test
    @Transactional
    void givenValidShare_whenAccept_thenSongIsClonedForReceiverAndStatusIsAccepted() {
        Song song = createTestSong(SENDER_ID, "Música para Aceitar");
        SongShare share = shareSongUseCase.execute(song.getId(), RECEIVER_EMAIL, SENDER_ID);

        Song clonedSong = acceptSongShareUseCase.execute(share.getId(), RECEIVER_EMAIL, RECEIVER_ID);

        assertNotNull(clonedSong.getId());
        assertNotEquals(song.getId(), clonedSong.getId());
        assertEquals(RECEIVER_ID, clonedSong.getUserId());
        assertEquals("Música para Aceitar", clonedSong.getTitle());

        SongShare updatedShare = songShareRepository.findById(share.getId()).orElseThrow();
        assertEquals(SongShareStatus.ACCEPTED, updatedShare.getStatus());
    }

    @Test
    @Transactional
    void givenShareForDifferentUser_whenAccept_thenThrowsForbiddenException() {
        Song song = createTestSong(SENDER_ID, "Música");
        SongShare share = shareSongUseCase.execute(song.getId(), RECEIVER_EMAIL, SENDER_ID);

        assertThrows(ForbiddenException.class, () ->
            acceptSongShareUseCase.execute(share.getId(), "wrong@cifras.com", "other-user")
        );
    }

    @Test
    @Transactional
    void givenNonPendingShare_whenAccept_thenThrowsIllegalStateException() {
        Song song = createTestSong(SENDER_ID, "Música");
        SongShare share = shareSongUseCase.execute(song.getId(), RECEIVER_EMAIL, SENDER_ID);
        acceptSongShareUseCase.execute(share.getId(), RECEIVER_EMAIL, RECEIVER_ID);

        assertThrows(IllegalStateException.class, () ->
            acceptSongShareUseCase.execute(share.getId(), RECEIVER_EMAIL, RECEIVER_ID)
        );
    }

    @Test
    @Transactional
    void givenValidShare_whenDecline_thenStatusIsDeclinedAndNoSongCreated() {
        Song song = createTestSong(SENDER_ID, "Música para Recusar");
        SongShare share = shareSongUseCase.execute(song.getId(), RECEIVER_EMAIL, SENDER_ID);

        declineSongShareUseCase.execute(share.getId(), RECEIVER_EMAIL);

        SongShare updatedShare = songShareRepository.findById(share.getId()).orElseThrow();
        assertEquals(SongShareStatus.DECLINED, updatedShare.getStatus());

        List<Song> receiverSongs = songRepository.findByUserIdActive(RECEIVER_ID, 1, 10, null);
        assertFalse(receiverSongs.stream().anyMatch(s -> s.getTitle().equals("Música para Recusar")));
    }

    @Test
    @Transactional
    void givenShareForDifferentUser_whenDecline_thenThrowsForbiddenException() {
        Song song = createTestSong(SENDER_ID, "Música");
        SongShare share = shareSongUseCase.execute(song.getId(), RECEIVER_EMAIL, SENDER_ID);

        assertThrows(ForbiddenException.class, () ->
            declineSongShareUseCase.execute(share.getId(), "wrong@cifras.com")
        );
    }

    @Test
    @Transactional
    void givenNonPendingShare_whenDecline_thenThrowsIllegalStateException() {
        Song song = createTestSong(SENDER_ID, "Música");
        SongShare share = shareSongUseCase.execute(song.getId(), RECEIVER_EMAIL, SENDER_ID);
        declineSongShareUseCase.execute(share.getId(), RECEIVER_EMAIL);

        assertThrows(IllegalStateException.class, () ->
            declineSongShareUseCase.execute(share.getId(), RECEIVER_EMAIL)
        );
    }
}
