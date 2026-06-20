package br.com.cifras.playlist.infra.persistence.entity;

import br.com.cifras.song.infra.persistence.entity.SongEntity;
import io.quarkus.hibernate.orm.panache.PanacheEntityBase;
import jakarta.persistence.*;
import org.hibernate.annotations.UuidGenerator;
import java.util.UUID;

/**
 * PlaylistSong — junction table between PlaylistEntity and SongEntity with ordering position.
 * Optimistic locking via @Version to prevent concurrent reorder conflicts.
 */
@Entity
@Table(name = "playlist_songs",
    uniqueConstraints = @UniqueConstraint(columnNames = {"playlist_id", "song_id"}))
public class PlaylistSongEntity extends PanacheEntityBase {

    @Id
    @GeneratedValue
    @UuidGenerator(style = UuidGenerator.Style.TIME)
    public UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "playlist_id", nullable = false)
    public PlaylistEntity playlist;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "song_id", nullable = false)
    public SongEntity song;

    public int position;

    @Version
    public Long version;
}
