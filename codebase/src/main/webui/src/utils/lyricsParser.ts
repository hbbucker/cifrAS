export interface ChordPosition {
 chord: string;
 position: number;
}

export interface Line {
 text: string;
 chords: ChordPosition[];
}

export interface Section {
 label: string;
 lines: Line[];
}

export interface LyricsStructure {
 sections: Section[];
}

export function parseContentToLyrics(content: string): LyricsStructure {
 const sections: Section[] = [];
 let currentSection: Section = { label: '', lines: [] };
 
 const lines = content.split('\n');
 
 for (let i = 0; i < lines.length; i++) {
 const rawLine = lines[i];
 const trimmed = rawLine.trim();
 
 if (!trimmed) {
 continue;
 }
 
 // Check for section header like [Verse 1]
 const sectionMatch = trimmed.match(/^\[(.*)\]$/);
 if (sectionMatch) {
 if (currentSection.lines.length > 0 || currentSection.label) {
 sections.push(currentSection);
 }
 currentSection = { label: sectionMatch[1], lines: [] };
 continue;
 }
 
 // Simplistic heuristic: if it looks like chords above lyrics
 const isChordLine = trimmed.length > 0 && /^[A-G][#b]?[m]?(\s|$)/.test(trimmed);
 
 if (isChordLine) {
 const chords: ChordPosition[] = [];
 const regex = /([A-G][A-Za-z0-9#/]*)/g;
 let match;
 while ((match = regex.exec(rawLine)) !== null) {
 chords.push({ chord: match[1], position: match.index });
 }
 
 // Look ahead to next line for lyrics text
 let text = '';
 if (i + 1 < lines.length) {
 const nextLine = lines[i + 1];
 const nextTrimmed = nextLine.trim();
 const nextIsSection = nextTrimmed.match(/^\[(.*)\]$/);
 const nextIsChord = nextTrimmed.length > 0 && /^[A-G][#b]?[m]?(\s|$)/.test(nextTrimmed);
 
 if (!nextIsSection && !nextIsChord && nextTrimmed.length > 0) {
 text = nextLine;
 i++; // Skip next line
 }
 }
 
 currentSection.lines.push({ text, chords });
 } else {
 // Just a text line with no chords above
 if (trimmed) {
 currentSection.lines.push({ text: rawLine, chords: [] });
 }
 }
 }
 
 if (currentSection.lines.length > 0 || currentSection.label) {
 sections.push(currentSection);
 }
 
 return { sections };
}

export function stringifyLyrics(lyrics: LyricsStructure | undefined | null): string {
 if (!lyrics || !lyrics.sections) return '';
 
 let content = '';
 
 lyrics.sections.forEach((section, index) => {
 if (section.label) {
 content += `[${section.label}]\n`;
 }
 
 section.lines.forEach(line => {
 if (line.chords && line.chords.length > 0) {
 let chordLine = '';
 let lastPos = 0;
 
 // Sort chords by position just in case
 const sortedChords = [...line.chords].sort((a, b) => a.position - b.position);
 
 sortedChords.forEach(c => {
 const spaces = Math.max(0, c.position - lastPos);
 chordLine += ' '.repeat(spaces) + c.chord;
 lastPos = c.position + c.chord.length;
 });
 
 content += chordLine + '\n';
 }
 
 if (line.text !== null && line.text !== undefined && line.text !== '') {
 content += line.text + '\n';
 } else if (line.chords && line.chords.length > 0) {
 // If there are only chords and no text, we already added \n
 }
 });
 
 if (index < lyrics.sections.length - 1) {
 content += '\n';
 }
 });
 
 return content.trim();
}
