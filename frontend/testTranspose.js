const CHORD_SCALE = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
const FLAT_TO_SHARP = { 'Db': 'C#', 'Eb': 'D#', 'Gb': 'F#', 'Ab': 'G#', 'Bb': 'A#' };
const normalizeRoot = (root) => FLAT_TO_SHARP[root] || root;

const isChordLineHelper = (line) => {
  const cleanLine = line.replace(/^\[.*?\]\s*/, '').trim();
  if (cleanLine.length === 0) return false;
  
  const words = cleanLine.split(/\s+/);
  if (words.length === 0) return false;
  
  const chordRegex = /^[A-G][#b]?(m|maj|dim|aug|sus|add|M)?\d*(b\d+|#\d+)?(\([^)]+\))?(\/[A-G][#b]?)?$/;
  const ignoreRegex = /^(intro|introdução|tab|solo|riff|base|parte|refrão|chorus|verse|ponte|bridge|final|end)?:?(,|:|\.|\||%|-|~|\(\dx\)|\d+x)?$/i;

  let chordCount = 0;
  let wordCount = 0;

  for (const word of words) {
    if (ignoreRegex.test(word)) continue;
    wordCount++;
    if (chordRegex.test(word)) {
      chordCount++;
    } else {
      console.log(`Failed chord: ${word}`);
    }
  }

  const ratio = wordCount > 0 ? (chordCount / wordCount) : 0;
  console.log(`Line: "${line}" => words: ${wordCount}, chords: ${chordCount}, ratio: ${ratio}`);
  return wordCount > 0 && ratio >= 0.7;
};

const transposeChord = (chord, steps) => {
  const match = chord.match(/^([A-G][b#]?)(.*)$/);
  if (!match) return chord;
  const root = normalizeRoot(match[1]);
  const rest = match[2];
  const currentIndex = CHORD_SCALE.indexOf(root);
  if (currentIndex === -1) return chord;
  let newIndex = (currentIndex + steps) % 12;
  if (newIndex < 0) newIndex += 12;
  let newRoot = CHORD_SCALE[newIndex];
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

const transposeContent = (content, steps) => {
  return content.split('\n').map(line => {
    if (isChordLineHelper(line)) {
      const parts = line.split(/(\s+)/);
      return parts.map(part => {
        if (part.trim() === '') return part;
        const strictChordRegex = /^[A-G][#b]?(m|maj|dim|aug|sus|add|M)?\d*(b\d+|#\d+)?(\([^)]+\))?(\/[A-G][#b]?)?$/;
        if (strictChordRegex.test(part)) {
          return transposeChord(part, steps);
        }
        return part;
      }).join('');
    }
    return line;
  }).join('\n');
};

const lines = [
  "TAB - INTRO",
  "Intro:",
  "Intro: C  D",
  "TAB: C9  D/F#  Em7/9",
  "   C          D",
  "E|----------------|",
  "[TAB]",
  "[Intro]",
  "D9 A9 G C D",
  "Intro D9 A9 G C D"
];

for (const line of lines) {
  console.log("Transposed:", transposeContent(line, 2));
  console.log("-----------------------");
}
