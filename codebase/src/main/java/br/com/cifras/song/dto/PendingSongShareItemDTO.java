package br.com.cifras.song.dto;

import io.quarkus.runtime.annotations.RegisterForReflection;

import java.time.Instant;
import java.util.UUID;

@RegisterForReflection
public record PendingSongShareItemDTO(
    UUID shareId,
    UUID songId,
    String songTitle,
    String songArtist,
    String originalKey,
    String inviterId,
    String inviteeEmail,
    Instant createdAt
) {}
