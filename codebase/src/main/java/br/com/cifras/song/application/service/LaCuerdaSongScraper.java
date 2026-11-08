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
import java.nio.charset.Charset;
import java.nio.charset.StandardCharsets;
import java.util.List;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

@ApplicationScoped
public class LaCuerdaSongScraper implements SongScraperProvider {

    private static final Pattern PRE_PATTERN = Pattern.compile("<pre[^>]*>(.*?)</pre>", Pattern.DOTALL | Pattern.CASE_INSENSITIVE);
    private static final Pattern TITLE_PATTERN = Pattern.compile("<title>(.*?)</title>", Pattern.CASE_INSENSITIVE);
    private static final Pattern TAGS_PATTERN = Pattern.compile("<[^>]+>");
    private static final Pattern CHARSET_PATTERN = Pattern.compile("charset=([a-zA-Z0-9_-]+)", Pattern.CASE_INSENSITIVE);

    // Common Spanish section header pattern e.g. "CORO:", "VERSO 1:", "INTRO:"
    private static final Pattern SPANISH_SECTION_LINE = Pattern.compile("^(INTRO|VERSO|CORO|ESTRIBILLO|PUENTE|SOLO|FINAL|OUTRO)(\\s+[0-9A-Za-z]+)?\\s*:\\s*$", Pattern.CASE_INSENSITIVE);

    @Override
    public boolean supports(String url) {
        if (url == null) return false;
        String lower = url.toLowerCase();
        return lower.contains("lacuerda.net");
    }

    @Override
    public String getProviderName() {
        return "lacuerda";
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
                    .header("Accept-Language", "es-ES,es;q=0.9,en;q=0.8")
                    .build();

            HttpResponse<byte[]> response = client.send(req, HttpResponse.BodyHandlers.ofByteArray());
            
            // Detect charset from headers or default to ISO-8859-1 for LaCuerda
            Charset charset = StandardCharsets.ISO_8859_1;
            String contentType = response.headers().firstValue("Content-Type").orElse("");
            Matcher charsetMatcher = CHARSET_PATTERN.matcher(contentType);
            if (charsetMatcher.find()) {
                try {
                    charset = Charset.forName(charsetMatcher.group(1));
                } catch (Exception ignored) {
                    charset = StandardCharsets.ISO_8859_1;
                }
            }

            String html = new String(response.body(), charset);
            return parseHtml(html);
        } catch (Exception e) {
            throw new RuntimeException("Failed to scrape LaCuerda URL: " + urlStr, e);
        }
    }

    public CreateSongRequest parseHtml(String html) {
        String title = "Imported Song";
        String artist = "Unknown Artist";
        String key = "C";

        // Extract title & artist from <title>
        // Example: "Julieta Venegas, Limón Y Sal: Acordes" or "Limón Y Sal (Julieta Venegas) Acordes"
        Matcher titleMatcher = TITLE_PATTERN.matcher(html);
        if (titleMatcher.find()) {
            String rawTitle = titleMatcher.group(1).replace("&amp;", "&").trim();
            rawTitle = rawTitle.replaceAll("(?i):\\s*Acordes.*", "")
                    .replaceAll("(?i)\\s*Acordes.*", "")
                    .replaceAll("(?i)\\s*-\\s*LaCuerda\\.net.*", "")
                    .trim();

            if (rawTitle.contains(",")) {
                String[] parts = rawTitle.split(",", 2);
                artist = parts[0].trim();
                title = parts[1].trim();
            } else if (rawTitle.contains(" - ")) {
                String[] parts = rawTitle.split(" - ", 2);
                title = parts[0].trim();
                artist = parts[1].trim();
            } else {
                title = rawTitle;
            }
        }

        Matcher pre = PRE_PATTERN.matcher(html);
        LyricsStructure lyrics = LyricsStructure.empty();
        if (pre.find()) {
            String content = pre.group(1);
            String plainText = TAGS_PATTERN.matcher(content).replaceAll("");
            String normalizedText = normalizeSpanishSections(plainText);
            String internationalizedChords = convertLatinNotationToStandard(normalizedText);
            lyrics = CifraClubParser.parse(internationalizedChords);
        }

        return new CreateSongRequest(title, artist, key, lyrics, List.of("imported", "lacuerda"));
    }

    private String normalizeSpanishSections(String text) {
        String[] lines = text.split("\\r?\\n");
        StringBuilder sb = new StringBuilder();
        for (String line : lines) {
            String trimmed = line.trim();
            Matcher matcher = SPANISH_SECTION_LINE.matcher(trimmed);
            if (matcher.matches()) {
                String sectionName = trimmed.substring(0, trimmed.length() - 1).trim();
                sb.append("[").append(sectionName).append("]\n");
            } else {
                sb.append(line).append("\n");
            }
        }
        return sb.toString();
    }

    /**
     * Converts Latin notation (Do, Re, Mi, Fa, Sol, La, Si) to standard (C, D, E, F, G, A, B)
     * if found in whole chord tokens.
     */
    private String convertLatinNotationToStandard(String text) {
        return text.replaceAll("(?<=\\b|/)Do(?=[#b]?m?\\b|[0-9/])", "C")
                   .replaceAll("(?<=\\b|/)Re(?=[#b]?m?\\b|[0-9/])", "D")
                   .replaceAll("(?<=\\b|/)Mi(?=[#b]?m?\\b|[0-9/])", "E")
                   .replaceAll("(?<=\\b|/)Fa(?=[#b]?m?\\b|[0-9/])", "F")
                   .replaceAll("(?<=\\b|/)Sol(?=[#b]?m?\\b|[0-9/])", "G")
                   .replaceAll("(?<=\\b|/)La(?=[#b]?m?\\b|[0-9/])", "A")
                   .replaceAll("(?<=\\b|/)Si(?=[#b]?m?\\b|[0-9/])", "B");
    }
}
