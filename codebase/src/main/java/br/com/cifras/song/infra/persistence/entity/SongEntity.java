package br.com.cifras.song.infra.persistence.entity;

import io.quarkus.hibernate.orm.panache.PanacheEntityBase;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.annotations.UuidGenerator;
import org.hibernate.type.SqlTypes;

import br.com.cifras.song.model.LyricsStructure;
import java.time.Instant;
import java.util.UUID;

/**
 * SongEntity entity — persisted in PostgreSQL.
 * userId references the Supabase Auth user (UUID as String).
 * lyrics is stored as JSONB using hypersistence-utils JsonType.
 * Soft delete via deletedAt field; queries always filter WHERE deleted_at IS NULL.
 */
@Entity
@Table(name = "songs")
public class SongEntity extends PanacheEntityBase {

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

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(columnDefinition = "jsonb")
    public LyricsStructure lyrics;

    @Column(name = "is_favorite")
    public Boolean isFavorite = false;

    @Column(name = "pref_use_bb")
    public Boolean prefUseBb = false;

    @Column(name = "pref_use_eb")
    public Boolean prefUseEb = false;

    @Column(name = "pref_auto_scroll_speed")
    public Integer prefAutoScrollSpeed = 1;

    @Column(name = "pref_transpose_steps")
    public Integer prefTransposeSteps = 0;

    @Column(nullable = false, updatable = false)
    public Instant createdAt;

    public Instant updatedAt;

    /** Soft delete — null means the song is active */
    public Instant deletedAt;

    @Column(name = "fts_vector", columnDefinition = "tsvector GENERATED ALWAYS AS (setweight(to_tsvector('portuguese', coalesce(title, '')), 'A') || setweight(to_tsvector('portuguese', coalesce(artist, '')), 'B')) STORED", insertable = false, updatable = false)
    public String ftsVector;

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
