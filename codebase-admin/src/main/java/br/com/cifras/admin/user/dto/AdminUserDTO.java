package br.com.cifras.admin.user.dto;

import io.quarkus.runtime.annotations.RegisterForReflection;
import java.time.Instant;

@RegisterForReflection
public record AdminUserDTO(
    String id,
    String email,
    String fullName,
    String role,
    String status,
    boolean isBlocked,
    String lastBlockReason,
    Instant createdAt,
    Instant lastSignInAt,
    Instant updatedAt,
    long songCount,
    boolean banned,
    boolean isAdmin
) {}
