package br.com.cifras.integration.application;

import br.com.cifras.user.application.UserIntegrationService;
import br.com.cifras.user.model.UserIntegration;
import com.google.api.client.auth.oauth2.BearerToken;
import com.google.api.client.auth.oauth2.Credential;
import com.google.api.client.auth.oauth2.TokenResponse;
import com.google.api.client.googleapis.auth.oauth2.GoogleAuthorizationCodeFlow;
import com.google.api.client.googleapis.javanet.GoogleNetHttpTransport;
import com.google.api.client.http.HttpTransport;
import com.google.api.client.json.JsonFactory;
import com.google.api.client.json.gson.GsonFactory;
import com.google.api.services.drive.Drive;
import com.google.api.services.drive.DriveScopes;
import com.google.api.services.drive.model.File;
import com.google.api.services.drive.model.FileList;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import org.apache.poi.extractor.ExtractorFactory;
import org.apache.poi.extractor.POITextExtractor;
import org.eclipse.microprofile.config.inject.ConfigProperty;

import java.io.InputStream;
import java.util.Collections;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@ApplicationScoped
public class GoogleDriveService {

    private final UserIntegrationService integrationService;
    private final String clientId;
    private final String clientSecret;
    private final String redirectUri;
    private static final JsonFactory JSON_FACTORY = GsonFactory.getDefaultInstance();

    @Inject
    public GoogleDriveService(
            UserIntegrationService integrationService,
            @ConfigProperty(name = "google.client.id", defaultValue = "dummy-client-id") String clientId,
            @ConfigProperty(name = "google.client.secret", defaultValue = "dummy-client-secret") String clientSecret,
            @ConfigProperty(name = "google.redirect.uri", defaultValue = "http://localhost:5173/settings/integrations/google-callback") String redirectUri) {
        this.integrationService = integrationService;
        this.clientId = clientId;
        this.clientSecret = clientSecret;
        this.redirectUri = redirectUri;
    }

    private GoogleAuthorizationCodeFlow getFlow() throws Exception {
        HttpTransport httpTransport = GoogleNetHttpTransport.newTrustedTransport();
        return new GoogleAuthorizationCodeFlow.Builder(
                httpTransport, JSON_FACTORY, clientId, clientSecret,
                Collections.singletonList(DriveScopes.DRIVE_READONLY))
                .setAccessType("offline")
                .setApprovalPrompt("force")
                .build();
    }

    public String getAuthUrl() throws Exception {
        return getFlow().newAuthorizationUrl().setRedirectUri(redirectUri).build();
    }

    public void exchangeCode(String code, UUID userId) throws Exception {
        TokenResponse response = getFlow().newTokenRequest(code).setRedirectUri(redirectUri).execute();
        
        String refreshToken = response.getRefreshToken();
        // Google might not return a refresh token if the user has already authorized the app
        if (refreshToken != null) {
            integrationService.saveGoogleToken(userId, "drive_user@gmail.com", refreshToken);
        }
    }

    private Drive getDriveClient(UUID userId) throws Exception {
        Optional<UserIntegration> integration = integrationService.getGoogleToken(userId);
        if (integration.isEmpty()) {
            throw new IllegalStateException("User has no Google Drive integration");
        }

        HttpTransport httpTransport = GoogleNetHttpTransport.newTrustedTransport();
        
        Credential credential = new Credential.Builder(BearerToken.authorizationHeaderAccessMethod())
                .setTransport(httpTransport)
                .setJsonFactory(JSON_FACTORY)
                .setTokenServerEncodedUrl("https://oauth2.googleapis.com/token")
                .setClientAuthentication(new com.google.api.client.auth.oauth2.ClientParametersAuthentication(clientId, clientSecret))
                .build();
        credential.setRefreshToken(integration.get().getRefreshToken());
        
        return new Drive.Builder(httpTransport, JSON_FACTORY, credential)
                .setApplicationName("CifrAS")
                .build();
    }

    public List<File> listFiles(UUID userId) throws Exception {
        Drive drive = getDriveClient(userId);
        FileList result = drive.files().list()
                .setQ("mimeType='application/vnd.google-apps.document' or mimeType='application/msword' or mimeType='application/vnd.openxmlformats-officedocument.wordprocessingml.document'")
                .setSpaces("drive")
                .setFields("nextPageToken, files(id, name, mimeType)")
                .execute();
        return result.getFiles();
    }

    public String extractTextFromFile(UUID userId, String fileId) throws Exception {
        Drive drive = getDriveClient(userId);
        
        File fileMeta = drive.files().get(fileId).setFields("mimeType").execute();
        String mimeType = fileMeta.getMimeType();
        
        InputStream in;
        if ("application/vnd.google-apps.document".equals(mimeType)) {
            // Google Docs format must be exported
            in = drive.files().export(fileId, "text/plain").executeMediaAsInputStream();
            return new String(in.readAllBytes());
        } else {
            // Native Word Documents
            in = drive.files().get(fileId).executeMediaAsInputStream();
            try (POITextExtractor extractor = ExtractorFactory.createExtractor(in)) {
                return extractor.getText();
            }
        }
    }
}
