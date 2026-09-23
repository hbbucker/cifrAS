package br.com.cifras.song.application.service;

import br.com.cifras.song.dto.CreateSongRequest;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.*;

class LaCuerdaSongScraperTest {

    private LaCuerdaSongScraper scraper;

    @BeforeEach
    void setUp() {
        scraper = new LaCuerdaSongScraper();
    }

    @Test
    void testSupports() {
        assertTrue(scraper.supports("https://lacuerda.net/tabs/j/julieta_venegas/limon_y_sal.shtml"));
        assertTrue(scraper.supports("https://acordes.lacuerda.net/mana/labios_compartidos"));
        assertFalse(scraper.supports("https://www.cifraclub.com.br/"));
        assertFalse(scraper.supports(null));
        assertEquals("lacuerda", scraper.getProviderName());
    }

    @Test
    void testParseHtmlSpanishSong() {
        String html = """
                <!DOCTYPE html>
                <html>
                <head>
                    <title>Julieta Venegas, Limón y Sal: Acordes</title>
                </head>
                <body>
                    <pre>
                    INTRO:
                    C  G  Am  F
                    
                    VERSO 1:
                    C                     G
                    Tengo que confesar que a veces
                    Am                  F
                    No me gusta tu forma de ser
                    
                    CORO:
                    C          G
                    Yo te quiero con limón y sal
                    
                    ESTRIBILLO:
                    C          G
                    La la la
                    
                    PUENTE:
                    F          G
                    Puente musical
                    
                    SOLO:
                    C  G  Am  F
                    
                    FINAL:
                    C
                    Fin
                    
                    OUTRO:
                    C
                    </pre>
                </body>
                </html>
                """;

        CreateSongRequest request = scraper.parseHtml(html);

        assertEquals("Limón y Sal", request.title());
        assertEquals("Julieta Venegas", request.artist());
        assertTrue(request.tags().contains("lacuerda"));
        assertTrue(request.tags().contains("imported"));
        assertEquals(8, request.lyrics().sections().size());
        assertEquals("INTRO", request.lyrics().sections().get(0).label());
        assertEquals("VERSO 1", request.lyrics().sections().get(1).label());
        assertEquals("CORO", request.lyrics().sections().get(2).label());
        assertEquals("ESTRIBILLO", request.lyrics().sections().get(3).label());
        assertEquals("PUENTE", request.lyrics().sections().get(4).label());
        assertEquals("SOLO", request.lyrics().sections().get(5).label());
        assertEquals("FINAL", request.lyrics().sections().get(6).label());
        assertEquals("OUTRO", request.lyrics().sections().get(7).label());
    }

    @Test
    void testParseHtmlLatinChordsConversion() {
        String html = """
                <!DOCTYPE html>
                <html>
                <head>
                    <title>Rayando el Sol - Maná - LaCuerda.net</title>
                </head>
                <body>
                    <pre>
                    [Intro]
                    Sol  Re  Mim  Do  Fa#  Si7  Lam
                    
                    [Verso 1]
                    Sol               Re
                    Rayando el sol, desesperación
                    </pre>
                </body>
                </html>
                """;

        CreateSongRequest request = scraper.parseHtml(html);

        assertEquals("Rayando el Sol", request.title());
        assertEquals("Maná", request.artist());
        assertEquals(2, request.lyrics().sections().size());
        // Verify Latin notation converted to standard
        assertEquals("G", request.lyrics().sections().get(0).lines().get(0).chords().get(0).chord());
        assertEquals("D", request.lyrics().sections().get(0).lines().get(0).chords().get(1).chord());
        assertEquals("Em", request.lyrics().sections().get(0).lines().get(0).chords().get(2).chord());
        assertEquals("C", request.lyrics().sections().get(0).lines().get(0).chords().get(3).chord());
        assertEquals("F#", request.lyrics().sections().get(0).lines().get(0).chords().get(4).chord());
        assertEquals("B7", request.lyrics().sections().get(0).lines().get(0).chords().get(5).chord());
        assertEquals("Am", request.lyrics().sections().get(0).lines().get(0).chords().get(6).chord());
    }

    @Test
    void testParseHtmlPlainTitleAndNoPre() {
        String html = """
                <!DOCTYPE html>
                <html>
                <head>
                    <title>CancionSinAutor</title>
                </head>
                <body>
                    <div>Sin acordes</div>
                </body>
                </html>
                """;

        CreateSongRequest request = scraper.parseHtml(html);
        assertEquals("CancionSinAutor", request.title());
        assertEquals("Unknown Artist", request.artist());
        assertTrue(request.lyrics().sections().isEmpty());
    }

    @Test
    void testScrapeAndParseInvalidUrlThrows() {
        assertThrows(RuntimeException.class, () -> scraper.scrapeAndParse("http://invalid-url-that-does-not-exist.local"));
    }
}
