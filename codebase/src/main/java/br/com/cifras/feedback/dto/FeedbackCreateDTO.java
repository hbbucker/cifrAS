package br.com.cifras.feedback.dto;

import io.quarkus.runtime.annotations.RegisterForReflection;
import jakarta.validation.constraints.NotBlank;

@RegisterForReflection
public record FeedbackCreateDTO(
    @NotBlank(message = "Message cannot be blank")
    String message
) {}
