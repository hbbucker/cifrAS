package br.com.cifras.song.dto;

import br.com.cifras.song.model.SongShare;
import io.quarkus.runtime.annotations.RegisterForReflection;

import java.time.Instant;
import java.util.UUID;

@RegisterForReflection
public record SongShareResponseDTO(
    UUID id,
    UUID songId,
    String inviterId,
    String inviteeEmail,
    String status,
    Instant createdAt
) {
    public static SongShareResponseDTO from(SongShare share) {
        if (share == null) return null;
        return new SongShareResponseDTO(
            share.getId(),
            share.getSongId(),
            share.getInviterId(),
            share.getInviteeEmail(),
            share.getStatus().name(),
            share.getCreatedAt()
        );
    }
}
