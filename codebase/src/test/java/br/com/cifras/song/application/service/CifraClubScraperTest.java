package br.com.cifras.song.application.service;

import br.com.cifras.song.dto.CreateSongRequest;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.*;

class CifraClubScraperTest {

    private CifraClubScraper scraper;

    @BeforeEach
    void setUp() {
        scraper = new CifraClubScraper();
    }

    @Test
    void testSupports() {
        assertTrue(scraper.supports("https://www.cifraclub.com.br/legiao-urbana/tempo-perdido/"));
        assertTrue(scraper.supports("https://cifraclub.com/art/song"));
        assertFalse(scraper.supports("https://ultimate-guitar.com"));
        assertFalse(scraper.supports(null));
        assertEquals("cifraclub", scraper.getProviderName());
    }

    @Test
    void testParseHtml() {
        String html = """
                <!DOCTYPE html>
                <html>
                <head>
                    <title>Tempo Perdido - Legião Urbana - Cifra Club</title>
                </head>
                <body>
                    <div id="cifra_tom">Tom: <a>C</a></div>
                    <pre>
                    [Intro]
                    <b>C</b>  <b>Am7</b>  <b>Bm</b>  <b>Em</b>
                    
                    [Primeira Parte]
                    <b>C</b>
                    Todos os dias quando acordo
                    </pre>
                </body>
                </html>
                """;

        CreateSongRequest req = scraper.parseHtml(html);
        assertEquals("Tempo Perdido", req.title());
        assertEquals("Legião Urbana", req.artist());
        assertEquals("C", req.originalKey());
        assertTrue(req.tags().contains("cifraclub"));
        assertTrue(req.tags().contains("imported"));
        assertEquals(2, req.lyrics().sections().size());
    }

    @Test
    void testParseHtmlFallbackKeyAndSingleTitle() {
        String html = """
                <!DOCTYPE html>
                <html>
                <head>
                    <title>Sozinho - Cifra Club</title>
                </head>
                <body>
                    <span>Tom: <b>F#m</b></span>
                    <pre>
                    [Intro]
                    F#m  Bm
                    </pre>
                </body>
                </html>
                """;

        CreateSongRequest req = scraper.parseHtml(html);
        assertEquals("Sozinho", req.title());
        assertEquals("Unknown Artist", req.artist());
        assertEquals("F#m", req.originalKey());
        assertEquals(1, req.lyrics().sections().size());
    }

    @Test
    void testScrapeAndParseInvalidUrlThrows() {
        assertThrows(RuntimeException.class, () -> scraper.scrapeAndParse("http://invalid-url-that-does-not-exist.local"));
    }
}
