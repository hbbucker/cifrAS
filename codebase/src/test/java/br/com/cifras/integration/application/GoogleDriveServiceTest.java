package br.com.cifras.integration.application;

import br.com.cifras.BaseIntegrationTest;
import br.com.cifras.integration.dto.DriveFileDTO;
import br.com.cifras.integration.infra.client.GoogleDriveApiRestClient;
import br.com.cifras.integration.infra.client.GoogleOAuthRestClient;
import br.com.cifras.integration.infra.client.GoogleUserInfoRestClient;
import br.com.cifras.integration.infra.client.dto.GoogleDriveFileListResponse;
import br.com.cifras.integration.infra.client.dto.GoogleDriveFileResponse;
import br.com.cifras.integration.infra.client.dto.GoogleTokenResponse;
import br.com.cifras.integration.infra.client.dto.GoogleUserInfoResponse;
import br.com.cifras.user.application.UserIntegrationService;
import br.com.cifras.user.model.UserIntegration;
import io.quarkus.test.InjectMock;
import io.quarkus.test.junit.QuarkusTest;
import jakarta.inject.Inject;
import org.eclipse.microprofile.rest.client.inject.RestClient;
import org.junit.jupiter.api.Test;

import java.time.Instant;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import java.util.zip.ZipEntry;
import java.util.zip.ZipOutputStream;
import java.io.ByteArrayOutputStream;
import java.nio.charset.StandardCharsets;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;

/**
 * Integration tests for {@link GoogleDriveService}.
 * Uses {@code @QuarkusTest} and mocks REST clients via {@code @InjectMock @RestClient}.
 */
@QuarkusTest
class GoogleDriveServiceTest extends BaseIntegrationTest {

    @InjectMock
    @RestClient
    GoogleOAuthRestClient oAuthRestClient;

    @InjectMock
    @RestClient
    GoogleUserInfoRestClient userInfoRestClient;

    @InjectMock
    @RestClient
    GoogleDriveApiRestClient driveApiRestClient;

    @InjectMock
    UserIntegrationService userIntegrationService;

    @Inject
    GoogleDriveService googleDriveService;

    static final UUID USER_ID = UUID.fromString("123e4567-e89b-12d3-a456-426614174000");
    static final String EMAIL = "test@gmail.com";
    static final String REFRESH_TOKEN = "refresh-tok";
    static final String ACCESS_TOKEN = "access-tok";

    // --- Test 1: getAuthUrl ---

    @Test
    void givenClientConfig_whenGetAuthUrl_thenReturnsGoogleAccountsUrl() {
        String url = googleDriveService.getAuthUrl();
        assertNotNull(url);
        assertTrue(url.startsWith("https://accounts.google.com"),
                "Expected URL to start with accounts.google.com but was: " + url);
    }

    // --- Test 2: exchangeCode saves token ---

    @Test
    void givenValidAuthCode_whenExchangeCode_thenSavesRefreshToken() {
        when(oAuthRestClient.exchangeCode(any(), any(), any(), any(), any()))
                .thenReturn(new GoogleTokenResponse(ACCESS_TOKEN, REFRESH_TOKEN, "Bearer", 3600L));
        when(userInfoRestClient.getUserInfo(any()))
                .thenReturn(new GoogleUserInfoResponse(EMAIL, "Test User"));

        assertDoesNotThrow(() -> googleDriveService.exchangeCode("code123", USER_ID));
        verify(userIntegrationService).saveGoogleToken(USER_ID, EMAIL, REFRESH_TOKEN);
    }

    // --- Test 3: listFiles throws when no integration ---

    @Test
    void givenNoIntegration_whenListFiles_thenThrowsIllegalState() {
        when(userIntegrationService.getGoogleToken(USER_ID, EMAIL)).thenReturn(Optional.empty());
        assertThrows(IllegalStateException.class,
                () -> googleDriveService.listFiles(USER_ID, EMAIL, null));
    }

    // --- Test 4: listFiles returns Drive files ---

