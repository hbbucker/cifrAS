package br.com.cifras.song.application.service;

import br.com.cifras.shared.security.SecurityUtils;
import br.com.cifras.song.application.service.impl.PostgreSqlSearchService;
import br.com.cifras.song.infra.persistence.repository.SongRepository;
import br.com.cifras.song.model.Song;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;

import java.util.Collections;
import java.util.List;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.Mockito.*;

class SearchServiceTest {

    @Mock
    SongRepository songRepository;

    @Mock
    SecurityUtils securityUtils;

    @InjectMocks
    PostgreSqlSearchService searchService;

    @BeforeEach
    void setUp() {
        MockitoAnnotations.openMocks(this);
    }

    @Test
    void search_WithValidQuery_ShouldReturnResults() {
        String query = "test query";
        String userId = "user-123";
        List<Song> expectedSongs = Collections.singletonList(mock(Song.class));
        
        when(securityUtils.getCurrentUserId()).thenReturn(userId);
        when(songRepository.searchFts(userId, query)).thenReturn(expectedSongs);

        List<Song> results = searchService.search(query);

        assertEquals(expectedSongs, results);
        verify(securityUtils).getCurrentUserId();
        verify(songRepository).searchFts(userId, query);
    }

    @Test
    void search_WithEmptyQuery_ShouldReturnEmptyList() {
        List<Song> results = searchService.search("");

        assertTrue(results.isEmpty());
        verifyNoInteractions(securityUtils);
        verifyNoInteractions(songRepository);
    }

    @Test
    void search_WithNullQuery_ShouldReturnEmptyList() {
        List<Song> results = searchService.search(null);

        assertTrue(results.isEmpty());
        verifyNoInteractions(securityUtils);
        verifyNoInteractions(songRepository);
    }

    @Test
    void search_WithWhitespaceQuery_ShouldReturnEmptyList() {
        List<Song> results = searchService.search("   ");

        assertTrue(results.isEmpty());
        verifyNoInteractions(securityUtils);
        verifyNoInteractions(songRepository);
    }
}
