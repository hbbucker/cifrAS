package br.com.cifras.admin.audit.dto;

import io.quarkus.runtime.annotations.RegisterForReflection;
import java.time.Instant;

@RegisterForReflection
public record UserAuditLogDTO(
    String id,
    String userId,
    String adminId,
    String adminEmail,
    String action,
    String reason,
    String previousStatus,
    String newStatus,
    Instant createdAt
) {}
