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
        assertTrue(scraper.supports("https://echords.com/tab/123"));
        assertFalse(scraper.supports("https://cifraclub.com.br"));
        assertFalse(scraper.supports(null));
        assertEquals("e-chords", scraper.getProviderName());
    }

    @Test
    void testParseHtmlWithCorePre() {
        String html = """
                <!DOCTYPE html>
                <html>
                <head>
                    <title>More Than Words chords by Extreme - E-Chords</title>
                </head>
                <body>
                    <p>Key: <b>G#m</b></p>
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
        assertEquals("G#m", request.originalKey());
        assertTrue(request.tags().contains("e-chords"));
        assertTrue(request.tags().contains("imported"));
        assertEquals(2, request.lyrics().sections().size());
    }

    @Test
    void testParseHtmlGenericPreFallback() {
        String html = """
                <!DOCTYPE html>
                <html>
                <head>
                    <title>Simple Track - Band Name @ E-Chords</title>
                </head>
                <body>
                    <pre>
                    [Intro]
                    C  G  Am  F
                    </pre>
                </body>
                </html>
                """;

        CreateSongRequest request = scraper.parseHtml(html);
        assertEquals("Simple Track", request.title());
        assertEquals("Band Name", request.artist());
        assertEquals("C", request.originalKey());
        assertEquals(1, request.lyrics().sections().size());
    }

    @Test
    void testParseHtmlSingleTitleAndNoPre() {
        String html = """
                <!DOCTYPE html>
                <html>
                <head>
                    <title>JustATitle</title>
                </head>
                <body>
                </body>
                </html>
                """;

        CreateSongRequest request = scraper.parseHtml(html);
        assertEquals("JustATitle", request.title());
        assertEquals("Unknown Artist", request.artist());
        assertTrue(request.lyrics().sections().isEmpty());
    }

    @Test
    void testScrapeAndParseInvalidUrlThrows() {
        assertThrows(RuntimeException.class, () -> scraper.scrapeAndParse("http://invalid-url-that-does-not-exist.local"));
    }
}
