package br.com.cifras.song.application.service;

import br.com.cifras.song.application.parser.CifraClubParser;
import br.com.cifras.song.application.service.provider.SongScraperProvider;
import br.com.cifras.song.dto.CreateSongRequest;
import br.com.cifras.song.model.LyricsStructure;
import jakarta.enterprise.context.ApplicationScoped;

import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.util.List;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

@ApplicationScoped
public class EChordsSongScraper implements SongScraperProvider {

    private static final Pattern PRE_CORE_PATTERN = Pattern.compile("<pre[^>]*id=[\"']core[\"'][^>]*>(.*?)</pre>", Pattern.DOTALL | Pattern.CASE_INSENSITIVE);
    private static final Pattern PRE_GENERIC_PATTERN = Pattern.compile("<pre[^>]*>(.*?)</pre>", Pattern.DOTALL | Pattern.CASE_INSENSITIVE);
    private static final Pattern TITLE_PATTERN = Pattern.compile("<title>(.*?)</title>", Pattern.CASE_INSENSITIVE);
    private static final Pattern TAGS_PATTERN = Pattern.compile("<[^>]+>");
    private static final Pattern KEY_PATTERN = Pattern.compile("Key:\\s*<b>([A-G][#b]?m?)</b>", Pattern.CASE_INSENSITIVE);

    @Override
    public boolean supports(String url) {
        if (url == null) return false;
        String lower = url.toLowerCase();
        return lower.contains("e-chords.com") || lower.contains("echords.com");
    }

    @Override
    public String getProviderName() {
        return "e-chords";
    }

    @Override
    public CreateSongRequest scrapeAndParse(String urlStr) {
        try {
            HttpClient client = HttpClient.newBuilder()
                    .followRedirects(HttpClient.Redirect.ALWAYS)
                    .build();

            HttpRequest req = HttpRequest.newBuilder()
                    .uri(URI.create(urlStr))
                    .header("User-Agent", "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36")
                    .header("Accept-Language", "en-US,en;q=0.9")
                    .build();

            HttpResponse<String> response = client.send(req, HttpResponse.BodyHandlers.ofString());
            return parseHtml(response.body());
        } catch (Exception e) {
            throw new RuntimeException("Failed to scrape e-Chords URL: " + urlStr, e);
        }
    }

    public CreateSongRequest parseHtml(String html) {
        String title = "Imported Song";
        String artist = "Unknown Artist";
        String key = "C";

        // Extract Title & Artist
        // Example: "More Than Words chords by Extreme - E-Chords"
        Matcher titleMatcher = TITLE_PATTERN.matcher(html);
        if (titleMatcher.find()) {
            String rawTitle = titleMatcher.group(1).replace("&amp;", "&").trim();
            rawTitle = rawTitle.replaceAll("(?i)\\s+chords\\s+by\\s+", " - ")
                    .replaceAll("(?i)\\s*-\\s*E-Chords.*", "")
                    .replaceAll("(?i)\\s*@\\s*E-Chords.*", "")
                    .trim();

            String[] parts = rawTitle.split(" - ");
            if (parts.length >= 2) {
                title = parts[0].trim();
                artist = parts[1].trim();
            } else {
                title = rawTitle;
            }
        }

        // Extract key if present
        Matcher keyMatcher = KEY_PATTERN.matcher(html);
        if (keyMatcher.find()) {
            key = keyMatcher.group(1).trim();
        }

        LyricsStructure lyrics = LyricsStructure.empty();

        // Extract from <pre id="core"> or fallback <pre>
        Matcher preMatcher = PRE_CORE_PATTERN.matcher(html);
        String rawContent = null;
        if (preMatcher.find()) {
            rawContent = preMatcher.group(1);
        } else {
            Matcher genericMatcher = PRE_GENERIC_PATTERN.matcher(html);
            if (genericMatcher.find()) {
                rawContent = genericMatcher.group(1);
            }
        }

        if (rawContent != null) {
            String plainText = TAGS_PATTERN.matcher(rawContent).replaceAll("");
            lyrics = CifraClubParser.parse(plainText);
        }

        return new CreateSongRequest(title, artist, key, lyrics, List.of("imported", "e-chords"));
    }
}
