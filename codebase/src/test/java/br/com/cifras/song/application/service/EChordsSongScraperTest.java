package br.com.cifras.song.application.service;

import br.com.cifras.song.dto.CreateSongRequest;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.*;

class EChordsSongScraperTest {

    private EChordsSongScraper scraper;

    @BeforeEach
    void setUp() {
        scraper = new EChordsSongScraper();
    }

    @Test
    void testSupports() {
        assertTrue(scraper.supports("https://www.e-chords.com/chords/extreme/more-than-words"));
        assertFalse(scraper.supports("https://cifraclub.com.br"));
        assertEquals("e-chords", scraper.getProviderName());
    }

    @Test
    void testParseHtml() {
        String html = """
                <!DOCTYPE html>
                <html>
                <head>
                    <title>More Than Words chords by Extreme - E-Chords</title>
                </head>
                <body>
                    <p>Key: <b>G</b></p>
                    <pre id="core">
                    [Intro]
                    <u>G</u>  <u>Cadd9</u>  <u>Am7</u>  <u>C</u>  <u>D</u>  <u>G</u>
                    
                    [Verse 1]
                    <u>G</u>           <u>Cadd9</u>
                    Saying I love you is
                    <u>Am7</u>             <u>C</u>      <u>D</u>        <u>G</u>
                    Not the words I want to hear from you
                    </pre>
                </body>
                </html>
                """;

        CreateSongRequest request = scraper.parseHtml(html);

        assertEquals("More Than Words", request.title());
        assertEquals("Extreme", request.artist());
        assertEquals("G", request.originalKey());
        assertTrue(request.tags().contains("e-chords"));
        assertTrue(request.tags().contains("imported"));
        assertEquals(2, request.lyrics().sections().size());
    }
}
