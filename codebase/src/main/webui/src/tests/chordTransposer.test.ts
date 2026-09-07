import { describe, it, expect } from 'vitest';
import { transposeChord, transposeContent, isChordLineHelper } from '../utils/chordTransposer';

describe('chordTransposer', () => {
  describe('transposeChord with diminished, extensions and parentheses', () => {
    it('transposes diminished chords (º, °, ø, dim)', () => {
      expect(transposeChord('Cº', 2)).toBe('Dº');
      expect(transposeChord('C°', 2)).toBe('D°');
      expect(transposeChord('Cø', 2)).toBe('Dø');
      expect(transposeChord('Cdim', 2)).toBe('Ddim');
      expect(transposeChord('Cdim7', 2)).toBe('Ddim7');
      expect(transposeChord('C#º', 1)).toBe('Dº');
      expect(transposeChord('Bbº', 2)).toBe('Cº');
    });

    it('transposes extended chords (9, 11, 13, 6/9, 7/9, 7(9))', () => {
      expect(transposeChord('C9', 2)).toBe('D9');
      expect(transposeChord('C11', 2)).toBe('D11');
      expect(transposeChord('C13', 2)).toBe('D13');
      expect(transposeChord('C6/9', 2)).toBe('D6/9');
      expect(transposeChord('C7/9', 2)).toBe('D7/9');
      expect(transposeChord('C7/13', 2)).toBe('D7/13');
      expect(transposeChord('C7(9)', 2)).toBe('D7(9)');
      expect(transposeChord('C7(b9)', 2)).toBe('D7(b9)');
      expect(transposeChord('C7(#9)', 2)).toBe('D7(#9)');
      expect(transposeChord('C7(9/11)', 2)).toBe('D7(9/11)');
      expect(transposeChord('C7M(9)', 2)).toBe('D7M(9)');
      expect(transposeChord('C#m7(b5)', 2)).toBe('D#m7(b5)');
    });

    it('transposes chords with surrounding parentheses and punctuation', () => {
      expect(transposeChord('(C', 2)).toBe('(D');
      expect(transposeChord('G)', 2)).toBe('A)');
      expect(transposeChord('(C)', 2)).toBe('(D)');
      expect(transposeChord('(C9)', 2)).toBe('(D9)');
      expect(transposeChord('(Cº)', 2)).toBe('(Dº)');
      expect(transposeChord('(C/E)', 2)).toBe('(D/F#)');
      expect(transposeChord('[C]', 2)).toBe('[D]');
    });

    it('transposes compound chords with slash bass', () => {
      expect(transposeChord('G/B', 1)).toBe('G#/C');
      expect(transposeChord('Cº/Eb', 2)).toBe('Dº/F');
    });
  });

  describe('isChordLineHelper', () => {
    it('identifies parenthesized sequences as chord lines', () => {
      expect(isChordLineHelper('(C F G)')).toBe(true);
      expect(isChordLineHelper('(C  F  G) (2x)')).toBe(true);
      expect(isChordLineHelper('(Am7 D7 G7M C7M)')).toBe(true);
      expect(isChordLineHelper('(C9 F9 G11)')).toBe(true);
      expect(isChordLineHelper('(Cº Dº Eº)')).toBe(true);
    });

    it('identifies diminished and extended chord lines', () => {
      expect(isChordLineHelper('Cº  C9  C11  Cø')).toBe(true);
      expect(isChordLineHelper('C6/9  F#m7(b5)  B7(b9)  Em7')).toBe(true);
      expect(isChordLineHelper('C7M(9)  Am7(11)  Dm7(9)  G7(13)')).toBe(true);
    });

    it('rejects lyric lines', () => {
      expect(isChordLineHelper('Hoje eu quero cantar uma canção')).toBe(false);
      expect(isChordLineHelper('Com você meu amigo')).toBe(false);
    });
  });

  describe('transposeContent', () => {
    it('correctly transposes a multi-line chord sheet with parenthesized sequences', () => {
      const input = `[Intro]
(C F G) (2x)

[Verso]
Cº          C9
Caminhando pela rua
(Am7  D7  G7M)
Sem olhar para trás`;

      const transposed = transposeContent(input, 2);
      expect(transposed).toContain('(D G A) (2x)');
      expect(transposed).toContain('Dº          D9');
      expect(transposed).toContain('(Bm7  E7  A7M)');
      expect(transposed).toContain('Caminhando pela rua');
      expect(transposed).toContain('Sem olhar para trás');
    });
  });
});
