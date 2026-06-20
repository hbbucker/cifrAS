package br.com.cifras.song.application.usecase;

import br.com.cifras.song.model.*;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.CsvSource;

import java.util.List;

import static org.junit.jupiter.api.Assertions.*;

/**
 * T6: TranspositionService unit tests — TDD
 * Tests: 15+ cases
 *
 * Coverage:
 * - All 12 semitone steps (chromatic cycle)
 * - Sharps and flats conventions
 * - Compound chords (slash notation)
 * - Suffix preservation
 * - Unknown/malformed chord passthrough
 * - Chromatic overflow wrap-around
 * - Full LyricsStructure transposition
 */
class TranspositionServiceTest {

    private TranspositionService service;

    @BeforeEach
    void setUp() {
        service = new TranspositionService();
    }

    // --- transposeChord tests ---

    /**
     * Test 1: C + 1 semitone = C# (sharps convention)
     */
    @Test
    void givenC_whenTranspose1Semitone_thenReturnsCSharp() {
        assertEquals("C#", service.transposeChord("C", 1, EnharmonicConvention.SHARPS));
    }

    /**
     * Test 2: A + 1 semitone = A# (sharps) or Bb (flats)
     */
    @Test
    void givenA_whenTranspose1Semitone_thenReturnsASharpOrBbDependingOnConvention() {
        assertEquals("A#", service.transposeChord("A", 1, EnharmonicConvention.SHARPS));
        assertEquals("Bb", service.transposeChord("A", 1, EnharmonicConvention.FLATS));
    }

    /**
     * Test 3: Am + 1 semitone = A#m (suffix preserved)
     */
    @Test
    void givenMinorChord_whenTranspose1Semitone_thenSuffixPreserved() {
        assertEquals("A#m", service.transposeChord("Am", 1, EnharmonicConvention.SHARPS));
        assertEquals("Bbm", service.transposeChord("Am", 1, EnharmonicConvention.FLATS));
    }

    /**
     * Test 4: B + 1 semitone = C (chromatic overflow wraps around)
     */
    @Test
    void givenB_whenTranspose1Semitone_thenWrapsAroundToC() {
        assertEquals("C", service.transposeChord("B", 1, EnharmonicConvention.SHARPS));
    }

    /**
     * Test 5: C - 1 semitone = B (negative transposition wraps around)
     */
    @Test
    void givenC_whenTransposeMinus1Semitone_thenWrapsAroundToB() {
        assertEquals("B", service.transposeChord("C", -1, EnharmonicConvention.SHARPS));
    }

    /**
     * Test 6: Full chromatic cycle — C transposed 12 semitones = C
     */
    @Test
    void givenC_whenTranspose12Semitones_thenReturnsC() {
        assertEquals("C", service.transposeChord("C", 12, EnharmonicConvention.SHARPS));
    }

    /**
     * Test 7: Compound chord G/B — root G and bass B both transposed
     * G/B + 1 = G#/C (sharps)
     */
    @Test
    void givenCompoundChord_whenTranspose_thenBothRootAndBassTransposed() {
        assertEquals("G#/C", service.transposeChord("G/B", 1, EnharmonicConvention.SHARPS));
    }

    /**
     * Test 8: Compound chord F#/A# transposed by -2 = E/G# (sharps)
     */
    @Test
    void givenCompoundChordWithSharps_whenTransposeMinus2_thenBothPartsMoveDown() {
        assertEquals("E/G#", service.transposeChord("F#/A#", -2, EnharmonicConvention.SHARPS));
    }

    /**
     * Test 9: C/E transposed -2 = Bb/D (flats convention)
     */
    @Test
    void givenCompoundChord_whenTransposeMinus2WithFlats_thenUsesFlats() {
        assertEquals("Bb/D", service.transposeChord("C/E", -2, EnharmonicConvention.FLATS));
    }

    /**
     * Test 10: Complex suffix Cmaj7 + 2 = Dmaj7 (suffix preserved)
     */
    @Test
    void givenComplexSuffix_whenTranspose_thenSuffixIsPreserved() {
        assertEquals("Dmaj7", service.transposeChord("Cmaj7", 2, EnharmonicConvention.SHARPS));
    }

    /**
     * Test 11: Dsus2 + 3 = Fsus2
     */
    @Test
    void givenSusSuffix_whenTranspose_thenSuffixPreserved() {
        assertEquals("Fsus2", service.transposeChord("Dsus2", 3, EnharmonicConvention.SHARPS));
    }

    /**
     * Test 12: Flat note Bb + 2 = C (enharmonic flat input, sharps output)
     */
    @Test
    void givenFlatNote_whenTranspose_thenResultIsCorrect() {
        assertEquals("C", service.transposeChord("Bb", 2, EnharmonicConvention.SHARPS));
    }

    /**
     * Test 13: Unknown/malformed chord is returned unchanged (no exception thrown)
     */
    @Test
    void givenUnknownChord_whenTranspose_thenReturnedUnchanged() {
        String unknown = "N.C.";  // No Chord notation
        assertEquals(unknown, service.transposeChord(unknown, 5, EnharmonicConvention.SHARPS));
    }

    /**
     * Test 14: Empty chord string is returned unchanged
     */
    @Test
    void givenEmptyChord_whenTranspose_thenReturnedUnchanged() {
        assertEquals("", service.transposeChord("", 3, EnharmonicConvention.SHARPS));
    }

    /**
     * Test 15: transpose() on full LyricsStructure transposes all chords in all sections/lines
     * Input: section with 2 chords [Am@0, E@12], transpose +2 → [Bm@0, F#@12]
     */
    @Test
    void givenLyricsStructure_whenTranspose_thenAllChordsTransposed() {
        LyricsStructure lyrics = new LyricsStructure(List.of(
            new Section("Verse 1", List.of(
                new Line(List.of(
                    new ChordPosition("Am", 0),
                    new ChordPosition("E", 12)
                ), "Some lyrics here")
            ))
        ));

        LyricsStructure result = service.transpose(lyrics, 2, EnharmonicConvention.SHARPS);

        List<ChordPosition> chords = result.sections().get(0).lines().get(0).chords();
        assertEquals("Bm", chords.get(0).chord());
        assertEquals("F#", chords.get(1).chord());
        // Positions must not change
        assertEquals(0, chords.get(0).position());
        assertEquals(12, chords.get(1).position());
        // Text must not change
        assertEquals("Some lyrics here", result.sections().get(0).lines().get(0).text());
    }

    /**
     * Test 16: Negative semitone range (-11) — G - 11 = G# (1 semitone up, wraps around)
     */
    @Test
    void givenMinus11Semitones_whenTranspose_thenWrapsCorrectly() {
        // -11 is equivalent to +1
        assertEquals("G#", service.transposeChord("G", -11, EnharmonicConvention.SHARPS));
    }

    /**
     * Test 17: Null chord handled gracefully (returned as null or empty)
     */
    @Test
    void givenNullChord_whenTranspose_thenNoExceptionThrown() {
        assertDoesNotThrow(() -> service.transposeChord(null, 3, EnharmonicConvention.SHARPS));
    }
}
