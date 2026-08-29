package br.com.cifras.song.application.parser;

import br.com.cifras.song.model.ChordPosition;
import br.com.cifras.song.model.Line;
import br.com.cifras.song.model.LyricsStructure;
import br.com.cifras.song.model.Section;

import java.util.ArrayList;
import java.util.List;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

public class CifraClubParser {

    private static final Pattern SECTION_PATTERN = Pattern.compile("^\\s*\\[(.*)\\]\\s*$");
    // A strict regex to identify if a token is a valid chord
    // Base: A-G, optionally # or b
    // Modifier: m, M, dim, aug, sus, add
    // Intervals: numbers or parentheses with numbers/accidentals
    // Bass: / followed by A-G, optionally # or b
    private static final Pattern CHORD_TOKEN_PATTERN = Pattern.compile(
            "^[A-G][#b]?(m|M|dim|aug|sus|add|maj|[0-9]|\\+|\\-)*(?:\\([^)]+\\))?(?:/[A-G][#b]?)?$"
    );

    public static LyricsStructure parse(String text) {
        if (text == null || text.isBlank()) {
            return LyricsStructure.empty();
        }

        String[] rawLines = text.split("\\r?\\n");
        List<Section> sections = new ArrayList<>();
        
        String currentSectionLabel = "";
        List<Line> currentSectionLines = new ArrayList<>();
        List<ChordPosition> pendingChords = new ArrayList<>();

        for (String line : rawLines) {
            String trimmed = line.trim();

            if (trimmed.isEmpty()) {
                // If we have pending chords, flush them to an empty line
                if (!pendingChords.isEmpty()) {
                    currentSectionLines.add(new Line(new ArrayList<>(pendingChords), ""));
                    pendingChords.clear();
                }
                // Skip consecutive empty lines or add as empty text if needed.
                // We'll add an empty line to preserve some spacing, but skip if previous was empty.
                if (!currentSectionLines.isEmpty() && !currentSectionLines.getLast().text().isEmpty()) {
                    currentSectionLines.add(new Line(new ArrayList<>(), ""));
                }
                continue;
            }

            Matcher sectionMatcher = SECTION_PATTERN.matcher(trimmed);
            if (sectionMatcher.matches()) {
                // Flush previous section
                flushSection(sections, currentSectionLabel, currentSectionLines, pendingChords);
                currentSectionLabel = sectionMatcher.group(1).trim();
                continue;
            }

            if (isChordLine(trimmed)) {
                // If we already have pending chords, it means the previous line was also chords without lyrics
                if (!pendingChords.isEmpty()) {
                    currentSectionLines.add(new Line(new ArrayList<>(pendingChords), ""));
                    pendingChords.clear();
                }
                pendingChords = parseChords(line);
            } else {
                // Lyric line
                currentSectionLines.add(new Line(new ArrayList<>(pendingChords), line));
                pendingChords.clear();
            }
        }

        // Flush last section
        flushSection(sections, currentSectionLabel, currentSectionLines, pendingChords);

        return new LyricsStructure(sections);
    }

    private static void flushSection(List<Section> sections, String label, List<Line> lines, List<ChordPosition> pendingChords) {
        if (!pendingChords.isEmpty()) {
            lines.add(new Line(new ArrayList<>(pendingChords), ""));
            pendingChords.clear();
        }
        if (!lines.isEmpty() || !label.isEmpty()) {
            sections.add(new Section(label, new ArrayList<>(lines)));
        }
        lines.clear();
    }

    private static boolean isChordLine(String trimmedLine) {
        String[] tokens = trimmedLine.split("\\s+");
        if (tokens.length == 0) return false;
        
        for (String token : tokens) {
            if (!CHORD_TOKEN_PATTERN.matcher(token).matches()) {
                return false;
            }
        }
        return true;
    }

    private static List<ChordPosition> parseChords(String line) {
        List<ChordPosition> chords = new ArrayList<>();
        Matcher matcher = Pattern.compile("\\S+").matcher(line);
        while (matcher.find()) {
            chords.add(new ChordPosition(matcher.group(), matcher.start()));
        }
        return chords;
    }
}
