package br.com.cifras.song.application.parser;

import br.com.cifras.song.model.ChordPosition;
import br.com.cifras.song.model.Line;
import br.com.cifras.song.model.LyricsStructure;
import br.com.cifras.song.model.Section;

import java.util.ArrayList;
import java.util.List;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

/**
 * Parser for ChordPro format chords and lyrics.
 */
public class ChordProParser {

    private static final Pattern DIRECTIVE_PATTERN = Pattern.compile("^\\s*\\{([a-zA-Z0-9_-]+)(?::\\s*(.*?))?\\}\\s*$");
    private static final Pattern SECTION_BRACKET_PATTERN = Pattern.compile("^\\s*\\[(.*)\\]\\s*$");
    private static final Pattern INLINE_CHORD_PATTERN = Pattern.compile("\\[([A-G][#b]?[^\\]]*)\\]");

    public static class ParseResult {
        private final LyricsStructure lyrics;
        private final String title;
        private final String artist;
        private final String key;

        public ParseResult(LyricsStructure lyrics, String title, String artist, String key) {
            this.lyrics = lyrics;
            this.title = title;
            this.artist = artist;
            this.key = key;
        }

        public LyricsStructure getLyrics() { return lyrics; }
        public String getTitle() { return title; }
        public String getArtist() { return artist; }
        public String getKey() { return key; }
    }

    public static ParseResult parse(String text) {
        if (text == null || text.isBlank()) {
            return new ParseResult(LyricsStructure.empty(), null, null, null);
        }

        String title = null;
        String artist = null;
        String key = null;

        List<Section> sections = new ArrayList<>();
        String currentSectionLabel = "";
        List<Line> currentSectionLines = new ArrayList<>();

        String[] rawLines = text.split("\\r?\\n");

        for (String rawLine : rawLines) {
            String trimmed = rawLine.trim();

            if (trimmed.isEmpty()) {
                if (!currentSectionLines.isEmpty() && !currentSectionLines.getLast().text().isEmpty()) {
                    currentSectionLines.add(new Line(new ArrayList<>(), ""));
                }
                continue;
            }

            // Check ChordPro directives like {title: Song Name}, {t: ...}, {artist: ...}, {key: C}, {c: Chorus}, {soc}, {eoc}
            Matcher dirMatcher = DIRECTIVE_PATTERN.matcher(trimmed);
            if (dirMatcher.matches()) {
                String directive = dirMatcher.group(1).toLowerCase();
                String value = dirMatcher.group(2) != null ? dirMatcher.group(2).trim() : "";

                switch (directive) {
                    case "title", "t" -> {
                        if (title == null) title = value;
                    }
                    case "artist", "a", "subtitle", "st" -> {
                        if (artist == null && !value.isBlank()) artist = value;
                    }
                    case "key", "k" -> {
                        if (key == null && !value.isBlank()) key = value;
                    }
                    case "comment", "c", "ci" -> {
                        flushSection(sections, currentSectionLabel, currentSectionLines);
                        currentSectionLabel = value;
                    }
                    case "soc", "start_of_chorus" -> {
                        flushSection(sections, currentSectionLabel, currentSectionLines);
                        currentSectionLabel = "Chorus";
                    }
                    case "eoc", "end_of_chorus", "eob", "end_of_bridge" -> {
                        flushSection(sections, currentSectionLabel, currentSectionLines);
                        currentSectionLabel = "";
                    }
                    case "sob", "start_of_bridge" -> {
                        flushSection(sections, currentSectionLabel, currentSectionLines);
                        currentSectionLabel = "Bridge";
                    }
                    case "sov", "start_of_verse" -> {
                        flushSection(sections, currentSectionLabel, currentSectionLines);
                        currentSectionLabel = value.isBlank() ? "Verse" : value;
                    }
                    case "eov", "end_of_verse" -> {
                        flushSection(sections, currentSectionLabel, currentSectionLines);
                        currentSectionLabel = "";
                    }
                }
                continue;
            }

            // Check standard section brackets if not a single chord
            Matcher sectionMatcher = SECTION_BRACKET_PATTERN.matcher(trimmed);
            if (sectionMatcher.matches()) {
                String content = sectionMatcher.group(1).trim();
                if (isSectionHeading(content)) {
                    flushSection(sections, currentSectionLabel, currentSectionLines);
                    currentSectionLabel = content;
                    continue;
                }
            }

            // Parse inline ChordPro chords: [G]Amazing [D]grace
            if (trimmed.contains("[") && trimmed.contains("]")) {
                Line parsedLine = parseInlineChords(trimmed);
                currentSectionLines.add(parsedLine);
            } else {
                currentSectionLines.add(new Line(new ArrayList<>(), trimmed));
            }
        }

        flushSection(sections, currentSectionLabel, currentSectionLines);

        return new ParseResult(new LyricsStructure(sections), title, artist, key);
    }

    private static void flushSection(List<Section> sections, String label, List<Line> lines) {
        while (!lines.isEmpty() && lines.getLast().text().isEmpty() && lines.getLast().chords().isEmpty()) {
            lines.removeLast();
        }
        if (!lines.isEmpty()) {
            sections.add(new Section(label, new ArrayList<>(lines)));
        }
        lines.clear();
    }

    private static boolean isSectionHeading(String content) {
        String lower = content.toLowerCase();
        return lower.startsWith("intro") || lower.startsWith("verse") || lower.startsWith("chorus")
                || lower.startsWith("bridge") || lower.startsWith("outro") || lower.startsWith("solo")
                || lower.startsWith("refr") || lower.startsWith("verso") || lower.startsWith("coro")
                || lower.startsWith("estribillo") || lower.startsWith("puente") || lower.startsWith("parte")
                || lower.startsWith("pre-chorus") || lower.startsWith("instrumental");
    }

    public static Line parseInlineChords(String line) {
        List<ChordPosition> chords = new ArrayList<>();
        StringBuilder cleanLyric = new StringBuilder();

        Matcher matcher = INLINE_CHORD_PATTERN.matcher(line);
        int lastEnd = 0;

        while (matcher.find()) {
            // Append the lyric text preceding this chord
            cleanLyric.append(line, lastEnd, matcher.start());
            String chordName = matcher.group(1);
            int chordPosition = cleanLyric.length();
            chords.add(new ChordPosition(chordName, chordPosition));
            lastEnd = matcher.end();
        }
        // Append any trailing lyrics
        cleanLyric.append(line.substring(lastEnd));

        return new Line(chords, cleanLyric.toString());
    }
}
