package br.com.cifras.playlist.dto;

/**
 * Request DTO for adding a song to a playlist.
 */
public record AddSongRequest(Long songId, int position) {}
