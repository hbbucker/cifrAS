package br.com.cifras.song.domain;

import io.quarkus.hibernate.orm.panache.PanacheEntity;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

import java.time.Instant;

/**
 * Song entity — persisted in PostgreSQL.
 * userId references the Supabase Auth user (UUID as String).
 * lyrics is stored as JSONB using hypersistence-utils JsonType.
 * Soft delete via deletedAt field; queries always filter WHERE deleted_at IS NULL.
 */
@Entity
@Table(name = "songs")
public class Song extends PanacheEntity {

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

    @Column(nullable = false, updatable = false)
    public Instant createdAt;

    public Instant updatedAt;

    /** Soft delete — null means the song is active */
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
