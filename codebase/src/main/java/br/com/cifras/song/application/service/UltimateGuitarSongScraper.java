package br.com.cifras.song.application.service;

import br.com.cifras.song.application.parser.CifraClubParser;
import br.com.cifras.song.application.service.provider.SongScraperProvider;
import br.com.cifras.song.dto.CreateSongRequest;
import br.com.cifras.song.model.LyricsStructure;
import com.fasterxml.jackson.core.json.JsonReadFeature;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.json.JsonMapper;
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
public class UltimateGuitarSongScraper implements SongScraperProvider {

    @Inject
    ObjectMapper objectMapper;

    private static final ObjectMapper LENIENT_MAPPER = JsonMapper.builder()
            .enable(JsonReadFeature.ALLOW_UNESCAPED_CONTROL_CHARS)
            .build();

    private static final Pattern JS_STORE_PATTERN = Pattern.compile("class=[\"']js-store[\"'][^>]*data-content=([\"'])(.*?)\\1", Pattern.DOTALL);
    private static final Pattern WINDOW_UGAPP_PATTERN = Pattern.compile("window\\.UGAPP\\.store\\.page\\s*=\\s*(\\{.*?\\});</script>", Pattern.DOTALL);
    private static final Pattern TITLE_PATTERN = Pattern.compile("<title>(.*?)</title>", Pattern.CASE_INSENSITIVE);
    private static final Pattern CH_TAG_PATTERN = Pattern.compile("\\[/?ch\\]", Pattern.CASE_INSENSITIVE);
    private static final Pattern TAB_TAG_PATTERN = Pattern.compile("\\[/?tab\\]", Pattern.CASE_INSENSITIVE);

    @Override
    public boolean supports(String url) {
        if (url == null) return false;
        String lower = url.toLowerCase();
        return lower.contains("ultimate-guitar.com") || lower.contains("ultimateguitar.com");
    }

    @Override
    public String getProviderName() {
        return "ultimate-guitar";
    }

    @Override
    public CreateSongRequest scrapeAndParse(String urlStr) {
        try {
            HttpClient client = HttpClient.newBuilder()
                    .followRedirects(HttpClient.Redirect.ALWAYS)
                    .build();

            HttpRequest req = HttpRequest.newBuilder()
                    .uri(URI.create(urlStr))
                    .header("User-Agent", "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36")
                    .header("Accept", "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8")
                    .header("Accept-Language", "en-US,en;q=0.9")
                    .build();

            HttpResponse<String> response = client.send(req, HttpResponse.BodyHandlers.ofString());
            return parseHtml(response.body());
        } catch (Exception e) {
            throw new RuntimeException("Failed to scrape Ultimate Guitar URL: " + urlStr, e);
        }
    }

    public CreateSongRequest parseHtml(String html) {
        String title = "Imported Song";
        String artist = "Unknown Artist";
        String key = "C";
        String contentText = "";

        // Try extracting JSON from js-store or window.UGAPP
        String jsonPayload = null;
        Matcher jsStoreMatcher = JS_STORE_PATTERN.matcher(html);
        if (jsStoreMatcher.find()) {
            jsonPayload = unescapeHtml(jsStoreMatcher.group(2));
        } else {
            Matcher ugAppMatcher = WINDOW_UGAPP_PATTERN.matcher(html);
            if (ugAppMatcher.find()) {
                jsonPayload = ugAppMatcher.group(1);
            }
        }

        if (jsonPayload != null && !jsonPayload.isBlank()) {
            try {
                ObjectMapper mapper = LENIENT_MAPPER != null ? LENIENT_MAPPER : objectMapper;
                JsonNode root = mapper.readTree(jsonPayload);
                JsonNode pageData = root.path("data");
                if (pageData.isMissingNode() && root.has("page")) {
                    pageData = root.path("page").path("data");
                }

                // Extract song name and artist
                JsonNode tabNode = pageData.path("tab");
                if (!tabNode.isMissingNode()) {
                    if (tabNode.hasNonNull("song_name")) {
                        title = tabNode.get("song_name").asText();
                    }
                    if (tabNode.hasNonNull("artist_name")) {
                        artist = tabNode.get("artist_name").asText();
                    }
                    if (tabNode.hasNonNull("tonality_name") && !tabNode.get("tonality_name").asText().isBlank()) {
                        key = tabNode.get("tonality_name").asText();
                    }
                }

                // Check tab_view for content and tonality meta
                JsonNode tabViewNode = pageData.path("tab_view");
                if (!tabViewNode.isMissingNode()) {
                    JsonNode wikiTab = tabViewNode.path("wiki_tab");
                    if (wikiTab.hasNonNull("content")) {
                        contentText = wikiTab.get("content").asText();
                    }
                    JsonNode meta = tabViewNode.path("meta");
                    if (meta.hasNonNull("tonality") && !meta.get("tonality").asText().isBlank()) {
                        key = meta.get("tonality").asText();
                    }
                }
            } catch (Exception ignored) {
                // Fallback to HTML regex extraction
            }
        }

        // Fallback title / artist if missing
        if ("Imported Song".equals(title) || "Unknown Artist".equals(artist)) {
            Matcher titleMatcher = TITLE_PATTERN.matcher(html);
            if (titleMatcher.find()) {
                String fullTitle = titleMatcher.group(1);
                // Example: "Hallelujah Chords by Jeff Buckley @ Ultimate-Guitar.Com"
                fullTitle = fullTitle.replaceAll("(?i)\\s+Chords\\s+(by|By)\\s+", " - ")
                        .replaceAll("(?i)\\s*@\\s*Ultimate-Guitar\\.Com.*", "")
                        .replaceAll("(?i)\\s*-\\s*Ultimate Guitar.*", "")
                        .trim();
                String[] parts = fullTitle.split(" - ");
                if (parts.length >= 2) {
                    title = parts[0].trim();
                    artist = parts[1].trim();
                } else {
                    title = fullTitle;
                }
            }
        }

        // Clean content
        LyricsStructure lyrics = LyricsStructure.empty();
        if (!contentText.isBlank()) {
            String cleanText = cleanUgContent(contentText);
            lyrics = CifraClubParser.parse(cleanText);
        } else {
            // Check for pre tag fallback
            Pattern prePattern = Pattern.compile("<pre[^>]*>(.*?)</pre>", Pattern.DOTALL);
            Matcher preMatcher = prePattern.matcher(html);
            if (preMatcher.find()) {
                String preContent = preMatcher.group(1).replaceAll("<[^>]+>", "");
                lyrics = CifraClubParser.parse(cleanUgContent(preContent));
            }
        }

        return new CreateSongRequest(title, artist, key, lyrics, List.of("imported", "ultimate-guitar"));
    }

    private String cleanUgContent(String content) {
        String clean = CH_TAG_PATTERN.matcher(content).replaceAll("");
        clean = TAB_TAG_PATTERN.matcher(clean).replaceAll("");
        return clean;
    }

    private String unescapeHtml(String input) {
        if (input == null) return "";
        return input.replace("&quot;", "\"")
                .replace("&amp;", "&")
                .replace("&lt;", "<")
                .replace("&gt;", ">")
                .replace("&#39;", "'")
                .replace("&apos;", "'");
    }
}
