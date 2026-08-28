package br.com.cifras.song.application.usecase;

import br.com.cifras.song.application.service.CifraClubScraper;
import br.com.cifras.song.dto.CreateSongRequest;
import br.com.cifras.song.model.Song;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import jakarta.transaction.Transactional;

@ApplicationScoped
public class ImportSongUseCase {

    @Inject
    CifraClubScraper scraper;

    @Inject
    CreateSongUseCase createSongUseCase;

    @Transactional
    public Song execute(String url, String userId) {
        CreateSongRequest request = scraper.scrapeAndParse(url);
        return createSongUseCase.execute(request, userId);
    }
}
