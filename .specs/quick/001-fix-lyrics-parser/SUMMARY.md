# Fix Lyrics Parser Bug Summary

## What Was Done
The naive heuristic for identifying chord lines in `lyricsParser.ts` has been replaced with a robust token-based parser.

**Key Changes:**
1. **Accurate Chord Validation**: Introduced `CHORD_REGEX` to accurately identify complex musical chords (including modifiers, parentheses, and bass notes) without matching regular words.
2. **Robust Line Identification**: A line is now only treated as a chord line if over 60% of its space-separated tokens are valid chords. This prevents standard lyrics that begin with a chord letter (e.g., "A Mãe amorosa...") from being misidentified.
3. **Precise Chord Extraction**: Replaced the global regex chord extraction with a token-iteration approach that perfectly extracts chord strings and their original positions, ensuring parentheses and specific characters like `(4/9)` are fully captured.

## Verification Result
- The specific failure case with the phrase `"A Mãe amorosa que aos pés da Cruz Cristo nos deu!"` under `"    Gm            C7(4/9)                        F"` now parses correctly.
- The unit tests `ChordSheet.test.tsx` pass without errors.