    @Test
    void givenValidIntegration_whenListFiles_thenReturnsDriveFiles() {
        mockValidIntegration();
        var file = new GoogleDriveFileResponse("id1", "doc.gdoc",
                "application/vnd.google-apps.document", null);
        when(driveApiRestClient.listFiles(any(), any(), any(), any()))
                .thenReturn(new GoogleDriveFileListResponse(List.of(file), null));

        List<DriveFileDTO> result = assertDoesNotThrow(
                () -> googleDriveService.listFiles(USER_ID, EMAIL, null));
        assertEquals(1, result.size());
        assertEquals("doc.gdoc", result.get(0).name());
    }

    // --- Test 5: extractText of Google Doc uses export ---

    @Test
    void givenGoogleDoc_whenExtractText_thenUsesExport() {
        mockValidIntegration();
        when(driveApiRestClient.getFileMeta(any(), eq("gid1"), any()))
                .thenReturn(new GoogleDriveFileResponse("gid1", "doc",
                        "application/vnd.google-apps.document", null));
        when(driveApiRestClient.exportAsText(any(), eq("gid1"), eq("text/plain")))
                .thenReturn("Conteúdo");

        String result = assertDoesNotThrow(
                () -> googleDriveService.extractTextFromFile(USER_ID, "gid1", EMAIL));
        assertEquals("Conteúdo", result);
        verify(driveApiRestClient, never()).downloadFileBytes(any(), any(), any());
    }

    // --- Test 6: extractText of DOCX uses download + DocxTextExtractor ---

    @Test
    void givenDocxFile_whenExtractText_thenUsesDocxExtractor() throws Exception {
        mockValidIntegration();
        byte[] docxBytes = makeMinimalDocx("Texto Test");
        when(driveApiRestClient.getFileMeta(any(), eq("did1"), any()))
                .thenReturn(new GoogleDriveFileResponse("did1", "f.docx",
                        "application/vnd.openxmlformats-officedocument.wordprocessingml.document", null));
        when(driveApiRestClient.downloadFileBytes(any(), eq("did1"), eq("media")))
                .thenReturn(docxBytes);

        String result = assertDoesNotThrow(
                () -> googleDriveService.extractTextFromFile(USER_ID, "did1", EMAIL));
        assertTrue(result.contains("Texto Test"),
                "Expected 'Texto Test' in extracted text but got: " + result);
    }

    // --- Test 7: legacy .doc throws UnsupportedOperationException ---

    @Test
    void givenLegacyDoc_whenExtractText_thenThrowsUnsupported() {
        mockValidIntegration();
        when(driveApiRestClient.getFileMeta(any(), eq("docid"), any()))
                .thenReturn(new GoogleDriveFileResponse("docid", "old.doc",
                        "application/msword", null));

        assertThrows(UnsupportedOperationException.class,
                () -> googleDriveService.extractTextFromFile(USER_ID, "docid", EMAIL));
    }

    // --- Helpers ---

    private void mockValidIntegration() {
        UserIntegration integration = new UserIntegration(
                UUID.randomUUID(), USER_ID, "GOOGLE_DRIVE", EMAIL, REFRESH_TOKEN,
                Instant.now(), Instant.now()
        );
        when(userIntegrationService.getGoogleToken(USER_ID, EMAIL))
                .thenReturn(Optional.of(integration));
        when(oAuthRestClient.refreshToken(any(), any(), any(), any()))
                .thenReturn(new GoogleTokenResponse(ACCESS_TOKEN, null, "Bearer", 3600L));
    }

    private byte[] makeMinimalDocx(String text) throws Exception {
        ByteArrayOutputStream baos = new ByteArrayOutputStream();
        try (ZipOutputStream zos = new ZipOutputStream(baos)) {
            zos.putNextEntry(new ZipEntry("word/document.xml"));
            String xml = "<?xml version='1.0' encoding='UTF-8'?>"
                    + "<w:document xmlns:w=\"http://schemas.openxmlformats.org/wordprocessingml/2006/main\">"
                    + "<w:body><w:p><w:r><w:t>" + text + "</w:t></w:r></w:p></w:body></w:document>";
            zos.write(xml.getBytes(StandardCharsets.UTF_8));
            zos.closeEntry();
        }
        return baos.toByteArray();
    }
}
