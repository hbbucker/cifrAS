package br.com.cifras.integration.infra.client.dto;

import java.util.List;

/**
 * Response DTO representing a single file entry from the Google Drive Files API.
 */
public record GoogleDriveFileResponse(
        String id,
        String name,
        String mimeType,
        List<String> parents
) {}
