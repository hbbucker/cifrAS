package br.com.cifras.group.dto;

import jakarta.validation.constraints.NotBlank;

public record AddMemberRequest(
    @NotBlank String targetUserId
) {}
