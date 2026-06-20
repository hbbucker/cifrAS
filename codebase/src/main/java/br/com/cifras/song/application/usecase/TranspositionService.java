package br.com.cifras.song.application.usecase;

import br.com.cifras.song.model.*;
import jakarta.enterprise.context.ApplicationScoped;

import java.util.Arrays;
import java.util.List;
import java.util.Set;

/**
 * TranspositionService — core engine for transposing chord sheets.
 *
 * Algorithm:
 * 1. Parse each chord into (root, suffix) using MusicalKey.parse()
 * 2. Find the root's index in the chromatic scale
 * 3. Apply: newIndex = (index + semitones + 12 * n) % 12 (handles negative semitones)
 * 4. Select the new root from the appropriate scale (SHARPS or FLATS)
 * 5. Reconstruct: newRoot + suffix
 * 6. For compound chords (G/B): transpose root and bass separately
 *
 * Unknown chords (not in any scale) are returned unchanged — no exception.
 */
@ApplicationScoped
public class TranspositionService {

    // Valid starting note letters
    private static final Set<Character> NOTE_LETTERS = Set.of('A', 'B', 'C', 'D', 'E', 'F', 'G');

    /**
     * Transposes an entire LyricsStructure by the given number of semitones.
     *
     * @param lyrics     the original lyrics structure (immutable)
     * @param semitones  number of semitones to shift (negative = down, positive = up)
     * @param convention SHARPS or FLATS output convention
     * @return new LyricsStructure with all chords transposed; texts and positions unchanged
     */
    public LyricsStructure transpose(LyricsStructure lyrics, int semitones, EnharmonicConvention convention) {
        if (lyrics == null) return null;

        List<Section> transposedSections = lyrics.sections().stream()
            .map(section -> transposedSection(section, semitones, convention))
            .toList();

        return lyrics.withSections(transposedSections);
    }

    private Section transposedSection(Section section, int semitones, EnharmonicConvention convention) {
        List<Line> transposedLines = section.lines().stream()
            .map(line -> transposedLine(line, semitones, convention))
            .toList();
        return section.withLines(transposedLines);
    }

    private Line transposedLine(Line line, int semitones, EnharmonicConvention convention) {
        List<ChordPosition> transposedChords = line.chords().stream()
            .map(cp -> cp.withChord(transposeChord(cp.chord(), semitones, convention)))
            .toList();
        return line.withChords(transposedChords);
    }

    /**
     * Transposes a single chord string.
     *
     * @param chord      chord string (e.g. "Am", "F#m7", "G/B")
     * @param semitones  semitones to shift
     * @param convention output enharmonic convention
     * @return transposed chord string, or original if unrecognized
     */
    public String transposeChord(String chord, int semitones, EnharmonicConvention convention) {
        if (chord == null || chord.isBlank()) return chord == null ? null : chord;

        // Handle compound chord (slash notation)
        if (chord.contains("/")) {
            int slashIdx = chord.indexOf('/');
            String numerator = chord.substring(0, slashIdx);
            String denominator = chord.substring(slashIdx + 1);
            return transposeSimpleChord(numerator, semitones, convention)
                + "/"
                + transposeSimpleChord(denominator, semitones, convention);
        }

        return transposeSimpleChord(chord, semitones, convention);
    }

    /**
     * Transposes a simple (non-compound) chord.
     */
    private String transposeSimpleChord(String chord, int semitones, EnharmonicConvention convention) {
        if (chord == null || chord.isEmpty()) return chord;

        // Must start with a valid note letter
        if (!NOTE_LETTERS.contains(chord.charAt(0))) {
            return chord; // Unknown — return unchanged
        }

        MusicalKey key = MusicalKey.parse(chord);
        String root = key.root();
        String suffix = key.suffix();

        // Find root index in chromatic scales
        int index = findIndex(root);
        if (index < 0) {
            return chord; // Unknown root — return unchanged
        }

        // Apply transposition with proper modulo for negative semitones
        int newIndex = ((index + semitones) % 12 + 12) % 12;

        // Select new root from the appropriate scale
        String[] scale = convention == EnharmonicConvention.FLATS ? MusicalKey.FLATS : MusicalKey.SHARPS;
        String newRoot = scale[newIndex];

        return newRoot + suffix;
    }

    /**
     * Finds the chromatic index of a root note, checking both SHARPS and FLATS scales.
     * Returns -1 if the root is not found in either scale.
     */
    private int findIndex(String root) {
        for (int i = 0; i < MusicalKey.SHARPS.length; i++) {
            if (MusicalKey.SHARPS[i].equals(root)) return i;
        }
        for (int i = 0; i < MusicalKey.FLATS.length; i++) {
            if (MusicalKey.FLATS[i].equals(root)) return i;
        }
        return -1;
    }
}
