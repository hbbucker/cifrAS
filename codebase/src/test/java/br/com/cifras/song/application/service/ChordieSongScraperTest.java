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
}
