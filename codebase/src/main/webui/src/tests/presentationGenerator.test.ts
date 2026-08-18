import { describe, it, expect, vi } from 'vitest';
import {
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

    it('should parse and extract clean lines from raw text content removing chord lines', () => {
      const sections = extractCleanLyricsSections(sampleSong2Raw);
      expect(sections.length).toBeGreaterThanOrEqual(2);
      expect(sections[0].label).toBe('Verso 1');
      expect(sections[0].lines).toContain('Se as águas do mar da vida');
      expect(sections[0].lines).toContain('Quiserem te afogar');
      expect(sections[1].label).toBe('Refrão');
      expect(sections[1].lines).toContain('Segura na mão de Deus');
    });

    it('should handle song with no lyrics or content', () => {
      const sections = extractCleanLyricsSections(emptySong);
      expect(sections).toEqual([]);
    });

    it('should ignore empty lines and whitespace in structured sections', () => {
      const dirtySong: SongForPresentation = {
        id: '4',
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
    it('should build presentation with cover, song intros and lyrics slides', () => {
      const pptx = buildPresentation(
        'Missa de Domingo',
        [sampleSong1, emptySong],
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
    it('should compile clean lyrics text formatted for clipboard', () => {
      const text = exportCleanLyricsText('Missa 20º Domingo', [sampleSong1, emptySong]);

      expect(text).toContain('PLAYLIST: MISSA 20º DOMINGO');
      expect(text).toContain('[1] EIS-ME AQUI SENHOR');
      expect(text).toContain('Artista: Pe. Jonas Abib');
      expect(text).toContain('[Verso 1]');
      expect(text).toContain('Eis-me aqui, Senhor');
      expect(text).toContain('[Refrão]');
      expect(text).toContain('Toma minha vida');
      expect(text).toContain('[2] SOLO DE VIOLÃO');
      expect(text).toContain('(Instrumental / Sem letra)');
      // Must not contain chord symbols
      expect(text).not.toContain('[G]');
      expect(text).not.toContain('G                 D');
    });
  });

  describe('generatePlaylistPresentation', () => {
    it('should call writeFile on pptx instance', async () => {
      await expect(
        generatePlaylistPresentation('Missa Especial', [sampleSong1])
      ).resolves.not.toThrow();
    });
  });
});
