# Tablature Transposition Specification

## Goal
Implement a tablature transposition feature so that when a user transposes the key of a song, any embedded tablatures also have their fret numbers shifted accordingly.

## Requirements
- **TAB-REQ-01**: Detect lines that represent tablature strings (e.g., `e|---3---5---|`, `B |---...`, `G|`).
- **TAB-REQ-02**: Identify integers within these tablature lines that represent fret numbers.
- **TAB-REQ-03**: Shift these fret numbers by the current transposition steps. E.g., transposing +2 changes fret `3` to `5`.
- **TAB-REQ-04**: Maintain visual alignment. If a fret number changes length (e.g., from `9` to `10` or `10` to `9`), the script must attempt to add or remove adjacent dashes (`-`) to preserve the original line length so the vertical alignment of the tab is not ruined.
- **TAB-REQ-05**: Handle negative frets gracefully. If a transposition results in a fret < 0, leave it as `<0` or just let it be negative (e.g. `-1`) as an indicator to the player that it went off the fretboard, while doing our best to preserve alignment.
- **TAB-REQ-06**: Only transpose the numeric values. Symbols like `h`, `p`, `/`, `\`, `b`, `r` should be preserved exactly.

## Approach
This fits perfectly into the existing `chordTransposer.ts`. We will add a new function `isTabLineHelper` (similar to the one in `ChordSheet.tsx`) and when looping through lines in `transposeContent`, if it is a tablature line, we process it differently than a chord line.

Because the scope is Medium (clear feature, < 10 tasks, highly contained in 1 file), we skip formal `design.md` and `tasks.md` and proceed directly to Implementation.
