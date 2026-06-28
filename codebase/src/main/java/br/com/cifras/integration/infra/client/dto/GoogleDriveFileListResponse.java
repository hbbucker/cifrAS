package br.com.cifras.integration.infra.client.dto;

import com.fasterxml.jackson.annotation.JsonProperty;

import java.util.List;

/**
 * Response DTO for the Google Drive Files.list API response.
 * Contains a page of file results and an optional token for the next page.
 */
public record GoogleDriveFileListResponse(
        List<GoogleDriveFileResponse> files,
        @JsonProperty("nextPageToken") String nextPageToken
) {}
