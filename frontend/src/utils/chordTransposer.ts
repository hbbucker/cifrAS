const CHORD_SCALE = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
const FLAT_TO_SHARP: Record<string, string> = {
  'Db': 'C#', 'Eb': 'D#', 'Gb': 'F#', 'Ab': 'G#', 'Bb': 'A#'
};

const normalizeRoot = (root: string) => FLAT_TO_SHARP[root] || root;

export const transposeChord = (chord: string, steps: number): string => {
  // Match the root note, optional accidental, and the rest
  const match = chord.match(/^([A-G][b#]?)(.*)$/);
  if (!match) return chord;

  const root = normalizeRoot(match[1]);
  const rest = match[2];

  const currentIndex = CHORD_SCALE.indexOf(root);
  if (currentIndex === -1) return chord;

  // Calculate new index with wrap-around
  let newIndex = (currentIndex + steps) % 12;
  if (newIndex < 0) newIndex += 12;

  let newRoot = CHORD_SCALE[newIndex];
  
  // Also transpose bass notes if present (e.g., /F#)
  let newRest = rest;
  const bassMatch = rest.match(/^(\/)([A-G][b#]?)(.*)$/);
  if (bassMatch) {
    const bassRoot = normalizeRoot(bassMatch[2]);
    const bassIndex = CHORD_SCALE.indexOf(bassRoot);
    if (bassIndex !== -1) {
      let newBassIndex = (bassIndex + steps) % 12;
      if (newBassIndex < 0) newBassIndex += 12;
      newRest = `${bassMatch[1]}${CHORD_SCALE[newBassIndex]}${bassMatch[3]}`;
    }
  }

  return `${newRoot}${newRest}`;
};

export const transposeLine = (line: string, steps: number): string => {
  // A simple regex to find chords in a line. 
  // It assumes words starting with A-G and optional #/b are chords if they match the chord structure.
  // The ChordSheet component uses a similar regex to colorize.
  // We'll replace chords in the line while preserving spaces.
  
  const chordRegex = /\b[A-G][#b]?(?:m|maj|dim|aug|sus|add|M)?\d*(?:b\d+|#\d+)?(?:\([^)]+\))?(?:\/[A-G][#b]?)?\b/g;
  
  // We need to be careful not to transpose normal text that looks like a chord (e.g. "A" or "I" or "Am").
  // So we only transpose if the line is predominantly chords, or we do it word by word if the line is a chord line.
  
  // For now, let's just transpose everything that matches the regex, since this function 
  // should ideally only be called on lines that are known to be chord lines.
  return line.replace(chordRegex, (match) => transposeChord(match, steps));
};

export const isChordLineHelper = (line: string) => {
  const cleanLine = line.replace(/^\[.*?\]\s*/, '').trim();
  if (cleanLine.length === 0) return false;
  
  const words = cleanLine.split(/\s+/);
  if (words.length === 0) return false;
  
  const chordRegex = /^[A-G][#b]?(m|M|maj|dim|aug|sus|add)?\d*(m|M|maj|dim|aug|sus|add)?(b\d+|#\d+)?(\([^)]+\))?(\/([A-G][#b]?|\d+))?$/;
  // Ignore structural words and punctuation when calculating the chord ratio
  const ignoreRegex = /^(intro|introdução|tab|solo|riff|base|parte|refrão|chorus|verse|ponte|bridge|final|end)?:?(,|:|\.|\||%|-|~|\(\dx\)|\d+x)?$/i;

  let chordCount = 0;
  let wordCount = 0;

  for (const word of words) {
    if (ignoreRegex.test(word)) continue;
    wordCount++;
    if (chordRegex.test(word)) {
      chordCount++;
    }
  }

  return wordCount > 0 && (chordCount / wordCount) >= 0.7;
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
  let rest = match[2];

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

export const transposeContent = (content: string, steps: number): string => {
  if (steps === 0) return content;
  
  return content.split('\n').map(line => {
    if (isChordLineHelper(line)) {
      // Split the line by spaces but preserve them to keep alignment
      // Because chord lines rely heavily on precise spacing, we use a regex that matches chords or spaces
      
      const parts = line.split(/(\s+)/);
      return parts.map(part => {
        if (part.trim() === '') return part; // Space
        
        // Let's use a more strict chord regex for exact match on the part
        const strictChordRegex = /^[A-G][#b]?(m|M|maj|dim|aug|sus|add)?\d*(m|M|maj|dim|aug|sus|add)?(b\d+|#\d+)?(\([^)]+\))?(\/([A-G][#b]?|\d+))?$/;
        if (strictChordRegex.test(part)) {
          return transposeChord(part, steps);
        }
        return part;
      }).join('');
    } else if (isTabLineHelper(line)) {
      return transposeTabLine(line, steps);
    }
    return line;
  }).join('\n');
};

export const getNextKey = (currentKey: string, up: boolean): string => {
  const rootMatch = currentKey.match(/^[A-G][b#]?/);
  if (!rootMatch) return currentKey;
  
  const root = normalizeRoot(rootMatch[0]);
  const index = CHORD_SCALE.indexOf(root);
  if (index === -1) return currentKey;
  
  let newIndex = (index + (up ? 1 : -1)) % 12;
  if (newIndex < 0) newIndex += 12;
  
  return currentKey.replace(/^[A-G][b#]?/, CHORD_SCALE[newIndex]);
};
