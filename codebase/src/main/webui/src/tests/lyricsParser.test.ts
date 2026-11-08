import { describe, it, expect } from 'vitest';
import { parseContentToLyrics, stringifyLyrics, isChordToken } from '../utils/lyricsParser';

describe('lyricsParser', () => {
  it('identifies tokens with diminished symbols, extensions and parentheses as valid chords', () => {
    expect(isChordToken('Cº')).toBe(true);
    expect(isChordToken('C°')).toBe(true);
    expect(isChordToken('Cø')).toBe(true);
    expect(isChordToken('C9')).toBe(true);
    expect(isChordToken('C11')).toBe(true);
    expect(isChordToken('C13')).toBe(true);
    expect(isChordToken('(C')).toBe(true);
    expect(isChordToken('G)')).toBe(true);
    expect(isChordToken('(C)')).toBe(true);
    expect(isChordToken('(C9)')).toBe(true);
    expect(isChordToken('(2x)')).toBe(true);
  });

  it('preserves diminished chords, extensions and parenthesized sequences during parse and stringify', () => {
    const rawContent = `[Intro]
(C F G) (2x)

[Verso 1]
Cº       C9
Minha canção favorita
C11      Cø
Toca no rádio`;

    const parsed = parseContentToLyrics(rawContent);
    expect(parsed.sections).toHaveLength(2);
    
    // Check section 0 lines
    const introSection = parsed.sections[0];
    expect(introSection.label).toBe('Intro');
    expect(introSection.lines[0].chords.map(c => c.chord)).toEqual(['(C', 'F', 'G)', '(2x)']);

    // Check section 1 lines
    const verseSection = parsed.sections[1];
    expect(verseSection.lines[0].chords.map(c => c.chord)).toEqual(['Cº', 'C9']);
    expect(verseSection.lines[0].text).toBe('Minha canção favorita');
    expect(verseSection.lines[1].chords.map(c => c.chord)).toEqual(['C11', 'Cø']);
    expect(verseSection.lines[1].text).toBe('Toca no rádio');

    const stringified = stringifyLyrics(parsed);
    expect(stringified).toContain('(C F G) (2x)');
    expect(stringified).toContain('Cº');
    expect(stringified).toContain('C9');
    expect(stringified).toContain('C11');
    expect(stringified).toContain('Cø');
  });
});
