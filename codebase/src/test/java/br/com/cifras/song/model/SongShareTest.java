package br.com.cifras.song.model;

import org.junit.jupiter.api.Test;

import java.util.List;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;

class SongShareTest {

    @Test
    void givenValidData_whenCreate_thenSongShareIsPending() {
        UUID songId = UUID.randomUUID();
        String inviterId = "inviter-123";
        String inviteeEmail = "DESTINATARIO@TESTE.COM";

        SongShare share = SongShare.create(songId, inviterId, inviteeEmail);

        assertNotNull(share);
        assertEquals(songId, share.getSongId());
        assertEquals(inviterId, share.getInviterId());
        assertEquals("destinatario@teste.com", share.getInviteeEmail());
        assertEquals(SongShareStatus.PENDING, share.getStatus());
        assertNotNull(share.getCreatedAt());
        assertNotNull(share.getUpdatedAt());
    }

    @Test
    void givenNullSongId_whenCreate_thenThrowsIllegalArgumentException() {
        assertThrows(IllegalArgumentException.class, () -> 
            SongShare.create(null, "inviter", "email@test.com")
        );
    }

    @Test
    void givenBlankInviterId_whenCreate_thenThrowsIllegalArgumentException() {
        assertThrows(IllegalArgumentException.class, () -> 
            SongShare.create(UUID.randomUUID(), "   ", "email@test.com")
        );
    }

    @Test
    void givenBlankInviteeEmail_whenCreate_thenThrowsIllegalArgumentException() {
        assertThrows(IllegalArgumentException.class, () -> 
            SongShare.create(UUID.randomUUID(), "inviter", "")
        );
    }

    @Test
    void givenPendingShare_whenAccept_thenStatusIsAccepted() {
        SongShare share = SongShare.create(UUID.randomUUID(), "inviter", "email@test.com");
        share.accept();

        assertEquals(SongShareStatus.ACCEPTED, share.getStatus());
    }

    @Test
    void givenPendingShare_whenDecline_thenStatusIsDeclined() {
        SongShare share = SongShare.create(UUID.randomUUID(), "inviter", "email@test.com");
        share.decline();

        assertEquals(SongShareStatus.DECLINED, share.getStatus());
    }

    @Test
    void givenNonPendingShare_whenAcceptOrDecline_thenThrowsIllegalStateException() {
        SongShare share = SongShare.create(UUID.randomUUID(), "inviter", "email@test.com");
        share.accept();

        assertThrows(IllegalStateException.class, share::accept);
        assertThrows(IllegalStateException.class, share::decline);
    }

    @Test
    void givenOriginalSong_whenCreateCloneForUser_thenFieldsAreClonedAndPreferencesReset() {
        ChordPosition chord = new ChordPosition("C", 0);
        Line line = new Line(List.of(chord), "Texto de teste");
        Section section = new Section("Verso", List.of(line));
        LyricsStructure lyrics = new LyricsStructure(List.of(section));

        Song original = Song.create("owner-uuid", "Música Original", "Artista Teste", "C", lyrics);
        original.toggleFavorite();
        original.updatePreferences(5, 2, true, true);

        Song clone = Song.createCloneForUser(original, "recipient-uuid");

        assertNotNull(clone);
        assertEquals("recipient-uuid", clone.getUserId());
        assertEquals("Música Original", clone.getTitle());
        assertEquals("Artista Teste", clone.getArtist());
        assertEquals("C", clone.getOriginalKey());
        assertEquals(lyrics, clone.getLyrics());
        assertFalse(clone.getIsFavorite());
        assertFalse(clone.getPrefUseBb());
        assertFalse(clone.getPrefUseEb());
        assertEquals(1, clone.getPrefAutoScrollSpeed());
        assertEquals(0, clone.getPrefTransposeSteps());
    }

    @Test
    void givenNullOriginal_whenCreateClone_thenThrowsIllegalArgumentException() {
        assertThrows(IllegalArgumentException.class, () -> Song.createCloneForUser(null, "user-id"));
    }

    @Test
    void givenBlankUserId_whenCreateClone_thenThrowsIllegalArgumentException() {
        Song original = Song.create("owner-uuid", "Título", "Artista", "C", null);
        assertThrows(IllegalArgumentException.class, () -> Song.createCloneForUser(original, "  "));
    }
}
