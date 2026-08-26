package br.com.cifras.admin.feedback.dto;

import io.quarkus.runtime.annotations.RegisterForReflection;
import java.time.Instant;
import java.util.UUID;

@RegisterForReflection
public record FeedbackDTO(
    UUID id,
    String userId,
    String message,
    String status,
    String adminReply,
    Instant createdAt,
    Instant updatedAt
) {}
