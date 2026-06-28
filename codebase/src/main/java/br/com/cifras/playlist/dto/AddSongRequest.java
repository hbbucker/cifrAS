package br.com.cifras.playlist.dto;

import io.quarkus.runtime.annotations.RegisterForReflection;

import java.util.UUID;

/**
 * Request DTO for adding a song to a playlist.
 */
@RegisterForReflection
public record AddSongRequest(UUID songId, int position) {}
