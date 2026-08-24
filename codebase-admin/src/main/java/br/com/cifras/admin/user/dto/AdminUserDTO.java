package br.com.cifras.admin.user.dto;

import java.time.Instant;

public record AdminUserDTO(
    String id,
    String email,
    String fullName,
    String role,
    Instant createdAt,
    Instant lastSignInAt,
    long songCount,
    boolean banned,
    boolean isAdmin
) {}
