# Fix Lyrics Parser Bug

## Description
The user reported that the last stanza of the song "Bem Aventurada" is losing words. Specifically, the line "A Mãe amorosa que aos pés da Cruz Cristo nos deu!" is being parsed incorrectly as "A                            Cruz Cristo". This is because the line starts with "A ", which matched the naive regex for chord lines, and then subsequent words starting with valid musical notes (like "Cruz" and "Cristo") were incorrectly extracted as chords.

## Implementation Steps
1. Refactor `isChordLine` heuristic to be token-based. A line should only be considered a chord line if the majority (> 60%) of its space-separated tokens are valid chords.
2. Develop a stricter and more accurate `CHORD_REGEX` that supports complex chords like `C7(4/9)`, `F#m11`, and slash chords, while strictly rejecting standard text.
3. Update `parseContentToLyrics` to extract chords token by token using the new validation logic, ensuring no lyrics are falsely identified as chords.

## Verification
- Run existing `ChordSheet.test.tsx` tests to ensure no regressions.
- Verify the specific failing text ("A Mãe amorosa que aos pés da Cruz Cristo nos deu!") parses successfully as lyrics without dropping any characters.
