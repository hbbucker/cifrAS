package br.com.cifras.song.application.parser;

import br.com.cifras.song.model.LyricsStructure;
import br.com.cifras.song.model.Section;
import br.com.cifras.song.model.Line;
import br.com.cifras.song.model.ChordPosition;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.assertEquals;

class CifraClubParserTest {

    @Test
    void testParse() {
        String text = """
                [Intro - Ah Jesus]
                
                C7M  G/B  Am7  A7(2)  Am7
                
                [Primeira Parte - Ah Jesus]
                
                  G
                Quem foi muito perdoado
                
                 G9                            Em7
                Deveria saber o valor de ser amado
                """;

        LyricsStructure lyrics = CifraClubParser.parse(text);
        
        assertEquals(2, lyrics.sections().size());
        
        Section intro = lyrics.sections().get(0);
        assertEquals("Intro - Ah Jesus", intro.label());
        // Intro should have an empty lyric line with 5 chords
        Line introLine = intro.lines().get(0);
        assertEquals("", introLine.text());
        assertEquals(5, introLine.chords().size());
        assertEquals("C7M", introLine.chords().get(0).chord());
        assertEquals(0, introLine.chords().get(0).position());
        assertEquals("G/B", introLine.chords().get(1).chord());
        assertEquals("A7(2)", introLine.chords().get(3).chord());

        Section part1 = lyrics.sections().get(1);
        assertEquals("Primeira Parte - Ah Jesus", part1.label());
        
        Line line1 = part1.lines().get(0);
        assertEquals("Quem foi muito perdoado", line1.text());
        assertEquals(1, line1.chords().size());
        assertEquals("G", line1.chords().get(0).chord());
        assertEquals(2, line1.chords().get(0).position());
        
        Line line2 = part1.lines().get(2);
        assertEquals("Deveria saber o valor de ser amado", line2.text());
        assertEquals(2, line2.chords().size());
        assertEquals("G9", line2.chords().get(0).chord());
        assertEquals(1, line2.chords().get(0).position());
        assertEquals("Em7", line2.chords().get(1).chord());
        assertEquals(31, line2.chords().get(1).position());
    }
}
