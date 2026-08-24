package br.com.cifras.admin.song.dto;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

public record AdminSongDTO(
    UUID id,
    String userId,
    String authorEmail,
    String authorName,
    String title,
    String artist,
    String originalKey,
    Boolean isFavorite,
    List<String> tags,
    Instant createdAt,
    Instant updatedAt,
    Instant deletedAt,
    boolean isDeleted
) {}
