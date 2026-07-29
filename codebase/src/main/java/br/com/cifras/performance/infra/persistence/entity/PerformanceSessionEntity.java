package br.com.cifras.performance.infra.persistence.entity;

import io.quarkus.hibernate.orm.panache.PanacheEntityBase;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import jakarta.persistence.Column;
import jakarta.persistence.PrePersist;
import jakarta.persistence.PreUpdate;

import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "performance_sessions")
public class PerformanceSessionEntity extends PanacheEntityBase {

    @Id
    @Column(name = "user_id")
    public String userId;

    @Column(name = "playlist_id")
    public UUID playlistId;

    @Column(name = "current_song_index")
    public Integer currentSongIndex;

    @Column(name = "scroll_position")
    public Double scrollPosition;

    @Column(name = "updated_at")
    public Instant updatedAt;

    @PrePersist
    @PreUpdate
    public void preUpdate() {
        this.updatedAt = Instant.now();
    }
}
