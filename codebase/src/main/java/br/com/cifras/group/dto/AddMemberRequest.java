package br.com.cifras.group.dto;

import io.quarkus.runtime.annotations.RegisterForReflection;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;

@RegisterForReflection
public record AddMemberRequest(
    @NotBlank @Email String email
) {}
