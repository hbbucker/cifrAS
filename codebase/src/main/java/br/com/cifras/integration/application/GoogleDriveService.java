package br.com.cifras.integration.application;

import br.com.cifras.integration.dto.DriveFileDTO;
import br.com.cifras.integration.infra.client.GoogleDriveApiRestClient;
import br.com.cifras.integration.infra.client.GoogleOAuthRestClient;
import br.com.cifras.integration.infra.client.GoogleUserInfoRestClient;
import br.com.cifras.integration.infra.client.dto.GoogleDriveFileListResponse;
import br.com.cifras.integration.infra.client.dto.GoogleDriveFileResponse;
import br.com.cifras.integration.infra.client.dto.GoogleTokenResponse;
import br.com.cifras.integration.infra.client.dto.GoogleUserInfoResponse;
import br.com.cifras.user.application.UserIntegrationService;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import org.eclipse.microprofile.config.inject.ConfigProperty;
import org.eclipse.microprofile.rest.client.inject.RestClient;

import java.io.IOException;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.util.Collections;
import java.util.List;
import java.util.UUID;

/**
 * Application service for Google Drive integration.
 * <p>
 * Uses Quarkus MicroProfile REST Client (JAX-RS) to interact with Google APIs.
 * Fully compatible with GraalVM native image — no google-api-client SDK or Apache POI.
 */
@ApplicationScoped
public class GoogleDriveService {

    // --- MIME type constants ---
    private static final String MIME_GOOGLE_DOC =
            "application/vnd.google-apps.document";
    private static final String MIME_DOCX =
            "application/vnd.openxmlformats-officedocument.wordprocessingml.document";
    private static final String MIME_DOC = "application/msword";

    private static final String AUTH_URL =
            "https://accounts.google.com/o/oauth2/auth";
    private static final String SCOPE =
            "https://www.googleapis.com/auth/drive.readonly email profile";

    // --- Injected REST clients ---
    @Inject
    @RestClient
    GoogleOAuthRestClient oAuthRestClient;

    @Inject
    @RestClient
    GoogleUserInfoRestClient userInfoRestClient;

    @Inject
    @RestClient
    GoogleDriveApiRestClient driveApiRestClient;

    // --- Application services ---
    @Inject
    UserIntegrationService userIntegrationService;

    @Inject
    DocxTextExtractor docxExtractor;

    // --- Config ---
    @ConfigProperty(name = "google.client.id", defaultValue = "dummy-client-id")
    String clientId;

    @ConfigProperty(name = "google.client.secret", defaultValue = "dummy-client-secret")
    String clientSecret;

    @ConfigProperty(name = "google.redirect.uri",
            defaultValue = "http://localhost:5173/settings/integrations/google-callback")
    String redirectUri;

    // -------------------------------------------------------------------------
    // Public API
    // -------------------------------------------------------------------------

    /**
     * Builds the Google OAuth2 authorization URL that the frontend redirects to.
     *
     * @return fully-encoded authorization URL
     */
    public String getAuthUrl() {
        return AUTH_URL
                + "?client_id=" + encode(clientId)
                + "&redirect_uri=" + encode(redirectUri)
                + "&response_type=code"
                + "&scope=" + encode(SCOPE)
                + "&access_type=offline"
                + "&prompt=select_account";
    }

    /**
     * Exchanges an OAuth2 authorization {@code code} for tokens and persists
     * the refresh token associated with the authenticated user.
     *
     * @param code   the short-lived authorization code from the Google callback
     * @param userId the CifrAS user UUID (from JWT {@code sub})
     */
    public void exchangeCode(String code, UUID userId) {
        GoogleTokenResponse tokens = oAuthRestClient.exchangeCode(
                code, clientId, clientSecret, redirectUri, "authorization_code");

        GoogleUserInfoResponse userInfo = userInfoRestClient.getUserInfo(
                "Bearer " + tokens.accessToken());

        if (userInfo.email() != null && tokens.refreshToken() != null) {
            userIntegrationService.saveGoogleToken(userId, userInfo.email(), tokens.refreshToken());
        }
    }

