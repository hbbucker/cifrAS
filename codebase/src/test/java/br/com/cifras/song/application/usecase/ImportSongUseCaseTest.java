package br.com.cifras.song.application.usecase;

import br.com.cifras.song.application.service.SongScraperRegistry;
import br.com.cifras.song.dto.CreateSongRequest;
import br.com.cifras.song.model.LyricsStructure;
import br.com.cifras.song.model.Song;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import java.util.List;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

class ImportSongUseCaseTest {

    private ImportSongUseCase importSongUseCase;
    private SongScraperRegistry scraperRegistry;
    private CreateSongUseCase createSongUseCase;

    @BeforeEach
    void setUp() {
        importSongUseCase = new ImportSongUseCase();
        scraperRegistry = mock(SongScraperRegistry.class);
        createSongUseCase = mock(CreateSongUseCase.class);

        importSongUseCase.scraperRegistry = scraperRegistry;
        importSongUseCase.createSongUseCase = createSongUseCase;
    }

    @Test
    void testExecuteSuccessfulImport() {
        String url = "https://tabs.ultimate-guitar.com/tab/oasis/wonderwall-chords-27596";
        String userId = "user-123";

        CreateSongRequest request = new CreateSongRequest("Wonderwall", "Oasis", "Em", LyricsStructure.empty(), List.of("imported", "ultimate-guitar"));
        Song createdSong = Song.create(userId, "Wonderwall", "Oasis", "Em", LyricsStructure.empty(), List.of("imported", "ultimate-guitar"));
        createdSong.setId(UUID.randomUUID());

        when(scraperRegistry.scrape(url)).thenReturn(request);
        when(createSongUseCase.execute(request, userId)).thenReturn(createdSong);

        Song result = importSongUseCase.execute(url, userId);

        assertNotNull(result);
        assertEquals("Wonderwall", result.getTitle());
        assertEquals("Oasis", result.getArtist());
        verify(scraperRegistry).scrape(url);
        verify(createSongUseCase).execute(request, userId);
    }
}
