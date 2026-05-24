package br.com.cifras.playlist.domain;

import br.com.cifras.group.domain.Group;
import io.quarkus.hibernate.orm.panache.PanacheEntity;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;

import java.time.Instant;
import java.util.ArrayList;
import java.util.List;

/**
 * Playlist entity. Can be personal or collaborative (linked to a Group).
 */
@Entity
@Table(name = "playlists")
public class Playlist extends PanacheEntity {

    @NotBlank
    public String userId;

    @NotBlank
    @Column(nullable = false)
    public String name;

    public boolean isCollaborative = false;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "group_id")
    public Group group;

    @OneToMany(mappedBy = "playlist", cascade = CascadeType.ALL, orphanRemoval = true)
    @OrderBy("position ASC")
    public List<PlaylistSong> songs = new ArrayList<>();

    public Instant createdAt;
    public Instant deletedAt;

    @PrePersist
    public void prePersist() {
        this.createdAt = Instant.now();
    }
}
