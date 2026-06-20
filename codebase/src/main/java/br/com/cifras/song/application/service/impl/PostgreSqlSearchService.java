package br.com.cifras.song.application.service.impl;

import br.com.cifras.shared.security.SecurityUtils;
import br.com.cifras.song.application.service.SearchService;
import br.com.cifras.song.infra.persistence.repository.SongRepository;
import br.com.cifras.song.model.Song;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import java.util.Collections;
import java.util.List;

@ApplicationScoped
public class PostgreSqlSearchService implements SearchService {

    @Inject
    SongRepository songRepository;

    @Inject
    SecurityUtils securityUtils;

    @Override
    public List<Song> search(String query) {
        if (query == null || query.trim().isEmpty()) {
            return Collections.emptyList();
        }
        
        String userId = securityUtils.getCurrentUserId();
        return songRepository.searchFts(userId, query.trim());
    }
}
