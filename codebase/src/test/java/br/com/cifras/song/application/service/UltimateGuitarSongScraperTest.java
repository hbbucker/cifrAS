package br.com.cifras.song.application.service;

import br.com.cifras.song.dto.CreateSongRequest;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.*;

class UltimateGuitarSongScraperTest {

    private UltimateGuitarSongScraper scraper;

    @BeforeEach
    void setUp() {
        scraper = new UltimateGuitarSongScraper();
        scraper.objectMapper = new ObjectMapper();
    }

    @Test
    void testSupports() {
        assertTrue(scraper.supports("https://tabs.ultimate-guitar.com/tab/oasis/wonderwall-chords-27596"));
        assertTrue(scraper.supports("https://www.ultimate-guitar.com/tab/12345"));
        assertFalse(scraper.supports("https://www.cifraclub.com.br/oasis/wonderwall/"));
        assertFalse(scraper.supports(null));
        assertEquals("ultimate-guitar", scraper.getProviderName());
    }

    @Test
    void testParseHtmlWithJsStore() {
        String html = """
                <!DOCTYPE html>
                <html>
                <head>
                    <title>Wonderwall Chords by Oasis @ Ultimate-Guitar.Com</title>
                </head>
                <body>
                    <div class="js-store" data-content="{&quot;store&quot;:{},&quot;data&quot;:{&quot;tab&quot;:{&quot;song_name&quot;:&quot;Wonderwall&quot;,&quot;artist_name&quot;:&quot;Oasis&quot;,&quot;tonality_name&quot;:&quot;Em&quot;},&quot;tab_view&quot;:{&quot;wiki_tab&quot;:{&quot;content&quot;:&quot;[Verse 1]\\n[ch]Em7[/ch]     [ch]G[/ch]              [ch]Dsus4[/ch]        [ch]A7sus4[/ch]\\nToday is gonna be the day that they're gonna throw it back to you\\n\\n[Chorus]\\n[ch]C[/ch]     [ch]D[/ch]      [ch]Em[/ch]\\nAnd after all, you're my wonderwall&quot;}}}}"></div>
                </body>
                </html>
                """;

        CreateSongRequest request = scraper.parseHtml(html);

        assertEquals("Wonderwall", request.title());
        assertEquals("Oasis", request.artist());
        assertEquals("Em", request.originalKey());
        assertTrue(request.tags().contains("ultimate-guitar"));
        assertTrue(request.tags().contains("imported"));
        assertEquals(2, request.lyrics().sections().size());
        assertEquals("Verse 1", request.lyrics().sections().get(0).label());
        assertEquals("Chorus", request.lyrics().sections().get(1).label());
    }

    @Test
    void testParseHtmlFallback() {
        String html = """
                <!DOCTYPE html>
                <html>
                <head>
                    <title>Hotel California Chords by Eagles - Ultimate Guitar</title>
                </head>
                <body>
                    <pre>
                    [Intro]
                    Bm  F#7  A  E  G  D  Em  F#7
                    
                    [Verse 1]
                    Bm                       F#7
                    On a dark desert highway, cool wind in my hair
                    </pre>
                </body>
                </html>
                """;

        CreateSongRequest request = scraper.parseHtml(html);

        assertEquals("Hotel California", request.title());
        assertEquals("Eagles", request.artist());
        assertEquals("C", request.originalKey());
        assertEquals(2, request.lyrics().sections().size());
    }
}
