package br.com.cifras.playlist.model;

import br.com.cifras.song.model.Song;

import java.util.UUID;

public class PlaylistSong {

    public UUID id;
    
    // We only need the song reference and position in the domain for now
    public Song song;
    
    public int position;
    public Long version;

    public PlaylistSong() {}
}