    /**
     * Lists document files (Google Docs, DOCX, legacy DOC) from the user's Drive.
     *
     * @param userId      the CifrAS user UUID
     * @param email       the Google account email linked to this integration
     * @param searchQuery optional name filter (can be {@code null} or blank)
     * @return list of {@link DriveFileDTO}
     * @throws IllegalStateException if no Google Drive integration exists for this email
     */
    public List<DriveFileDTO> listFiles(UUID userId, String email, String searchQuery) {
        String token = getAccessToken(userId, email);

        String query = "(mimeType='application/vnd.google-apps.document'"
                + " or mimeType='application/msword'"
                + " or mimeType='application/vnd.openxmlformats-officedocument.wordprocessingml.document')";
        if (searchQuery != null && !searchQuery.isBlank()) {
            String safe = searchQuery.replace("'", "\\'");
            query += " and name contains '" + safe + "'";
        }

        GoogleDriveFileListResponse response = driveApiRestClient.listFiles(
                "Bearer " + token,
                query,
                "drive",
                "nextPageToken, files(id, name, mimeType, parents)");

        List<GoogleDriveFileResponse> files = response.files();
        if (files == null || files.isEmpty()) {
            return Collections.emptyList();
        }

        return files.stream()
                .map(f -> new DriveFileDTO(f.id(), f.name(), f.mimeType(), resolveParentPath(token, f)))
                .toList();
    }

    /**
     * Extracts plain text from a file in the user's Google Drive.
     * <ul>
     *   <li>Google Docs → exported as {@code text/plain} via the export API</li>
     *   <li>DOCX → downloaded as binary and parsed by {@link DocxTextExtractor}</li>
     *   <li>Legacy DOC → not supported (throws {@link UnsupportedOperationException})</li>
     * </ul>
     *
     * @param userId the CifrAS user UUID
     * @param fileId the Google Drive file ID
     * @param email  the Google account email linked to this integration
     * @return extracted plain text
     * @throws IllegalStateException          if no Google Drive integration exists for this email
     * @throws UnsupportedOperationException  if the file format is not supported
     */
    public String extractTextFromFile(UUID userId, String fileId, String email) {
        String token = getAccessToken(userId, email);
        GoogleDriveFileResponse meta = driveApiRestClient.getFileMeta(
                "Bearer " + token, fileId, "mimeType");

        return switch (meta.mimeType()) {
            case MIME_GOOGLE_DOC -> driveApiRestClient.exportAsText(
                    "Bearer " + token, fileId, "text/plain");

            case MIME_DOCX -> {
                byte[] bytes = driveApiRestClient.downloadFileBytes(
                        "Bearer " + token, fileId, "media");
                try {
                    yield docxExtractor.extract(bytes);
                } catch (IOException e) {
                    throw new RuntimeException(
                            "Failed to parse DOCX content for fileId=" + fileId, e);
                }
            }

            case MIME_DOC -> throw new UnsupportedOperationException(
                    "Formato .doc legado não suportado. Converta para .docx ou Google Docs.");

            default -> throw new UnsupportedOperationException(
                    "Tipo MIME não suportado: " + meta.mimeType());
        };
    }

    // -------------------------------------------------------------------------
    // Private helpers
    // -------------------------------------------------------------------------

    /**
     * Obtains a fresh access token for the given user + email integration
     * by calling the token refresh endpoint.
     *
     * @throws IllegalStateException if no integration is found for this user/email
     */
    private String getAccessToken(UUID userId, String email) {
        return userIntegrationService.getGoogleToken(userId, email)
                .map(integration -> {
                    GoogleTokenResponse refreshed = oAuthRestClient.refreshToken(
                            integration.getRefreshToken(), clientId, clientSecret, "refresh_token");
                    return refreshed.accessToken();
                })
                .orElseThrow(() -> new IllegalStateException(
                        "Usuário não possui integração com Google para o email: " + email));
    }

    /**
     * Attempts to resolve a human-readable parent folder path.
     * Falls back to {@code "Meu Drive"} on any error.
     */
    private String resolveParentPath(String token, GoogleDriveFileResponse file) {
        if (file.parents() == null || file.parents().isEmpty()) {
            return "Meu Drive";
        }
        try {
            String parentId = file.parents().get(0);
            GoogleDriveFileResponse folder = driveApiRestClient.getFileMeta(
                    "Bearer " + token, parentId, "id, name");
            return "Meu Drive / " + folder.name();
        } catch (Exception e) {
            return "Meu Drive";
        }
    }

    /**
     * URL-encodes a string using UTF-8.
     */
    private String encode(String value) {
        return URLEncoder.encode(value, StandardCharsets.UTF_8);
    }
}
