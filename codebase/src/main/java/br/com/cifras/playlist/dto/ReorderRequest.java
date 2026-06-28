package br.com.cifras.playlist.dto;

import io.quarkus.runtime.annotations.RegisterForReflection;

import java.util.List;
import java.util.UUID;

/**
 * Request DTO for reordering playlist songs.
 */
@RegisterForReflection
public record ReorderRequest(List<UUID> orderedSongIds) {}
