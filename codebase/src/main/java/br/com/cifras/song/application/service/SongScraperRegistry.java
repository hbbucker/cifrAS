package br.com.cifras.song.application.service;

import br.com.cifras.song.application.service.provider.SongScraperProvider;
import br.com.cifras.song.dto.CreateSongRequest;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.enterprise.inject.Instance;
import jakarta.inject.Inject;
import jakarta.ws.rs.BadRequestException;

@ApplicationScoped
public class SongScraperRegistry {

    @Inject
    Instance<SongScraperProvider> providers;

    public CreateSongRequest scrape(String url) {
        if (url == null || url.isBlank()) {
            throw new BadRequestException("URL não informada.");
        }
        String trimmedUrl = url.trim();
        for (SongScraperProvider provider : providers) {
            if (provider.supports(trimmedUrl)) {
                return provider.scrapeAndParse(trimmedUrl);
            }
        }
        throw new BadRequestException("Provedor não suportado para a URL: " + trimmedUrl);
    }
}
