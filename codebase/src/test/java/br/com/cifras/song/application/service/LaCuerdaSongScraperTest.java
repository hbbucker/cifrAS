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
                    </pre>
                </body>
                </html>
                """;

        CreateSongRequest request = scraper.parseHtml(html);

        assertEquals("Limón y Sal", request.title());
        assertEquals("Julieta Venegas", request.artist());
        assertTrue(request.tags().contains("lacuerda"));
        assertTrue(request.tags().contains("imported"));
        assertEquals(3, request.lyrics().sections().size());
        assertEquals("INTRO", request.lyrics().sections().get(0).label());
        assertEquals("VERSO 1", request.lyrics().sections().get(1).label());
        assertEquals("CORO", request.lyrics().sections().get(2).label());
    }

    @Test
    void testParseHtmlLatinChordsConversion() {
        String html = """
                <!DOCTYPE html>
                <html>
                <head>
                    <title>Maná, Rayando el Sol: Acordes</title>
                </head>
                <body>
                    <pre>
                    [Intro]
                    Sol  Re  Mim  Do
                    
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
        // Verify Sol / Re / Mim / Do converted to G / D / Em / C
        assertEquals("G", request.lyrics().sections().get(0).lines().get(0).chords().get(0).chord());
        assertEquals("D", request.lyrics().sections().get(0).lines().get(0).chords().get(1).chord());
        assertEquals("Em", request.lyrics().sections().get(0).lines().get(0).chords().get(2).chord());
        assertEquals("C", request.lyrics().sections().get(0).lines().get(0).chords().get(3).chord());
    }
}
