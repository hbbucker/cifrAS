package br.com.cifras.playlist.model;

import br.com.cifras.song.model.Song;

import java.util.UUID;

public class PlaylistSong {

    private UUID id;
    private Song song;
    private int position;
    private Long version;

    protected PlaylistSong() {}

    public static PlaylistSong create(Song song, int position) {
        PlaylistSong ps = new PlaylistSong();
        ps.song = song;
        ps.position = position;
        return ps;
    }

    public static PlaylistSong restore(UUID id, Song song, int position, Long version) {
        PlaylistSong ps = new PlaylistSong();
        ps.id = id;
        ps.song = song;
        ps.position = position;
        ps.version = version;
        return ps;
    }

    public void updatePosition(int position) {
        this.position = position;
    }

    public UUID getId() { return id; }
    public Song getSong() { return song; }
    public int getPosition() { return position; }
    public Long getVersion() { return version; }

    public void setId(UUID id) { this.id = id; }
}
