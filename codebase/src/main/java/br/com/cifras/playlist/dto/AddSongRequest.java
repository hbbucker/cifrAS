package br.com.cifras.playlist.dto;

import java.util.UUID;

/**
 * Request DTO for adding a song to a playlist.
 */
public record AddSongRequest(UUID songId, int position) {}
