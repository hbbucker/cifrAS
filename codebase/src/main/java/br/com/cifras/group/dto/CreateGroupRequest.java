package br.com.cifras.group.dto;

import io.quarkus.runtime.annotations.RegisterForReflection;

import jakarta.validation.constraints.NotBlank;

@RegisterForReflection
public record CreateGroupRequest(
    @NotBlank String name
) {}
