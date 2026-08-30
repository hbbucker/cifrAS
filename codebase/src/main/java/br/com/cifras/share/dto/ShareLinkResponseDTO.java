package br.com.cifras.share.dto;

import br.com.cifras.share.model.ShareLinkType;
import io.quarkus.runtime.annotations.RegisterForReflection;
import java.time.Instant;
import java.util.UUID;

@RegisterForReflection
public record ShareLinkResponseDTO(
    String token,
    ShareLinkType type,
    UUID resourceId,
    String resourceName,
    String authorName,
    Instant expiresAt,
    String url
) {}
