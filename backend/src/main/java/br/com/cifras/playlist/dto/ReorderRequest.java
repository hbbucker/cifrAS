package br.com.cifras.playlist.dto;

import java.util.List;

/**
 * Request DTO for reordering playlist songs.
 */
public record ReorderRequest(List<Long> orderedSongIds) {}
