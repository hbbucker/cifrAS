package br.com.cifras.song.model;

import org.junit.jupiter.api.Test;
import java.util.ArrayList;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;

class SongTagsTest {

    @Test
    void testNormalizeTags_NullAndEmpty() {
        assertEquals(0, Song.normalizeTags(null).size());
        assertEquals(0, Song.normalizeTags(List.of()).size());
    }

    @Test
    void testNormalizeTags_TrimsAndRemovesBlanks() {
        List<String> raw = List.of("  Rock  ", "", "   ", "Pop");
        List<String> normalized = Song.normalizeTags(raw);
        assertEquals(List.of("Rock", "Pop"), normalized);
    }

    @Test
    void testNormalizeTags_RemovesDuplicates() {
        List<String> raw = List.of("Rock", "rock", "Rock", "POP", "POP");
        List<String> normalized = Song.normalizeTags(raw);
        assertEquals(List.of("Rock", "rock", "POP"), normalized);
    }

    @Test
    void testNormalizeTags_LimitsTo20TagsAnd30Chars() {
        List<String> raw = new ArrayList<>();
        for (int i = 0; i < 30; i++) {
            raw.add("tag-" + i + "-" + "a".repeat(40));
        }
        List<String> normalized = Song.normalizeTags(raw);
        assertEquals(20, normalized.size());
        assertTrue(normalized.get(0).length() <= 30);
    }

    @Test
    void testSongCreationWithTags() {
        Song song = Song.create("user1", "Title", "Artist", "C", LyricsStructure.empty(), List.of("Gospel", "Louvor"));
        assertEquals(List.of("Gospel", "Louvor"), song.getTags());

        song.updateDetails("New Title", "New Artist", "D", LyricsStructure.empty(), List.of("Worship"));
        assertEquals(List.of("Worship"), song.getTags());
    }

    @Test
    void testSongClonePreservesTags() {
        Song original = Song.create("user1", "Title", "Artist", "C", LyricsStructure.empty(), List.of("Missa", "Entrada"));
        Song clone = Song.createCloneForUser(original, "user2");

        assertEquals(List.of("Missa", "Entrada"), clone.getTags());
        assertNotSame(original.getTags(), clone.getTags());
    }
}
