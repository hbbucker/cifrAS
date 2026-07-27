package br.com.cifras.user.infra.persistence.entity;

import io.quarkus.hibernate.orm.panache.PanacheEntityBase;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.IdClass;
import jakarta.persistence.Table;
import jakarta.persistence.PrePersist;
import jakarta.persistence.PreUpdate;

import java.io.Serializable;
import java.time.Instant;
import java.util.Objects;
import java.util.UUID;

@Entity
@Table(name = "user_song_preferences")
@IdClass(UserSongPreferenceEntity.UserSongPreferenceId.class)
public class UserSongPreferenceEntity extends PanacheEntityBase {

    @Id
    @Column(name = "user_id")
    public String userId;

    @Id
    @Column(name = "song_id")
    public UUID songId;

    @Column(name = "transpose_steps", nullable = false)
    public Integer transposeSteps = 0;

    @Column(name = "auto_scroll_speed", nullable = false)
    public Integer autoScrollSpeed = 0;

    @Column(name = "font_size", nullable = false)
    public Integer fontSize = 16;

    @Column(name = "updated_at")
    public Instant updatedAt;

    @PrePersist
    @PreUpdate
    public void preUpdate() {
        this.updatedAt = Instant.now();
    }

    public static class UserSongPreferenceId implements Serializable {
        public String userId;
        public UUID songId;

        public UserSongPreferenceId() {}

        public UserSongPreferenceId(String userId, UUID songId) {
            this.userId = userId;
            this.songId = songId;
        }

        @Override
        public boolean equals(Object o) {
            if (this == o) return true;
            if (o == null || getClass() != o.getClass()) return false;
            UserSongPreferenceId that = (UserSongPreferenceId) o;
            return Objects.equals(userId, that.userId) &&
                   Objects.equals(songId, that.songId);
        }

        @Override
        public int hashCode() {
            return Objects.hash(userId, songId);
        }
    }
}
