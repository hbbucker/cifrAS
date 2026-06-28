package br.com.cifras.integration.infra.client;

import br.com.cifras.integration.infra.client.dto.GoogleDriveFileListResponse;
import br.com.cifras.integration.infra.client.dto.GoogleDriveFileResponse;
import jakarta.ws.rs.GET;
import jakarta.ws.rs.HeaderParam;
import jakarta.ws.rs.Path;
import jakarta.ws.rs.PathParam;
import jakarta.ws.rs.Produces;
import jakarta.ws.rs.QueryParam;
import jakarta.ws.rs.core.MediaType;
import org.eclipse.microprofile.rest.client.inject.RegisterRestClient;

/**
 * MicroProfile REST Client for the Google Drive v3 API.
 * <p>
 * Config key: {@code google-drive-api}
 * Base URL is configured via {@code quarkus.rest-client.google-drive-api.url}.
 */
@RegisterRestClient(configKey = "google-drive-api")
@Path("/drive/v3")
public interface GoogleDriveApiRestClient {

    /**
     * Lists files in the user's Google Drive that match the given query.
     *
     * @param bearer  the {@code Authorization} header value ({@code "Bearer <token>"})
     * @param query   Drive query string (e.g. {@code mimeType='...'})
     * @param spaces  the corpus to search ({@code "drive"})
     * @param fields  the fields to include in the response
     */
    @GET
    @Path("/files")
    GoogleDriveFileListResponse listFiles(
            @HeaderParam("Authorization") String bearer,
            @QueryParam("q") String query,
            @QueryParam("spaces") String spaces,
            @QueryParam("fields") String fields
    );

    /**
     * Retrieves metadata for a single file.
     *
     * @param bearer  the {@code Authorization} header value
     * @param fileId  the Drive file ID
     * @param fields  the fields to include (e.g. {@code "mimeType"})
     */
    @GET
    @Path("/files/{fileId}")
    GoogleDriveFileResponse getFileMeta(
            @HeaderParam("Authorization") String bearer,
            @PathParam("fileId") String fileId,
            @QueryParam("fields") String fields
    );

    /**
     * Exports a Google Workspace document (e.g. Google Doc) as plain text.
     *
     * @param bearer   the {@code Authorization} header value
     * @param fileId   the Drive file ID
     * @param mimeType the target MIME type for export (e.g. {@code "text/plain"})
     */
    @GET
    @Path("/files/{fileId}/export")
    @Produces(MediaType.TEXT_PLAIN)
    String exportAsText(
            @HeaderParam("Authorization") String bearer,
            @PathParam("fileId") String fileId,
            @QueryParam("mimeType") String mimeType
    );

    /**
     * Downloads raw binary file content.
     * Uses {@code ?alt=media} to stream the file bytes.
     *
     * @param bearer the {@code Authorization} header value
     * @param fileId the Drive file ID
     * @param alt    must be {@code "media"} to request the file's binary content
     */
    @GET
    @Path("/files/{fileId}")
    @Produces(MediaType.APPLICATION_OCTET_STREAM)
    byte[] downloadFileBytes(
            @HeaderParam("Authorization") String bearer,
            @PathParam("fileId") String fileId,
            @QueryParam("alt") String alt
    );
}
