package br.com.cifras.song.application.service;

import br.com.cifras.song.application.parser.CifraClubParser;
import br.com.cifras.song.application.service.provider.SongScraperProvider;
import br.com.cifras.song.dto.CreateSongRequest;
import br.com.cifras.song.model.LyricsStructure;
import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;

import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.util.List;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

@ApplicationScoped
public class CifraClubScraper implements SongScraperProvider {

    @Inject
    ObjectMapper objectMapper;

    private static final Pattern PRE_PATTERN = Pattern.compile("<pre[^>]*>(.*?)</pre>", Pattern.DOTALL);
    private static final Pattern TAGS_PATTERN = Pattern.compile("<[^>]+>");
    private static final Pattern TITLE_PATTERN = Pattern.compile("<title>(.*?)</title>");
    private static final Pattern KEY_PATTERN = Pattern.compile("id=[\"']cifra_tom[\"'][^>]*>.*?<a[^>]*>\\s*([A-G][#b]?m?)\\s*</a>", Pattern.DOTALL);
    private static final Pattern KEY_FALLBACK_PATTERN = Pattern.compile("Tom:\\s*<[^>]*>\\s*([A-G][#b]?m?)", Pattern.CASE_INSENSITIVE);

    @Override
    public boolean supports(String url) {
        if (url == null) return false;
        String lower = url.toLowerCase();
        return lower.contains("cifraclub.com.br") || lower.contains("cifraclub.com");
    }

    @Override
    public String getProviderName() {
        return "cifraclub";
    }

    @Override
    public CreateSongRequest scrapeAndParse(String urlStr) {
        try {
            HttpClient client = HttpClient.newHttpClient();
            HttpRequest req = HttpRequest.newBuilder()
                    .uri(URI.create(urlStr))
                    .header("User-Agent", "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36")
                    .build();

            HttpResponse<String> response = client.send(req, HttpResponse.BodyHandlers.ofString());
            return parseHtml(response.body());
        } catch (Exception e) {
            throw new RuntimeException("Failed to scrape URL: " + urlStr, e);
        }
    }

    public CreateSongRequest parseHtml(String html) {
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

        // Extract key if present
        String key = "C";
        Matcher keyMatcher = KEY_PATTERN.matcher(html);
        if (keyMatcher.find()) {
            key = keyMatcher.group(1).trim();
        } else {
            Matcher keyFallbackMatcher = KEY_FALLBACK_PATTERN.matcher(html);
            if (keyFallbackMatcher.find()) {
                key = keyFallbackMatcher.group(1).trim();
            }
        }

        Matcher pre = PRE_PATTERN.matcher(html);
        LyricsStructure lyrics = LyricsStructure.empty();
        if (pre.find()) {
            String content = pre.group(1);
            // Strip HTML tags (like <b> and </b>)
            String plainText = TAGS_PATTERN.matcher(content).replaceAll("");
            lyrics = CifraClubParser.parse(plainText);
        }

        return new CreateSongRequest(title, artist, key, lyrics, List.of("imported", "cifraclub"));
    }
}
