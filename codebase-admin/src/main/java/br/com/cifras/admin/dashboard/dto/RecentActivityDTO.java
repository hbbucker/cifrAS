package br.com.cifras.admin.dashboard.dto;

import java.time.Instant;

public record RecentActivityDTO(
    String id,
    String type, // "SONG_CREATED", "SONG_DELETED", "SONG_RESTORED", "USER_REGISTERED"
    String title,
    String description,
    String actorId,
    Instant timestamp
) {}
