package br.com.cifras.song.application.service.provider;

import br.com.cifras.song.dto.CreateSongRequest;

/**
 * Strategy interface for scraping and parsing songs from external websites.
 */
public interface SongScraperProvider {

    /**
     * Checks if this provider supports the given URL.
     *
     * @param url the source URL
     * @return true if supported, false otherwise
     */
    boolean supports(String url);

    /**
     * Scrapes the target URL and parses the content into a CreateSongRequest.
     *
     * @param url the source URL
     * @return the structured song request
     */
    CreateSongRequest scrapeAndParse(String url);

    /**
     * Returns the unique provider name (e.g., "cifraclub", "ultimate-guitar", "lacuerda", "chordie", "e-chords").
     *
     * @return provider identifier
     */
    String getProviderName();
}
