package br.com.cifras.admin.dashboard.dto;

import io.quarkus.runtime.annotations.RegisterForReflection;
import java.time.Instant;

@RegisterForReflection
public record RecentActivityDTO(
    String id,
    String type, // "SONG_CREATED", "SONG_DELETED", "SONG_RESTORED", "USER_REGISTERED"
    String title,
    String description,
    String actorId,
    Instant timestamp
) {}
