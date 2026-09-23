package br.com.cifras.song.application.parser;

import br.com.cifras.song.model.LyricsStructure;
import br.com.cifras.song.model.Section;
import br.com.cifras.song.model.Line;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.*;

class ChordProParserTest {

    @Test
    void testParseBasicChordPro() {
        String chordPro = """
                {title: Amazing Grace}
                {artist: John Newton}
                {key: G}
                
                {c: Verse 1}
                [G]Amazing [G7]grace how [C]sweet the [G]sound
                That [G]saved a [Em]wretch like [D]me
                
                {soc}
                [C]Praise [G]God, [C]praise [G]God
                {eoc}
                """;

        ChordProParser.ParseResult result = ChordProParser.parse(chordPro);

        assertEquals("Amazing Grace", result.getTitle());
        assertEquals("John Newton", result.getArtist());
        assertEquals("G", result.getKey());

        LyricsStructure lyrics = result.getLyrics();
        assertEquals(2, lyrics.sections().size());

        Section verse1 = lyrics.sections().get(0);
        assertEquals("Verse 1", verse1.label());
        assertEquals(2, verse1.lines().size());

        Line line1 = verse1.lines().get(0);
        assertEquals("Amazing grace how sweet the sound", line1.text());
        assertEquals(4, line1.chords().size());
        assertEquals("G", line1.chords().get(0).chord());
        assertEquals(0, line1.chords().get(0).position());
        assertEquals("G7", line1.chords().get(1).chord());
        assertEquals(8, line1.chords().get(1).position());

        Section chorus = lyrics.sections().get(1);
        assertEquals("Chorus", chorus.label());
    }

    @Test
    void testParseEmptyAndEdgeCases() {
        ChordProParser.ParseResult empty = ChordProParser.parse("");
        assertTrue(empty.getLyrics().sections().isEmpty());
        assertNull(empty.getTitle());

        ChordProParser.ParseResult nullResult = ChordProParser.parse(null);
        assertTrue(nullResult.getLyrics().sections().isEmpty());
    }
}
