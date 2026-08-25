package br.com.cifras.admin.song.infra.entity;

import io.quarkus.hibernate.orm.panache.PanacheEntityBase;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import org.hibernate.annotations.UuidGenerator;

import java.time.Instant;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Entity
@Table(name = "songs")
public class AdminSongEntity extends PanacheEntityBase {

    @Id
    @GeneratedValue
    @UuidGenerator(style = UuidGenerator.Style.TIME)
    public UUID id;

    @NotBlank
    public String userId;

    @NotBlank
    @Column(nullable = false)
    public String title;

    @NotBlank
    @Column(nullable = false)
    public String artist;

    public String originalKey;

    @Column(name = "is_favorite")
    public Boolean isFavorite = false;

    @Column(name = "tags", columnDefinition = "text[]")
    public List<String> tags = new ArrayList<>();

    @Column(nullable = false, updatable = false)
    public Instant createdAt;

    public Instant updatedAt;

    /** Soft delete timestamp. Null = active */
    public Instant deletedAt;

    @PrePersist
    public void prePersist() {
        this.createdAt = Instant.now();
        this.updatedAt = Instant.now();
    }

    @PreUpdate
    public void preUpdate() {
        this.updatedAt = Instant.now();
    }
}
