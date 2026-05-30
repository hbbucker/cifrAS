package br.com.cifras.playlist.model;

import br.com.cifras.song.model.Song;
import io.quarkus.hibernate.orm.panache.PanacheEntityBase;
import jakarta.persistence.*;
import org.hibernate.annotations.UuidGenerator;
import java.util.UUID;

/**
 * PlaylistSong — junction table between Playlist and Song with ordering position.
 * Optimistic locking via @Version to prevent concurrent reorder conflicts.
 */
@Entity
@Table(name = "playlist_songs",
    uniqueConstraints = @UniqueConstraint(columnNames = {"playlist_id", "song_id"}))
public class PlaylistSong extends PanacheEntityBase {

    @Id
    @GeneratedValue
    @UuidGenerator(style = UuidGenerator.Style.TIME)
    public UUID id;

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
