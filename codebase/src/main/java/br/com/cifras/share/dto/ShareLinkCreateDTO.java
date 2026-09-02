package br.com.cifras.share.dto;

import br.com.cifras.share.model.ShareLinkType;
import io.quarkus.runtime.annotations.RegisterForReflection;
import jakarta.validation.constraints.NotNull;
import java.util.UUID;

@RegisterForReflection
public record ShareLinkCreateDTO(
    @NotNull ShareLinkType type,
    @NotNull UUID resourceId
) {}
