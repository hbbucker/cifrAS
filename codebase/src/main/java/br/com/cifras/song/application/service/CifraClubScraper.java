package br.com.cifras.song.application.service;

import br.com.cifras.song.dto.CreateSongRequest;
import br.com.cifras.song.application.parser.CifraClubParser;
import br.com.cifras.song.model.LyricsStructure;
import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;

import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.util.regex.Matcher;
import java.util.regex.Pattern;
import java.util.List;

@ApplicationScoped
public class CifraClubScraper {

    @Inject
    ObjectMapper objectMapper;

    private static final Pattern NEXT_F_PATTERN = Pattern.compile("self\\.__next_f\\.push\\(\\[\\d+,\"(.*?)\"\\]\\)");
    private static final Pattern PRE_PATTERN = Pattern.compile("<pre[^>]*>(.*?)</pre>", Pattern.DOTALL);
    private static final Pattern TAGS_PATTERN = Pattern.compile("<[^>]+>");
    private static final Pattern TITLE_PATTERN = Pattern.compile("<title>(.*?)</title>");

    public CreateSongRequest scrapeAndParse(String urlStr) {
        try {
            HttpClient client = HttpClient.newHttpClient();
            HttpRequest req = HttpRequest.newBuilder()
                    .uri(URI.create(urlStr))
                    .header("User-Agent", "Mozilla/5.0 (Windows NT 10.0; Win64; x64)")
                    .build();
                    
            HttpResponse<String> response = client.send(req, HttpResponse.BodyHandlers.ofString());
            String html = response.body();

            // Extract title and artist
            String title = "Imported Song";
            String artist = "Unknown Artist";
            Matcher titleMatcher = TITLE_PATTERN.matcher(html);
            if (titleMatcher.find()) {
                String fullTitle = titleMatcher.group(1); // "Ah, Jesus / Coração Igual Ao Teu - Julliany Souza - Cifra Club"
                String[] parts = fullTitle.split(" - ");
                if (parts.length >= 2) {
                    title = parts[0].trim();
                    artist = parts[1].trim();
                } else {
                    title = fullTitle.replace("- Cifra Club", "").trim();
                }
            }

            // removed useless __next_f logic
            Matcher pre = PRE_PATTERN.matcher(html);
            LyricsStructure lyrics = LyricsStructure.empty();
            if (pre.find()) {
                String content = pre.group(1);
                // Strip HTML tags (like <b> and </b>)
                String plainText = TAGS_PATTERN.matcher(content).replaceAll("");
                lyrics = CifraClubParser.parse(plainText);
            }

            return new CreateSongRequest(title, artist, "C", lyrics, List.of("imported"));
        } catch (Exception e) {
            throw new RuntimeException("Failed to scrape URL: " + urlStr, e);
        }
    }
}
