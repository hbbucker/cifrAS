package br.com.cifras.playlist.infra.persistence.entity;

import br.com.cifras.group.infra.persistence.entity.GroupEntity;
import io.quarkus.hibernate.orm.panache.PanacheEntityBase;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import org.hibernate.annotations.UuidGenerator;

import java.time.Instant;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

/**
 * PlaylistEntity entity. Can be personal or collaborative (linked to a GroupEntity).
 */
@Entity
@Table(name = "playlists")
public class PlaylistEntity extends PanacheEntityBase {

    @Id
    @GeneratedValue
    @UuidGenerator(style = UuidGenerator.Style.TIME)
    public UUID id;

    @NotBlank
    public String userId;

    @NotBlank
    @Column(nullable = false)
    public String name;

    public boolean isCollaborative = false;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "group_id")
    public GroupEntity group;

    @Column(unique = true)
    public String shareToken;

    @OneToMany(mappedBy = "playlist", cascade = CascadeType.ALL, orphanRemoval = true)
    @OrderBy("position ASC")
    public List<PlaylistSongEntity> songs = new ArrayList<>();

    public Instant createdAt;
    public Instant deletedAt;

    @PrePersist
    public void prePersist() {
        this.createdAt = Instant.now();
    }
}
