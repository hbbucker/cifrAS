package br.com.cifras.playlist.domain;

import br.com.cifras.song.domain.Song;
import io.quarkus.hibernate.orm.panache.PanacheEntity;
import jakarta.persistence.*;

/**
 * PlaylistSong — junction table between Playlist and Song with ordering position.
 * Optimistic locking via @Version to prevent concurrent reorder conflicts.
 */
@Entity
@Table(name = "playlist_songs",
    uniqueConstraints = @UniqueConstraint(columnNames = {"playlist_id", "song_id"}))
public class PlaylistSong extends PanacheEntity {

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "playlist_id", nullable = false)
    public Playlist playlist;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "song_id", nullable = false)
    public Song song;

    public int position;

    @Version
    public Long version;
}
