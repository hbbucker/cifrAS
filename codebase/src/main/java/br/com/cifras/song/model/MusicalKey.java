package br.com.cifras.song.model;

/**
 * Value object representing a parsed musical chord.
 *
 * Examples:
 *   "Am"     → root="A",  suffix="m"
 *   "C#maj7" → root="C#", suffix="maj7"
 *   "Bb"     → root="Bb", suffix=""
 *   "G/B"    → root="G",  suffix="" (bass note 'B' handled separately by TranspositionService)
 */
public record MusicalKey(String root, String suffix) {

    /**
     * Chromatic scale — sharps convention.
     */
    public static final String[] SHARPS = {"C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"};

    /**
     * Chromatic scale — flats convention.
     */
    public static final String[] FLATS = {"C", "Db", "D", "Eb", "E", "F", "Gb", "G", "Ab", "A", "Bb", "B"};

    /**
     * Parses a chord string into root + suffix.
     * For compound chords (e.g. "G/B"), only the numerator part is parsed here;
     * bass extraction is the responsibility of TranspositionService.
     *
     * @param chord the chord string (e.g. "Am", "F#m7", "G/B", "Bb")
     * @return MusicalKey with separated root and suffix
     */
    public static MusicalKey parse(String chord) {
        if (chord == null || chord.isBlank()) {
            return new MusicalKey("", "");
        }

        // For compound chords, parse only the part before the slash
        String toParse = chord.contains("/") ? chord.substring(0, chord.indexOf('/')) : chord;

        // Root is the first character (note letter)
        int rootEnd = 1;

        // Check if second character is '#' (sharp) or 'b' (flat, but not part of a suffix like 'dim')
        if (toParse.length() > 1) {
            char second = toParse.charAt(1);
            if (second == '#') {
                rootEnd = 2;
            } else if (second == 'b' && isFlat(toParse, 1)) {
                rootEnd = 2;
            }
        }

        String root = toParse.substring(0, rootEnd);
        String suffix = toParse.substring(rootEnd);

        return new MusicalKey(root, suffix);
    }

    /**
     * Determines if the 'b' at position idx is a flat modifier (not part of a suffix like "dim", "add").
     * A 'b' is a flat if it's followed by end-of-string, a digit, or another suffix character
     * that isn't itself a note letter (i.e., not A-G).
     */
    private static boolean isFlat(String chord, int idx) {
        if (idx >= chord.length()) return false;
        if (idx == chord.length() - 1) return true; // "Bb" alone

        // If the character after 'b' is a digit or lowercase letter (suffix), it's a flat
        char afterB = chord.charAt(idx + 1);
        // Note letters are uppercase A-G; if next char is uppercase and is a note letter,
        // the 'b' might be part of the suffix (e.g. "Badd9" → B + add9, not Bb)
        // For our domain, only 'A'-'G' uppercase start a note; 'b' after uppercase note is flat.
        return !Character.isUpperCase(afterB) || afterB < 'A' || afterB > 'G';
    }

    /**
     * Returns the full chord representation: root + suffix.
     */
    @Override
    public String toString() {
        return root + suffix;
    }
}
