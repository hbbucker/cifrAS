package br.com.cifras.integration.application;

import br.com.cifras.user.application.UserIntegrationService;
import br.com.cifras.user.model.UserIntegration;
import com.google.api.client.auth.oauth2.BearerToken;
import com.google.api.client.auth.oauth2.Credential;
import com.google.api.client.auth.oauth2.TokenResponse;
import com.google.api.client.googleapis.auth.oauth2.GoogleAuthorizationCodeFlow;
import com.google.api.client.googleapis.javanet.GoogleNetHttpTransport;
import com.google.api.client.http.HttpTransport;
import com.google.api.client.http.HttpRequestFactory;
import com.google.api.client.http.HttpRequest;
import com.google.api.client.http.GenericUrl;
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
import java.util.Arrays;
import java.util.Map;

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
                Arrays.asList(DriveScopes.DRIVE_READONLY, "email", "profile"))
                .setAccessType("offline")
                .build();
    }

    public String getAuthUrl() throws Exception {
        return getFlow().newAuthorizationUrl().setRedirectUri(redirectUri).set("prompt", "select_account").build();
    }

    public void exchangeCode(String code, UUID userId) throws Exception {
        HttpTransport httpTransport = GoogleNetHttpTransport.newTrustedTransport();
        TokenResponse response = getFlow().newTokenRequest(code).setRedirectUri(redirectUri).execute();
        
        String refreshToken = response.getRefreshToken();
        
        Credential credential = new Credential.Builder(BearerToken.authorizationHeaderAccessMethod())
                .setTransport(httpTransport)
                .setJsonFactory(JSON_FACTORY)
                .build();
        credential.setAccessToken(response.getAccessToken());

        HttpRequestFactory requestFactory = httpTransport.createRequestFactory(credential);
        GenericUrl url = new GenericUrl("https://www.googleapis.com/oauth2/v2/userinfo");
        HttpRequest request = requestFactory.buildGetRequest(url);
        String jsonResponse = request.execute().parseAsString();
        
        @SuppressWarnings("unchecked")
        Map<String, Object> userInfo = JSON_FACTORY.fromString(jsonResponse, Map.class);
        String email = (String) userInfo.get("email");

        if (email != null && refreshToken != null) {
            integrationService.saveGoogleToken(userId, email, refreshToken);
        }
    }

    private Drive getDriveClient(UUID userId, String email) throws Exception {
        Optional<UserIntegration> integration = integrationService.getGoogleToken(userId, email);
        if (integration.isEmpty()) {
            throw new IllegalStateException("User has no Google Drive integration for this email");
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

    private String getFullFolderPath(Drive drive, String folderId, Map<String, String> cache) {
        if (folderId == null) return "Meu Drive";
        if (cache.containsKey(folderId)) return cache.get(folderId);

        try {
            File folder = drive.files().get(folderId).setFields("id, name, parents").execute();
            String name = folder.getName();
            String path;
            if (folder.getParents() != null && !folder.getParents().isEmpty()) {
                String parentId = folder.getParents().get(0);
                String parentPath = getFullFolderPath(drive, parentId, cache);
                if ("Meu Drive".equals(parentPath)) {
                    path = "Meu Drive / " + name;
                } else {
                    path = parentPath + " / " + name;
                }
            } else {
                path = "Meu Drive / " + name;
            }
            cache.put(folderId, path);
            return path;
        } catch (Exception e) {
            return "Meu Drive";
        }
    }

    public List<br.com.cifras.integration.dto.DriveFileDTO> listFiles(UUID userId, String email, String searchQuery) throws Exception {
        Drive drive = getDriveClient(userId, email);
        
        String query = "(mimeType='application/vnd.google-apps.document' or mimeType='application/msword' or mimeType='application/vnd.openxmlformats-officedocument.wordprocessingml.document')";
        if (searchQuery != null && !searchQuery.trim().isEmpty()) {
            query += " and name contains '" + searchQuery.replace("'", "\\'") + "'";
        }
        
        FileList result = drive.files().list()
                .setQ(query)
                .setSpaces("drive")
                .setFields("nextPageToken, files(id, name, mimeType, parents)")
                .execute();
                
        List<File> files = result.getFiles();
        if (files == null || files.isEmpty()) {
            return Collections.emptyList();
        }
        
        java.util.Map<String, String> folderCache = new java.util.HashMap<>();
        List<br.com.cifras.integration.dto.DriveFileDTO> dtos = new java.util.ArrayList<>();
        for (File f : files) {
            String parentPath = "Meu Drive";
            if (f.getParents() != null && !f.getParents().isEmpty()) {
                String pid = f.getParents().get(0);
                parentPath = getFullFolderPath(drive, pid, folderCache);
            }
            dtos.add(new br.com.cifras.integration.dto.DriveFileDTO(f.getId(), f.getName(), f.getMimeType(), parentPath));
        }
        
        return dtos;
    }

    public String extractTextFromFile(UUID userId, String fileId, String email) throws Exception {
        Drive drive = getDriveClient(userId, email);
        
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
