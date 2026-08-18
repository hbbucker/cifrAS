import pptxgen from 'pptxgenjs';

export type PresentationTheme = 'dark' | 'light' | 'liturgic';

export interface PresentationOptions {
  theme?: PresentationTheme;
  includePlaylistTitleSlide?: boolean;
  includeSongTitleSlides?: boolean;
  maxLinesPerSlide?: number;
}

export interface SongLyricLine {
  text?: string;
  chords?: Array<{ chord: string; position: number }>;
}

export interface SongLyricSection {
  label?: string;
  lines?: SongLyricLine[];
}

export interface SongForPresentation {
  id: string;
  title: string;
  artist?: string;
  lyrics?: {
    sections?: SongLyricSection[];
  } | null;
  content?: string;
}

export interface ParsedSection {
  label: string;
  lines: string[];
}

const THEME_STYLES: Record<
  PresentationTheme,
  {
    bgColor: string;
    textColor: string;
    accentColor: string;
    subtextColor: string;
    fontFace: string;
  }
> = {
  dark: {
    bgColor: '000000',
    textColor: 'FFFFFF',
    accentColor: 'AA3BFF',
    subtextColor: '9CA3AF',
    fontFace: 'Arial',
  },
  light: {
    bgColor: 'FFFFFF',
    textColor: '111827',
    accentColor: '7C3AED',
    subtextColor: '4B5563',
    fontFace: 'Arial',
  },
  liturgic: {
    bgColor: '0A1128',
    textColor: 'F9FAFB',
    accentColor: 'E60023',
    subtextColor: 'D1D5DB',
    fontFace: 'Georgia',
  },
};

/**
 * Extracts clean, chord-free sections and lyrics text from a song.
 */
