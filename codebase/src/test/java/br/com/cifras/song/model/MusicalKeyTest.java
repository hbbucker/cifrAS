package br.com.cifras.song.model;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.CsvSource;

import static org.junit.jupiter.api.Assertions.*;

/**
 * T5: Domain model unit tests — MusicalKey parsing and LyricsStructure
 * Tests: 6
 * 1. Parse simple root note (C, D, E...)
 * 2. Parse sharp note (C#, F#, A#...)
 * 3. Parse flat note (Db, Bb, Eb...)
 * 4. Parse chord with suffix (Am, Cmaj7, Dsus2...)
 * 5. Parse compound chord with slash (G/B, C/E, F#/A#...)
 * 6. toString() reconstructs original chord representation
 */
class MusicalKeyTest {

    /**
     * Test 1: Simple root notes are parsed correctly.
     */
    @ParameterizedTest
    @CsvSource({"C,C,''", "D,D,''", "E,E,''", "G,G,''", "A,A,''"})
    void givenSimpleNote_whenParse_thenRootCorrectAndEmptySuffix(String input, String expectedRoot, String expectedSuffix) {
        MusicalKey key = MusicalKey.parse(input);
        assertEquals(expectedRoot, key.root());
        assertEquals(expectedSuffix, key.suffix());
    }

    /**
     * Test 2: Sharp notes are parsed with '#' in root.
     */
    @ParameterizedTest
    @CsvSource({"C#,C#,''", "F#,F#,''", "A#,A#,''"})
    void givenSharpNote_whenParse_thenRootIncludesSharp(String input, String expectedRoot, String expectedSuffix) {
        MusicalKey key = MusicalKey.parse(input);
        assertEquals(expectedRoot, key.root());
        assertEquals(expectedSuffix, key.suffix());
    }

    /**
     * Test 3: Flat notes are parsed with 'b' in root.
     */
    @ParameterizedTest
    @CsvSource({"Db,Db,''", "Bb,Bb,''", "Eb,Eb,''"})
    void givenFlatNote_whenParse_thenRootIncludesFlat(String input, String expectedRoot, String expectedSuffix) {
        MusicalKey key = MusicalKey.parse(input);
        assertEquals(expectedRoot, key.root());
        assertEquals(expectedSuffix, key.suffix());
    }

    /**
     * Test 4: Chords with suffixes preserve the suffix separately from root.
     */
    @ParameterizedTest
    @CsvSource({"Am,A,m", "Cmaj7,C,maj7", "Dsus2,D,sus2", "F#m7,F#,m7", "Bbdim,Bb,dim"})
    void givenChordWithSuffix_whenParse_thenRootAndSuffixAreSeparated(String input, String expectedRoot, String expectedSuffix) {
        MusicalKey key = MusicalKey.parse(input);
        assertEquals(expectedRoot, key.root());
        assertEquals(expectedSuffix, key.suffix());
    }

    /**
     * Test 5: Compound chords (slash chords) are parsed returning the numerator part only.
     * Bass note is handled separately by TranspositionService.
     */
    @Test
    void givenCompoundChord_whenParse_thenReturnsNumeratorOnly() {
        // G/B → root=G, suffix='', bass is B (handled by TranspositionService)
        MusicalKey key = MusicalKey.parse("G/B");
        assertEquals("G", key.root());
        assertEquals("", key.suffix());
    }

    /**
     * Test 6: toString() reconstructs the chord properly (root + suffix).
     */
    @Test
    void givenMusicalKey_whenToString_thenReturnsCombinedRootAndSuffix() {
        MusicalKey key = new MusicalKey("F#", "m7");
        assertEquals("F#m7", key.toString());

        MusicalKey simple = new MusicalKey("C", "");
        assertEquals("C", simple.toString());
    }

    /**
     * Test 7: Chords with diminished symbols, 9/11 extensions, and parentheses.
     */
    @ParameterizedTest
    @CsvSource({
        "Cº,C,º",
        "C°,C,°",
        "Cø,C,ø",
        "C9,C,9",
        "C11,C,11",
        "C13,C,13",
        "C7(9),C,7(9)",
        "C7M(9),C,7M(9)",
        "C#m7(b5),C#,m7(b5)",
        "(C,C,''",
        "(C9,C,9",
        "(Cº,C,º"
    })
    void givenSpecialAndParenthesizedChords_whenParse_thenParsedCorrectly(String input, String expectedRoot, String expectedSuffix) {
        MusicalKey key = MusicalKey.parse(input);
        assertEquals(expectedRoot, key.root());
        assertEquals(expectedSuffix, key.suffix());
    }
}
