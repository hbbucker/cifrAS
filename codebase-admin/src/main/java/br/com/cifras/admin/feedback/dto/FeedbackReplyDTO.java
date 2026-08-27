package br.com.cifras.admin.feedback.dto;

import io.quarkus.runtime.annotations.RegisterForReflection;
import jakarta.validation.constraints.NotBlank;

@RegisterForReflection
public record FeedbackReplyDTO(
    @NotBlank(message = "Reply message cannot be blank")
    String replyMessage
) {}
