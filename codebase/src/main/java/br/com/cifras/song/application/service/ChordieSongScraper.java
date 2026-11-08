package br.com.cifras.song.application.service;

import br.com.cifras.song.application.parser.ChordProParser;
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
public class ChordieSongScraper implements SongScraperProvider {

    private static final Pattern PRE_PATTERN = Pattern.compile("<pre[^>]*>(.*?)</pre>", Pattern.DOTALL | Pattern.CASE_INSENSITIVE);
    private static final Pattern TITLE_PATTERN = Pattern.compile("<title>(.*?)</title>", Pattern.CASE_INSENSITIVE);
    private static final Pattern TAGS_PATTERN = Pattern.compile("<[^>]+>");

    @Override
    public boolean supports(String url) {
        if (url == null) return false;
        String lower = url.toLowerCase();
        return lower.contains("chordie.com");
    }

    @Override
    public String getProviderName() {
        return "chordie";
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
            throw new RuntimeException("Failed to scrape Chordie URL: " + urlStr, e);
        }
    }

    public CreateSongRequest parseHtml(String html) {
        String title = "Imported Song";
        String artist = "Unknown Artist";
        String key = "C";

        // Try extracting metadata from HTML <title>
        Matcher titleMatcher = TITLE_PATTERN.matcher(html);
        if (titleMatcher.find()) {
            String fullTitle = titleMatcher.group(1).replace("&amp;", "&").trim();
            // Example: "Hotel California Chords by Eagles @ Chordie"
            fullTitle = fullTitle.replaceAll("(?i)\\s+Chords\\s+(by|By)\\s+", " - ")
                    .replaceAll("(?i)\\s*@\\s*Chordie.*", "")
                    .replaceAll("(?i)\\s*-\\s*Chordie.*", "")
                    .trim();

            String[] parts = fullTitle.split(" - ");
            if (parts.length >= 2) {
                title = parts[0].trim();
                artist = parts[1].trim();
            } else {
                title = fullTitle;
            }
        }

        LyricsStructure lyrics = LyricsStructure.empty();

        Matcher preMatcher = PRE_PATTERN.matcher(html);
        if (preMatcher.find()) {
            String rawContent = preMatcher.group(1);
            String plainText = TAGS_PATTERN.matcher(rawContent).replaceAll("");

            // If it contains ChordPro brackets or directives
            if (plainText.contains("{") || (plainText.contains("[") && plainText.contains("]"))) {
                ChordProParser.ParseResult parsed = ChordProParser.parse(plainText);
                if (parsed.getTitle() != null && !parsed.getTitle().isBlank()) {
                    title = parsed.getTitle();
                }
                if (parsed.getArtist() != null && !parsed.getArtist().isBlank()) {
                    artist = parsed.getArtist();
                }
                if (parsed.getKey() != null && !parsed.getKey().isBlank()) {
                    key = parsed.getKey();
                }
                lyrics = parsed.getLyrics();
            } else {
                lyrics = CifraClubParser.parse(plainText);
            }
        }

        return new CreateSongRequest(title, artist, key, lyrics, List.of("imported", "chordie"));
    }
}
