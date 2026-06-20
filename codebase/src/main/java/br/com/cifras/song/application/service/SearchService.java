package br.com.cifras.song.application.service;

import br.com.cifras.song.model.Song;
import java.util.List;

public interface SearchService {
    List<Song> search(String query);
}
