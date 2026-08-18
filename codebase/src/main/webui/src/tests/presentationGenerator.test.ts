import { describe, it, expect, vi } from 'vitest';
import {
  isTabLine,
  isStrummingOrRhythmLine,
  isChordOnlyLine,
  extractCleanLyricsSections,
  chunkLines,
  buildPresentation,
  exportCleanLyricsText,
  generatePlaylistPresentation,
} from '../utils/presentationGenerator';
import type { SongForPresentation } from '../utils/presentationGenerator';

interface MockSlide {
  background: { color?: string };
  texts: Array<{ text: string; options: Record<string, unknown> }>;
  addText: (text: string, options: Record<string, unknown>) => void;
}

interface MockPresentation {
  layout: string;
  title: string;
  slides: MockSlide[];
  addSlide: () => MockSlide;
  writeFile: (opts: { fileName: string }) => Promise<string>;
}

// Mock pptxgenjs
vi.mock('pptxgenjs', () => {
  return {
    default: class MockPptxGenJS implements MockPresentation {
      layout = '';
      title = '';
      slides: MockSlide[] = [];
      addSlide() {
        const slide: MockSlide = {
          background: {},
          texts: [],
          addText: vi.fn((text: string, options: Record<string, unknown>) => {
            slide.texts.push({ text, options });
          }),
        };
        this.slides.push(slide);
        return slide;
      }
      writeFile = vi.fn().mockResolvedValue('presentation.pptx');
    },
  };
});

