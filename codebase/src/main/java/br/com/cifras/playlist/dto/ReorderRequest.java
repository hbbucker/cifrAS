package br.com.cifras.playlist.dto;

import java.util.List;
import java.util.UUID;

/**
 * Request DTO for reordering playlist songs.
 */
public record ReorderRequest(List<UUID> orderedSongIds) {}
