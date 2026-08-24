package br.com.cifras.song.dto;

import io.quarkus.runtime.annotations.RegisterForReflection;

/**
 * DTO representing a tag name and the number of active songs using it.
 */
@RegisterForReflection
public record TagCountDTO(
    String name,
    long count
) {}
