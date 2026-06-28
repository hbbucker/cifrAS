package br.com.cifras.integration.infra.client.dto;

import io.quarkus.runtime.annotations.RegisterForReflection;

import java.util.List;

/**
 * Response DTO representing a single file entry from the Google Drive Files API.
 */
@RegisterForReflection
public record GoogleDriveFileResponse(
        String id,
        String name,
        String mimeType,
        List<String> parents
) {}
