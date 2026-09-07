const CHORD_SCALE = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
const FLAT_TO_SHARP: Record<string, string> = {
 'Db': 'C#', 'Eb': 'D#', 'Gb': 'F#', 'Ab': 'G#', 'Bb': 'A#'
};

const normalizeRoot = (root: string) => FLAT_TO_SHARP[root] || root;

export const CORE_CHORD_REGEX = /^[A-G][#b]?(?:m|M|maj|min|dim|aug|sus|add|alt|º|°|ø|Ø|\+|-|b|#|[0-9])*(?:\([^)]+\))*(?:\/(?:[A-G][#b]?(?:m|M|maj|min|dim|aug|sus|add|alt|º|°|ø|Ø|\+|-|b|#|[0-9])*(?:\([^)]+\))*|\d+))?$/;
export const MARKER_REGEX = /^(\|:|:\||\||%|-|~|\(\d+x\)|\d+x|intro:?|solo:?|riff:?|base:?|interlúdio:?|interlude:?|fim:?|final:?)$/i;

export const stripOuterPunctuation = (token: string): string => {
  if (!token) return '';
  let str = token.trim();

  // Strip leading punctuation/brackets/parentheses: '(', '[', '{', '|', ':'
  while (str.length > 0 && /^[[({|:~]/.test(str)) {
    str = str.slice(1);
  }

  // Strip trailing punctuation/brackets/parentheses: ')', ']', '}', '|', ',', '.', ';', '!'
  // For ')' specifically: only strip if unbalanced
  while (str.length > 0) {
    const lastChar = str[str.length - 1];
    if (/[)\]}|:.,;~*!]/.test(lastChar)) {
      if (lastChar === ')') {
        const openCount = (str.match(/\(/g) || []).length;
        const closeCount = (str.match(/\)/g) || []).length;
        if (closeCount > openCount) {
          str = str.slice(0, -1);
          continue;
        } else {
          break;
        }
      } else {
        str = str.slice(0, -1);
        continue;
      }
    }
    break;
  }

  return str;
};

function transposeSingleChord(chord: string, steps: number, useBb: boolean = false, useEb: boolean = false): string {
  const match = chord.match(/^([A-G][b#]?)(.*)$/);
  if (!match) return chord;

  const originalRoot = match[1];
  const root = normalizeRoot(originalRoot);
  const rest = match[2];

  const currentIndex = CHORD_SCALE.indexOf(root);
  if (currentIndex === -1) return chord;

  let newIndex = (currentIndex + steps) % 12;
  if (newIndex < 0) newIndex += 12;

  let newRoot = steps === 0 ? originalRoot : CHORD_SCALE[newIndex];
  if (useBb && normalizeRoot(newRoot) === 'A#') newRoot = 'Bb';
  if (useEb && normalizeRoot(newRoot) === 'D#') newRoot = 'Eb';

  return `${newRoot}${rest}`;
}

export const transposeChord = (chord: string, steps: number, useBb: boolean = false, useEb: boolean = false): string => {
  if (!chord) return chord;

  // Extract leading outer punctuation (e.g. '(', '[', '|')
  let start = 0;
  while (start < chord.length && /[[({|]/.test(chord[start])) {
    start++;
  }

  // Extract trailing outer punctuation (e.g. ')', ']', '|', ',', '.', ';', '!')
  let end = chord.length;
  while (end > start) {
    const char = chord[end - 1];
    if (/[)\]}|,.:;*!]/.test(char)) {
      if (char === ')') {
        const sub = chord.substring(start, end);
        const openCount = (sub.match(/\(/g) || []).length;
        const closeCount = (sub.match(/\)/g) || []).length;
        if (closeCount > openCount) {
          end--;
          continue;
        } else {
          break;
        }
      } else {
        end--;
        continue;
      }
    }
    break;
  }

  const leadPunct = chord.substring(0, start);
  const inner = chord.substring(start, end);
  const trailPunct = chord.substring(end);

  if (!inner) return chord;

  // Check for slash bass (e.g. C/E, Cº/Eb, Am7/G, G/B, but not C6/9 or C7/9 where denominator is a number)
  if (inner.includes('/')) {
    const slashIdx = inner.lastIndexOf('/');
    const numerator = inner.substring(0, slashIdx);
    const denominator = inner.substring(slashIdx + 1);

    const bassMatch = denominator.match(/^([A-G][b#]?)(.*)$/);
    if (bassMatch) {
      const transposedNumerator = transposeSingleChord(numerator, steps, useBb, useEb);
      const bassOriginal = bassMatch[1];
      const bassRest = bassMatch[2];
      const bassRoot = normalizeRoot(bassOriginal);
      const bassIndex = CHORD_SCALE.indexOf(bassRoot);
      let newBass = bassOriginal;
      if (bassIndex !== -1) {
        let newBassIndex = (bassIndex + steps) % 12;
        if (newBassIndex < 0) newBassIndex += 12;
        newBass = steps === 0 ? bassOriginal : CHORD_SCALE[newBassIndex];
        if (useBb && normalizeRoot(newBass) === 'A#') newBass = 'Bb';
        if (useEb && normalizeRoot(newBass) === 'D#') newBass = 'Eb';
      }
      return `${leadPunct}${transposedNumerator}/${newBass}${bassRest}${trailPunct}`;
    }
  }

  return `${leadPunct}${transposeSingleChord(inner, steps, useBb, useEb)}${trailPunct}`;
};

export const transposeLine = (line: string, steps: number, useBb: boolean = false, useEb: boolean = false): string => {
  const chordRegex = /\b[A-G][#b]?(?:m|M|maj|min|dim|aug|sus|add|alt|º|°|ø|Ø|\+|-|b|#|[0-9])*(?:\([^)]+\))*(?:\/(?:[A-G][#b]?|\d+))?\b/g;
  return line.replace(chordRegex, (match) => transposeChord(match, steps, useBb, useEb));
};

export const isChordLineHelper = (line: string): boolean => {
  const cleanLine = line.replace(/^\[.*?\]\s*/, '').trim();
  if (cleanLine.length === 0) return false;
  
  const words = cleanLine.split(/\s+/).filter(Boolean);
  if (words.length === 0) return false;
  
  let chordCount = 0;
  let wordCount = 0;

  for (const word of words) {
    if (MARKER_REGEX.test(word)) continue;
    
    const cleanWord = stripOuterPunctuation(word);
    if (cleanWord.length === 0) continue;

    if (MARKER_REGEX.test(cleanWord)) continue;

    wordCount++;
    if (CORE_CHORD_REGEX.test(cleanWord)) {
      chordCount++;
    }
  }

  return wordCount > 0 && (chordCount / wordCount) >= 0.5;
};

export const isTabLineHelper = (line: string) => {
 return /^\s*([eBGDAEa-g][#b]?|[1-6])\s*\|/.test(line);
};

export const transposeTabLine = (line: string, steps: number): string => {
 if (steps === 0) return line;

 const tabPrefixRegex = /^(\s*(?:[eBGDAEa-g][#b]?|[1-6])\s*\|)(.*)$/;
 const match = line.match(tabPrefixRegex);
 
 if (!match) return line;

 const prefix = match[1];
 const rest = match[2];

 const resultRest = rest.replace(/(-*)([0-9Oo]+)(-*)/g, (fullMatch, leftDashes, numStr, rightDashes, offset, string) => {
 // Prevent transposing repetition markers like "2x"
 // Only apply this if there are no dashes around the number, as a number with dashes (e.g., -2x- or -0---X) is a fret note followed by a mute or other symbol.
 if (leftDashes.length === 0 && rightDashes.length === 0 && string[offset + fullMatch.length]?.toLowerCase() === 'x') {
 return fullMatch;
 }

 const normalizedNumStr = numStr.replace(/[Oo]/g, '0');
 const originalNum = parseInt(normalizedNumStr, 10);
 const newNum = originalNum + steps;
 
 // Wrap negative numbers in parentheses to prevent the minus sign from blending into the tab line
 const newNumStr = newNum < 0 ? `(${newNum})` : newNum.toString();
 
 const lengthDiff = newNumStr.length - numStr.length;
 
 let newLeftDashes = leftDashes;
 let newRightDashes = rightDashes;
 
 // Balance dashes to maintain vertical alignment
 if (lengthDiff > 0) {
 for (let i = 0; i < lengthDiff; i++) {
 if (newRightDashes.length > 0) {
 newRightDashes = newRightDashes.slice(0, -1);
 } else if (newLeftDashes.length > 0) {
 newLeftDashes = newLeftDashes.slice(0, -1);
 }
 }
 } else if (lengthDiff < 0) {
 for (let i = 0; i < -lengthDiff; i++) {
 newRightDashes += '-';
 }
 }
 
 return `${newLeftDashes}${newNumStr}${newRightDashes}`;
 });

 return prefix + resultRest;
};

export const transposeContent = (content: string, steps: number, useBb: boolean = false, useEb: boolean = false): string => {
 if (steps === 0 && !useBb && !useEb) return content;
  return content.split('\n').map(line => {
    if (isChordLineHelper(line)) {
      const parts = line.split(/(\s+)/);
      return parts.map(part => {
        if (part.trim() === '') return part; // Space

        const cleanPart = part.replace(/^[([{|:~\s]+|[)\]}|:.,;~*!]+$/g, '');
        if (cleanPart && CORE_CHORD_REGEX.test(cleanPart)) {
          return transposeChord(part, steps, useBb, useEb);
        }
        return part;
      }).join('');
    } else if (isTabLineHelper(line)) {
      return transposeTabLine(line, steps);
    }
    return line;
  }).join('\n');
};

export const getNextKey = (currentKey: string, up: boolean, useBb: boolean = false, useEb: boolean = false): string => {
 const rootMatch = currentKey.match(/^[A-G][b#]?/);
 if (!rootMatch) return currentKey;
 
 const root = normalizeRoot(rootMatch[0]);
 const index = CHORD_SCALE.indexOf(root);
 if (index === -1) return currentKey;
 
 let newIndex = (index + (up ? 1 : -1)) % 12;
 if (newIndex < 0) newIndex += 12;
 
 let newRoot = CHORD_SCALE[newIndex];
 if (useBb && newRoot === 'A#') newRoot = 'Bb';
 if (useEb && newRoot === 'D#') newRoot = 'Eb';

 return currentKey.replace(/^[A-G][b#]?/, newRoot);
};