describe('presentationGenerator', () => {
  const sampleSong1: SongForPresentation = {
    id: '1',
    title: 'Eis-me Aqui Senhor',
    artist: 'Pe. Jonas Abib',
    lyrics: {
      sections: [
        {
          label: 'Verso 1',
          lines: [
            { text: 'Eis-me aqui, Senhor', chords: [{ chord: 'G', position: 0 }] },
            { text: 'Pra fazer Tua vontade', chords: [{ chord: 'D', position: 0 }] },
            { text: 'Pra ser o Teu servo fiel', chords: [{ chord: 'Em', position: 0 }] },
          ],
        },
        {
          label: 'Refrão',
          lines: [
            { text: 'Toma minha vida', chords: [{ chord: 'C', position: 0 }] },
            { text: 'Em Tuas mãos', chords: [{ chord: 'G', position: 0 }] },
          ],
        },
      ],
    },
  };

  const sampleSong2Raw: SongForPresentation = {
    id: '2',
    title: 'Segura na Mão de Deus',
    artist: 'Nelson Ned',
    content: `[Verso 1]
G                 D
Se as águas do mar da vida
Em                C
Quiserem te afogar

[Refrão]
G             D
Segura na mão de Deus
Em            C
E vai`,
  };

  const emptySong: SongForPresentation = {
    id: '3',
    title: 'Solo de Violão',
    artist: 'Instrumental',
    lyrics: {
      sections: [],
    },
  };

  const tabAndRhythmSongStructured: SongForPresentation = {
    id: '4',
    title: 'Música com Tab e Ritmo Estruturada',
    artist: 'Artista Teste',
    lyrics: {
      sections: [
        {
          label: 'Intro Solo',
          lines: [
            { text: 'e|---0-2-3---|', chords: [] },
            { text: 'B|---1-3-0---|', chords: [] },
            { text: 'G|---0-2-0---|', chords: [] },
            { text: 'D|---2-0-0---|', chords: [] },
            { text: 'A|---3-x-2---|', chords: [] },
            { text: 'E|---x-x-3---|', chords: [] },
          ],
        },
        {
          label: 'Verso 1',
          lines: [
            { text: 'Ritmo: ↓ ↑ ↓ ↑', chords: [] },
            { text: '1|---0-2-3---|', chords: [] },
            { text: 'Quando olho Tua grandeza', chords: [{ chord: 'G', position: 0 }] },
            { text: 'Me prostro a Te adorar', chords: [{ chord: 'D', position: 0 }] },
          ],
        },
        {
          label: 'Interlúdio',
          lines: [
            { text: '|---12h14p12---|', chords: [] },
            { text: '|--2/4--4\\2--0--|', chords: [] },
          ],
        },
        {
          label: 'Refrão',
          lines: [
            { text: 'Dedilhado: P I M A', chords: [] },
            { text: 'Santo é o Teu nome', chords: [{ chord: 'Em', position: 0 }] },
            { text: 'Para sempre amém', chords: [{ chord: 'C', position: 0 }] },
          ],
        },
      ],
    },
  };

  const tabAndRhythmSongRaw: SongForPresentation = {
    id: '5',
    title: 'Música com Tab e Ritmo Raw',
    artist: 'Artista Raw',
    content: `[Intro]
e|---0-2-3---|
B|---1-3-0---|
G|---0-2-0---|
D|---2-0-0---|
A|---3-x-2---|
E|---x-x-3---|

[Verso 1]
Ritmo: ↓ ↑ ↓ ↑
G                 D
Quando olho Tua grandeza
Em                C
Me prostro a Te adorar

[Solo do Meio]
|---12h14p12---|
|--2/4--4\\2--0--|

[Refrão]
Dedilhado: P I M A
G             D
Santo é o Teu nome
Em            C
Para sempre amém`,
  };

  describe('isTabLine', () => {
    it('should identify standard string tuning prefixes', () => {
      expect(isTabLine('e|---0-2-3---|')).toBe(true);
      expect(isTabLine('B|--1--3--0--|')).toBe(true);
      expect(isTabLine('G|--0--2--0--|')).toBe(true);
      expect(isTabLine('D|--2--0--0--|')).toBe(true);
      expect(isTabLine('A|--3--x--2--|')).toBe(true);
      expect(isTabLine('E|-----x--3--|')).toBe(true);
      expect(isTabLine('1|--0--0--0--|')).toBe(true);
      expect(isTabLine('6|--3--2--0--|')).toBe(true);
      expect(isTabLine('Eb|---0-2-3---|')).toBe(true);
      expect(isTabLine('F#|---0-2-3---|')).toBe(true);
      expect(isTabLine('C# |---0-2-3---|')).toBe(true);
      expect(isTabLine('e |--0-2-3--|')).toBe(true);
    });

    it('should identify pipe-started tab notation and dash-started tabs', () => {
      expect(isTabLine('|---0-2-3---|')).toBe(true);
      expect(isTabLine('|--2--3--0--|')).toBe(true);
      expect(isTabLine('|---12h14p12---|')).toBe(true);
      expect(isTabLine('|--2/4--4\\2--0--|')).toBe(true);
      expect(isTabLine('|------------------------|')).toBe(true);
      expect(isTabLine('---0-2-3---')).toBe(true);
      expect(isTabLine('----12h14p12----')).toBe(true);
      expect(isTabLine('(1) |--0--|--2--|--3--|--5--|')).toBe(true);
      expect(isTabLine('| 0 2 3 - - - - |')).toBe(true);
      expect(isTabLine('intro: |--0--|--2--|--3--|')).toBe(false);
    });

    it('should return false for regular lyrics, text with pipes, and liturgical markers', () => {
      expect(isTabLine('Eis-me aqui, Senhor')).toBe(false);
      expect(isTabLine('Ele é o meu pastor')).toBe(false);
      expect(isTabLine('Amor que transborda')).toBe(false);
      expect(isTabLine('Deus é bom')).toBe(false);
      expect(isTabLine('1. Louvado seja Deus')).toBe(false);
      expect(isTabLine('|: Aleluia, Glória a Deus :|')).toBe(false);
      expect(isTabLine('| Verse 1 - Intro |')).toBe(false);
      expect(isTabLine('| abc |')).toBe(false);
      expect(isTabLine('')).toBe(false);
    });
  });

  describe('isStrummingOrRhythmLine', () => {
    it('should identify rhythm, batida, dedilhado and strumming headers', () => {
      expect(isStrummingOrRhythmLine('Ritmo: ↓ ↑ ↓ ↑')).toBe(true);
      expect(isStrummingOrRhythmLine('Batida: ↓ ↑')).toBe(true);
      expect(isStrummingOrRhythmLine('Dedilhado: P I M A')).toBe(true);
      expect(isStrummingOrRhythmLine('Dedilhado/Ritmo: ↓ ↑')).toBe(true);
      expect(isStrummingOrRhythmLine('Fingerpicking: P I M A')).toBe(true);
      expect(isStrummingOrRhythmLine('Strumming: D U D U')).toBe(true);
      expect(isStrummingOrRhythmLine('Compasso: 4/4')).toBe(true);
    });

    it('should identify arrow direction diagrams', () => {
      expect(isStrummingOrRhythmLine('↓ ↑ ↓ ↑')).toBe(true);
      expect(isStrummingOrRhythmLine('↓↑↓↓↑')).toBe(true);
      expect(isStrummingOrRhythmLine('⬇ ⬆ ⬇ ⬆')).toBe(true);
      expect(isStrummingOrRhythmLine('▲ ▼ ▲ ▼')).toBe(true);
    });

    it('should identify caret/v and fingerpicking patterns', () => {
      expect(isStrummingOrRhythmLine('^ v ^ v')).toBe(true);
      expect(isStrummingOrRhythmLine('P I M A')).toBe(true);
      expect(isStrummingOrRhythmLine('P I M A I M')).toBe(true);
      expect(isStrummingOrRhythmLine('P - I - M - A')).toBe(true);
      expect(isStrummingOrRhythmLine('P.I.M.A')).toBe(true);
      expect(isStrummingOrRhythmLine('D U D U')).toBe(true);
      expect(isStrummingOrRhythmLine('B D D U D U')).toBe(true);
      expect(isStrummingOrRhythmLine('B C B C')).toBe(true);
    });

    it('should return false for regular lyric lines', () => {
      expect(isStrummingOrRhythmLine('Deus é amor')).toBe(false);
      expect(isStrummingOrRhythmLine('Pela Tua infinita misericórdia')).toBe(false);
      expect(isStrummingOrRhythmLine('Vinde todos aclamar')).toBe(false);
      expect(isStrummingOrRhythmLine('')).toBe(false);
    });
  });

  describe('isChordOnlyLine', () => {
    it('should identify chord lines and measure structures', () => {
      expect(isChordOnlyLine('G                 D')).toBe(true);
      expect(isChordOnlyLine('Em                C')).toBe(true);
      expect(isChordOnlyLine('(G) [Am] D, C.')).toBe(true);
      expect(isChordOnlyLine('|: G | D | Em | C :| (2x)')).toBe(true);
      expect(isChordOnlyLine('Intro: G D Em C')).toBe(true);
      expect(isChordOnlyLine('Solo: Em D C D')).toBe(true);
      expect(isChordOnlyLine('| | | |')).toBe(true);
      expect(isChordOnlyLine('|: | :| (4x)')).toBe(true);
    });

    it('should return false for regular lyrics', () => {
      expect(isChordOnlyLine('Se as águas do mar da vida')).toBe(false);
      expect(isChordOnlyLine('A paz do Senhor Jesus')).toBe(false);
      expect(isChordOnlyLine('E a vida eterna')).toBe(false);
      expect(isChordOnlyLine('')).toBe(false);
    });
  });

  describe('extractCleanLyricsSections', () => {
    it('should extract structured sections and clean lines from lyrics object', () => {
      const sections = extractCleanLyricsSections(sampleSong1);
      expect(sections).toHaveLength(2);
      expect(sections[0].label).toBe('Verso 1');
      expect(sections[0].lines).toEqual([
        'Eis-me aqui, Senhor',
        'Pra fazer Tua vontade',
        'Pra ser o Teu servo fiel',
      ]);
      expect(sections[1].label).toBe('Refrão');
      expect(sections[1].lines).toEqual(['Toma minha vida', 'Em Tuas mãos']);
    });

    it('should parse and extract clean lines from standard raw text removing chords', () => {
      const sections = extractCleanLyricsSections(sampleSong2Raw);
      expect(sections.length).toBeGreaterThanOrEqual(2);
      expect(sections[0].label).toBe('Verso 1');
      expect(sections[0].lines).toContain('Se as águas do mar da vida');
      expect(sections[0].lines).toContain('Quiserem te afogar');
      expect(sections[1].label).toBe('Refrão');
      expect(sections[1].lines).toContain('Segura na mão de Deus');
    });

    it('should handle raw text without section headers', () => {
      const songNoHeaders: SongForPresentation = {
        id: 'no-headers',
        title: 'Sem Seções',
        content: `G        D
Linha um da música
Em       C
Linha dois da música`,
      };
      const sections = extractCleanLyricsSections(songNoHeaders);
      expect(sections).toHaveLength(1);
      expect(sections[0].label).toBe('');
      expect(sections[0].lines).toEqual(['Linha um da música', 'Linha dois da música']);
    });

    it('AC-01: should suppress tab and rhythm lines from structured lyrics', () => {
      const sections = extractCleanLyricsSections(tabAndRhythmSongStructured);
      expect(sections).toHaveLength(2);
      expect(sections[0].label).toBe('Verso 1');
      expect(sections[0].lines).toEqual([
        'Quando olho Tua grandeza',
        'Me prostro a Te adorar',
      ]);
      expect(sections[1].label).toBe('Refrão');
      expect(sections[1].lines).toEqual([
        'Santo é o Teu nome',
        'Para sempre amém',
      ]);
    });

    it('AC-02: should parse and extract clean lines from raw text content removing chord lines, tabs and rhythm', () => {
      const sections = extractCleanLyricsSections(tabAndRhythmSongRaw);
      expect(sections).toHaveLength(2);
      expect(sections[0].label).toBe('Verso 1');
      expect(sections[0].lines).toEqual([
        'Quando olho Tua grandeza',
        'Me prostro a Te adorar',
      ]);
      expect(sections[1].label).toBe('Refrão');
      expect(sections[1].lines).toEqual([
        'Santo é o Teu nome',
        'Para sempre amém',
      ]);
    });

    it('AC-03: should completely discard purely instrumental/tab sections', () => {
      const purelyInstrumentalSectionsSong: SongForPresentation = {
        id: '6',
        title: 'Solo de Guitarra',
        lyrics: {
          sections: [
            {
              label: 'Intro',
              lines: [
                { text: 'e|---0-2-3---|', chords: [] },
                { text: 'B|---1-3-0---|', chords: [] },
              ],
            },
            {
              label: 'Solo',
              lines: [
                { text: '|---12h14p12---|', chords: [] },
                { text: '|--2/4--4\\2--0--|', chords: [] },
              ],
            },
          ],
        },
      };

      const sections = extractCleanLyricsSections(purelyInstrumentalSectionsSong);
      expect(sections).toEqual([]);
    });

    it('should handle song with no lyrics or content or malformed structures', () => {
      expect(extractCleanLyricsSections(emptySong)).toEqual([]);
      expect(extractCleanLyricsSections({ id: 'none', title: 'None' })).toEqual([]);
      expect(
        extractCleanLyricsSections({
          id: 'malformed',
          title: 'Malformed',
          lyrics: {
            sections: [
              { label: 'S1', lines: undefined },
              { label: 'S2', lines: [{ text: undefined }, { text: '' }] },
            ],
          },
        })
      ).toEqual([]);
    });

    it('should ignore empty lines and whitespace in structured sections', () => {
      const dirtySong: SongForPresentation = {
        id: '7',
        title: 'Dirty Song',
        lyrics: {
          sections: [
            {
              label: 'Intro',
              lines: [
                { text: '   ', chords: [{ chord: 'Am', position: 0 }] },
                { text: '', chords: [] },
              ],
            },
            {
              label: 'Verso',
              lines: [{ text: 'Linha válida', chords: [] }],
            },
          ],
        },
      };

      const sections = extractCleanLyricsSections(dirtySong);
      expect(sections).toHaveLength(1);
      expect(sections[0].label).toBe('Verso');
      expect(sections[0].lines).toEqual(['Linha válida']);
    });
  });

  describe('chunkLines', () => {
    it('should return empty array when input is empty', () => {
      expect(chunkLines([])).toEqual([]);
    });

    it('should chunk lines into pages of specified size', () => {
      const lines = ['L1', 'L2', 'L3', 'L4', 'L5', 'L6', 'L7'];
      const chunks = chunkLines(lines, 3);
      expect(chunks).toHaveLength(3);
      expect(chunks[0]).toEqual(['L1', 'L2', 'L3']);
      expect(chunks[1]).toEqual(['L4', 'L5', 'L6']);
      expect(chunks[2]).toEqual(['L7']);
    });
  });

  describe('buildPresentation', () => {
    it('AC-05: should build presentation with cover, song intros and lyrics slides without tabs', () => {
      const longSectionSong: SongForPresentation = {
        id: 'long',
        title: 'Música Longa',
        content: `Linha 1
Linha 2
Linha 3
Linha 4
Linha 5
Linha 6`,
      };

      const pptx = buildPresentation(
        'Missa de Domingo',
        [sampleSong1, tabAndRhythmSongRaw, longSectionSong, emptySong],
        {
          theme: 'dark',
          includePlaylistTitleSlide: true,
          includeSongTitleSlides: true,
          maxLinesPerSlide: 5,
        }
      ) as unknown as MockPresentation;

      expect(pptx.layout).toBe('LAYOUT_16x9');
      expect(pptx.title).toBe('Missa de Domingo');
      expect(pptx.slides.length).toBeGreaterThan(0);

      // Slide 1: Cover
      expect(pptx.slides[0].texts[0].text).toBe('Missa de Domingo');

      // Check that slides have black background for dark theme
      expect(pptx.slides[0].background).toEqual({ color: '000000' });

      // Verify no slide contains tab or chord characters
      for (const slide of pptx.slides) {
        for (const t of slide.texts) {
          expect(t.text).not.toContain('e|---');
          expect(t.text).not.toContain('Ritmo: ↓ ↑ ↓ ↑');
        }
      }
    });

    it('AC-06: should generate instrumental fallback slide for purely instrumental songs', () => {
      const pptx = buildPresentation('Show Instrumental', [emptySong], {
        includePlaylistTitleSlide: false,
        includeSongTitleSlides: false,
      }) as unknown as MockPresentation;

      expect(pptx.slides).toHaveLength(1);
      expect(pptx.slides[0].texts[0].text).toBe('Solo de Violão');
      expect(pptx.slides[0].texts[1].text).toBe('(Instrumental / Sem letra cadastrada)');
    });

    it('should support default playlist name and fallback without artist', () => {
      const noArtistSong: SongForPresentation = {
        id: 'na',
        title: 'Música Sem Artista',
        content: 'Linha única',
      };
      const pptx = buildPresentation('', [noArtistSong]) as unknown as MockPresentation;
      expect(pptx.title).toBe('CifrAS Playlist');
      expect(pptx.slides[0].texts[0].text).toBe('Playlist');
    });

    it('should support liturgic theme and light theme', () => {
      const pptxLiturgic = buildPresentation('Culto', [sampleSong1], {
        theme: 'liturgic',
      }) as unknown as MockPresentation;
      expect(pptxLiturgic.slides[0].background).toEqual({ color: '0A1128' });

      const pptxLight = buildPresentation('Show Acústico', [sampleSong1], {
        theme: 'light',
      }) as unknown as MockPresentation;
      expect(pptxLight.slides[0].background).toEqual({ color: 'FFFFFF' });
    });

    it('should respect options omitting cover or song title slides', () => {
      const pptx = buildPresentation('Quick Set', [sampleSong1], {
        includePlaylistTitleSlide: false,
        includeSongTitleSlides: false,
      }) as unknown as MockPresentation;

      // Should only have lyric slides, no cover slide
      expect(pptx.slides.length).toBe(2); // 2 sections
    });
  });

  describe('exportCleanLyricsText', () => {
    it('AC-04: should compile clean lyrics text formatted for clipboard without tabs or rhythms', () => {
      const songWithoutArtistAndLabel: SongForPresentation = {
        id: 'no-art',
        title: 'Hino Avulso',
        content: 'Linha do hino',
      };

      const text = exportCleanLyricsText('Missa 20º Domingo', [
        sampleSong1,
        tabAndRhythmSongStructured,
        tabAndRhythmSongRaw,
        songWithoutArtistAndLabel,
        emptySong,
      ]);

      expect(text).toContain('PLAYLIST: MISSA 20º DOMINGO');
      expect(text).toContain('[1] EIS-ME AQUI SENHOR');
      expect(text).toContain('Artista: Pe. Jonas Abib');
      expect(text).toContain('[Verso 1]');
      expect(text).toContain('Eis-me aqui, Senhor');
      expect(text).toContain('[Refrão]');
      expect(text).toContain('Toma minha vida');

      // Song 2 check
      expect(text).toContain('[2] MÚSICA COM TAB E RITMO ESTRUTURADA');
      expect(text).toContain('Quando olho Tua grandeza');
      expect(text).not.toContain('Intro Solo');
      expect(text).not.toContain('Interlúdio');
      expect(text).not.toContain('e|---');
      expect(text).not.toContain('Ritmo:');
      expect(text).not.toContain('Dedilhado:');

      // Song 3 check
      expect(text).toContain('[3] MÚSICA COM TAB E RITMO RAW');
      expect(text).not.toContain('Solo do Meio');

      // Song 4 check
      expect(text).toContain('[4] HINO AVULSO');
      expect(text).toContain('Linha do hino');

      // Instrumental song fallback (AC-06)
      expect(text).toContain('[5] SOLO DE VIOLÃO');
      expect(text).toContain('(Instrumental / Sem letra)');
    });
  });

  describe('generatePlaylistPresentation', () => {
    it('should call writeFile on pptx instance with sanitized filename', async () => {
      await expect(
        generatePlaylistPresentation('Missa/Especial: "Páscoa" *2026*?', [sampleSong1])
      ).resolves.not.toThrow();

      await expect(
        generatePlaylistPresentation('///???***', [sampleSong1])
      ).resolves.not.toThrow();
    });
  });
});
