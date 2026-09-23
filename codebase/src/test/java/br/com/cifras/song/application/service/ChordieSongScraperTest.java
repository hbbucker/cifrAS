package br.com.cifras.song.application.service;

import br.com.cifras.song.dto.CreateSongRequest;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.*;

class ChordieSongScraperTest {

    private ChordieSongScraper scraper;

    @BeforeEach
    void setUp() {
        scraper = new ChordieSongScraper();
    }

    @Test
    void testSupports() {
        assertTrue(scraper.supports("https://www.chordie.com/cifra.php/song/eagles/hotel-california/"));
        assertFalse(scraper.supports("https://lacuerda.net"));
        assertFalse(scraper.supports(null));
        assertEquals("chordie", scraper.getProviderName());
    }

    @Test
    void testParseHtmlChordPro() {
        String html = """
                <!DOCTYPE html>
                <html>
                <head>
                    <title>Hotel California Chords by Eagles @ Chordie</title>
                </head>
                <body>
                    <pre>
                    {title: Hotel California}
                    {artist: Eagles}
                    {key: Bm}
                    
                    {c: Verse 1}
                    [Bm]On a dark desert highway [F#7]cool wind in my hair
                    </pre>
                </body>
                </html>
                """;

        CreateSongRequest request = scraper.parseHtml(html);

        assertEquals("Hotel California", request.title());
        assertEquals("Eagles", request.artist());
        assertEquals("Bm", request.originalKey());
        assertTrue(request.tags().contains("chordie"));
        assertTrue(request.tags().contains("imported"));
        assertEquals(1, request.lyrics().sections().size());
        assertEquals("Verse 1", request.lyrics().sections().get(0).label());
    }

    @Test
    void testParseHtmlPlainChordsFallback() {
        String html = """
                <!DOCTYPE html>
                <html>
                <head>
                    <title>Wish You Were Here - Pink Floyd - Chordie</title>
                </head>
                <body>
                    <pre>
                    [Intro]
                    Em7  G  Em7  G
                    
                    [Verse 1]
                    C                     D/F#
                    So, so you think you can tell
                    </pre>
                </body>
                </html>
                """;

        CreateSongRequest request = scraper.parseHtml(html);

        assertEquals("Wish You Were Here", request.title());
        assertEquals("Pink Floyd", request.artist());
        assertEquals("C", request.originalKey());
        assertEquals(2, request.lyrics().sections().size());
    }

    @Test
    void testParseHtmlSingleTitleAndNoPre() {
        String html = """
                <!DOCTYPE html>
                <html>
                <head>
                    <title>SomeRandomSong</title>
                </head>
                <body>
                </body>
                </html>
                """;

        CreateSongRequest request = scraper.parseHtml(html);
        assertEquals("SomeRandomSong", request.title());
        assertEquals("Unknown Artist", request.artist());
        assertTrue(request.lyrics().sections().isEmpty());
    }

    @Test
    void testScrapeAndParseInvalidUrlThrows() {
        assertThrows(RuntimeException.class, () -> scraper.scrapeAndParse("http://invalid-url-that-does-not-exist.local"));
    }
}