export function extractCleanLyricsSections(song: SongForPresentation): ParsedSection[] {
  const result: ParsedSection[] = [];

  if (song.lyrics && Array.isArray(song.lyrics.sections) && song.lyrics.sections.length > 0) {
    for (const section of song.lyrics.sections) {
      const cleanLines: string[] = [];
      if (Array.isArray(section.lines)) {
        for (const line of section.lines) {
          const rawText = line.text?.trim();
          if (rawText && rawText.length > 0) {
            cleanLines.push(rawText);
          }
        }
      }

      if (cleanLines.length > 0) {
        result.push({
          label: section.label?.trim() || '',
          lines: cleanLines,
        });
      }
    }
  } else if (song.content && typeof song.content === 'string') {
    // Fallback: parse raw content string
    const rawLines = song.content.split('\n');
    let currentLabel = '';
    let currentLines: string[] = [];

    for (const raw of rawLines) {
      const trimmed = raw.trim();
      if (!trimmed) continue;

      const sectionMatch = trimmed.match(/^\[(.*)\]$/);
      if (sectionMatch) {
        if (currentLines.length > 0) {
          result.push({ label: currentLabel, lines: currentLines });
          currentLines = [];
        }
        currentLabel = sectionMatch[1];
        continue;
      }

      // Check if it's likely a chord line
      const chordRegex = /^([A-G][#b]?)([mM0-9]|maj|min|dim|aug|sus|add|\+|-|º|°)*(\([^)]+\))*(\/[A-G][#b]?([mM0-9]|maj|min|dim|aug|sus|add|\+|-|º|°)*(\([^)]+\))*)?$/;
      const tokens = trimmed.split(/\s+/).filter(Boolean);
      const chordCount = tokens.filter(t => chordRegex.test(t) || t === '|').length;
      const isChordLine = tokens.length > 0 && chordCount / tokens.length > 0.5;

      if (!isChordLine) {
        currentLines.push(trimmed);
      }
    }

    if (currentLines.length > 0) {
      result.push({ label: currentLabel, lines: currentLines });
    }
  }

  return result;
}

/**
 * Chunks an array of lines into pages of at most maxLines.
 */
export function chunkLines(lines: string[], maxLines: number = 5): string[][] {
  if (!lines || lines.length === 0) return [];
  const chunks: string[][] = [];
  for (let i = 0; i < lines.length; i += maxLines) {
    chunks.push(lines.slice(i, i + maxLines));
  }
  return chunks;
}

/**
 * Builds the pptx presentation object with all slides.
 */
export function buildPresentation(
  playlistName: string,
  songs: SongForPresentation[],
  options?: PresentationOptions
): pptxgen {
  const theme = options?.theme || 'dark';
  const includePlaylistTitle = options?.includePlaylistTitleSlide !== false;
  const includeSongTitles = options?.includeSongTitleSlides !== false;
  const maxLines = options?.maxLinesPerSlide || 5;

  const style = THEME_STYLES[theme] || THEME_STYLES.dark;

  const pptx = new pptxgen();
  pptx.layout = 'LAYOUT_16x9';
  pptx.title = playlistName || 'CifrAS Playlist';

  // 1. Playlist Cover Slide
  if (includePlaylistTitle) {
    const coverSlide = pptx.addSlide();
    coverSlide.background = { color: style.bgColor };

    coverSlide.addText(playlistName || 'Playlist', {
      x: '8%',
      y: '28%',
      w: '84%',
      h: '30%',
      fontSize: 44,
      fontFace: style.fontFace,
      bold: true,
      color: style.textColor,
      align: 'center',
      valign: 'middle',
    });

    coverSlide.addText('CifrAS • Apresentação de Letras', {
      x: '8%',
      y: '58%',
      w: '84%',
      h: '15%',
      fontSize: 20,
      fontFace: style.fontFace,
      color: style.subtextColor,
      align: 'center',
      valign: 'middle',
    });
  }

  // 2. Process each song
  songs.forEach((song, songIndex) => {
    // Song Intro Slide
    if (includeSongTitles) {
      const songIntroSlide = pptx.addSlide();
      songIntroSlide.background = { color: style.bgColor };

      // Small song number badge
      songIntroSlide.addText(`${songIndex + 1}. MÚSICA`, {
        x: '8%',
        y: '22%',
        w: '84%',
        h: '10%',
        fontSize: 18,
        fontFace: style.fontFace,
        bold: true,
        color: style.accentColor,
        align: 'center',
        valign: 'middle',
      });

      // Song Title
      songIntroSlide.addText(song.title, {
        x: '8%',
        y: '34%',
        w: '84%',
        h: '30%',
        fontSize: 42,
        fontFace: style.fontFace,
        bold: true,
        color: style.textColor,
        align: 'center',
        valign: 'middle',
      });

      // Artist
      if (song.artist) {
        songIntroSlide.addText(song.artist, {
          x: '8%',
          y: '64%',
          w: '84%',
          h: '15%',
          fontSize: 22,
          fontFace: style.fontFace,
          color: style.subtextColor,
          align: 'center',
          valign: 'middle',
        });
      }
    }

    const sections = extractCleanLyricsSections(song);

    // If song has no lyrics, add a placeholder slide
    if (sections.length === 0) {
      const noLyricsSlide = pptx.addSlide();
      noLyricsSlide.background = { color: style.bgColor };
      noLyricsSlide.addText(song.title, {
        x: '8%',
        y: '35%',
        w: '84%',
        h: '20%',
        fontSize: 38,
        fontFace: style.fontFace,
        bold: true,
        color: style.textColor,
        align: 'center',
        valign: 'middle',
      });
      noLyricsSlide.addText('(Instrumental / Sem letra cadastrada)', {
        x: '8%',
        y: '55%',
        w: '84%',
        h: '15%',
        fontSize: 20,
        fontFace: style.fontFace,
        color: style.subtextColor,
        align: 'center',
        valign: 'middle',
      });
      return;
    }

    // Lyric Slides
    for (const section of sections) {
      const lineChunks = chunkLines(section.lines, maxLines);

      lineChunks.forEach((chunk, chunkIdx) => {
        const slide = pptx.addSlide();
        slide.background = { color: style.bgColor };

        // Section badge in top bar
        if (section.label) {
          const badgeText = lineChunks.length > 1
            ? `${section.label} (${chunkIdx + 1}/${lineChunks.length})`
            : section.label;

          slide.addText(badgeText.toUpperCase(), {
            x: '6%',
            y: '6%',
            w: '88%',
            h: '8%',
            fontSize: 16,
            fontFace: style.fontFace,
            bold: true,
            color: style.accentColor,
            align: 'center',
            valign: 'middle',
          });
        }

        // Lyrics Text Block
        const lyricsText = chunk.join('\n');
        const calculatedFontSize = chunk.length > 4 ? 32 : 36;

        slide.addText(lyricsText, {
          x: '6%',
          y: section.label ? '18%' : '12%',
          w: '88%',
          h: '70%',
          fontSize: calculatedFontSize,
          fontFace: style.fontFace,
          bold: true,
          color: style.textColor,
          align: 'center',
          valign: 'middle',
          isTextBox: true,
          lineSpacingMultiple: 1.25,
        });

        // Small Footer
        slide.addText(song.title, {
          x: '6%',
          y: '90%',
          w: '88%',
          h: '6%',
          fontSize: 12,
          fontFace: style.fontFace,
          color: style.subtextColor,
          align: 'right',
          valign: 'middle',
        });
      });
    }
  });

  return pptx;
}

/**
 * Sanitizes filename to prevent invalid characters.
 */
function sanitizeFileName(name: string): string {
  return name.replace(/[/\\?%*:|"<>]/g, '_').trim() || 'Apresentacao';
}

/**
 * Generates and downloads the .pptx presentation directly in the browser.
 */
export async function generatePlaylistPresentation(
  playlistName: string,
  songs: SongForPresentation[],
  options?: PresentationOptions
): Promise<void> {
  const pptx = buildPresentation(playlistName, songs, options);
  const fileName = `${sanitizeFileName(playlistName)}.pptx`;
  await pptx.writeFile({ fileName });
}

/**
 * Compiles all song lyrics cleanly into a plain-text format for the clipboard.
 */
export function exportCleanLyricsText(
  playlistName: string,
  songs: SongForPresentation[]
): string {
  const lines: string[] = [];

  lines.push('========================================');
  lines.push(`PLAYLIST: ${playlistName.toUpperCase()}`);
  lines.push('========================================\n');

  songs.forEach((song, index) => {
    lines.push(`[${index + 1}] ${song.title.toUpperCase()}`);
    if (song.artist) {
      lines.push(`Artista: ${song.artist}`);
    }
    lines.push('----------------------------------------');

    const sections = extractCleanLyricsSections(song);
    if (sections.length === 0) {
      lines.push('(Instrumental / Sem letra)\n');
    } else {
      sections.forEach(sec => {
        if (sec.label) {
          lines.push(`\n[${sec.label}]`);
        }
        sec.lines.forEach(l => lines.push(l));
      });
      lines.push('\n');
    }
  });

  return lines.join('\n').trim();
}
