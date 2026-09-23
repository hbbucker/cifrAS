package br.com.cifras.song.application.service;

import br.com.cifras.song.application.service.provider.SongScraperProvider;
import br.com.cifras.song.dto.CreateSongRequest;
import br.com.cifras.song.model.LyricsStructure;
import jakarta.enterprise.inject.Instance;
import jakarta.ws.rs.BadRequestException;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import java.util.Iterator;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

class SongScraperRegistryTest {

    private SongScraperRegistry registry;
    private SongScraperProvider provider1;
    private SongScraperProvider provider2;

    @BeforeEach
    void setUp() {
        registry = new SongScraperRegistry();
        provider1 = mock(SongScraperProvider.class);
        provider2 = mock(SongScraperProvider.class);

        when(provider1.supports("https://site1.com/song")).thenReturn(true);
        when(provider1.scrapeAndParse("https://site1.com/song"))
                .thenReturn(new CreateSongRequest("Song 1", "Artist 1", "C", LyricsStructure.empty(), List.of("site1")));

        when(provider2.supports("https://site2.com/song")).thenReturn(true);
        when(provider2.scrapeAndParse("https://site2.com/song"))
                .thenReturn(new CreateSongRequest("Song 2", "Artist 2", "G", LyricsStructure.empty(), List.of("site2")));

        @SuppressWarnings("unchecked")
        Instance<SongScraperProvider> instance = mock(Instance.class);
        when(instance.iterator()).thenReturn(List.of(provider1, provider2).iterator());

        registry.providers = instance;
    }

    @Test
    void testScrapeValidUrlRoutesToCorrectProvider() {
        CreateSongRequest req1 = registry.scrape("https://site1.com/song");
        assertEquals("Song 1", req1.title());

        CreateSongRequest req2 = registry.scrape("https://site2.com/song");
        assertEquals("Song 2", req2.title());
    }

    @Test
    void testScrapeThrowsOnUnsupportedUrl() {
        assertThrows(BadRequestException.class, () -> registry.scrape("https://unknown.com/song"));
    }

    @Test
    void testScrapeThrowsOnNullOrBlank() {
        assertThrows(BadRequestException.class, () -> registry.scrape(null));
        assertThrows(BadRequestException.class, () -> registry.scrape("   "));
    }
}
