import React, { useMemo } from 'react';
// Removed react-window as it is unnecessary for standard chord sheets and was causing import issues.
interface ChordSheetProps {
 content: string;
 fontSize?: number;
 width?: number | string;
 height?: number | string;
 transparent?: boolean;
}

export const ChordSheet: React.FC<ChordSheetProps> = ({ 
 content, 
 fontSize = 18, 
 width = '100%', 
 height = '100%',
 transparent = false
}) => {
 // Parse content line by line
 const lines = useMemo(() => content.split('\n'), [content]);
 
 // Calculate line height based on font size (approx 1.5x)
 const itemSize = Math.max(24, Math.round(fontSize * 1.5));

 const isChordLineHelper = (line: string) => {
 const cleanLine = line.replace(/^\[.*?\]\s*/, '').trim();
 if (cleanLine.length === 0) return false;
 
 const words = cleanLine.split(/\s+/);
 if (words.length === 0) return false;
 
 // Strict chord regex covering extended chords, slashes, and parentheses
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

 const renderTabLine = (line: string) => {
 const match = line.match(/^(\s*)([eBGDAEa-g][#b]?\|)(.*)$/);
 if (!match) return <span>{line}</span>;
 
 const [, spaces, prefix, rest] = match;
 const chunks = rest.split(/([0-9hpsx/\\b~v^]+)/i);
 
 return (
 <>
 {spaces}
 <span className="text-[#aa3bff] font-bold">{prefix}</span>
 {chunks.map((chunk, i) => {
 if (/[0-9hpsx/\\b~v^]+/i.test(chunk)) {
 return <span key={i} className="text-text-main font-bold">{chunk}</span>;
 } else if (chunk.includes('-')) {
 return <span key={i} className="text-gray-300 dark:text-text-mute font-light">{chunk}</span>;
 } else {
 return <span key={i} className="text-gray-400 dark:text-text-mute">{chunk}</span>;
 }
 })}
 </>
 );
 };

 return (
 <div 
 className={transparent ? "w-full overflow-hidden" : "bg-bg-card rounded p-4 border border-border-main shadow-sm overflow-y-auto"}
 style={transparent ? { fontSize: `${fontSize}px` } : { fontSize: `${fontSize}px`, width, height }}
 data-testid="chord-sheet-container"
 >
 <div className="h-full w-full" style={{ lineHeight: `${itemSize}px` }}>
 {lines.map((line, index) => {
 const trimmed = line.trim();
 const isChordLine = isChordLineHelper(line);
 const isSectionHeader = trimmed.startsWith('[') && trimmed.endsWith(']');
 const isTabLine = /^[eBGDAEa-g][#b]?\|/.test(trimmed);
 const isStrumLine = /^[\s]*[↓↑v^]+[\s↓↑v^]*$/.test(line) && trimmed.length > 0;
 
 let lineClasses = transparent ? 'text-inherit' : 'text-text-main';
 if (isChordLine) {
 lineClasses = 'text-[#aa3bff] font-bold';
 } else if (isSectionHeader) {
 lineClasses = 'text-text-main font-bold bg-bg-elevated inline-block px-3 py-1 rounded-md mt-6 mb-2 text-sm tracking-wider uppercase shadow-sm border border-border-main';
 } else if (isStrumLine) {
 lineClasses = 'text-orange-500 font-black tracking-widest';
 }
 
 return (
 <div 
 key={index}
 style={{ display: 'flex', alignItems: 'center', minHeight: `${itemSize}px` }} 
 className={`whitespace-pre font-mono ${lineClasses}`}
 data-testid={`line-${index}`}
 >
 {isTabLine ? renderTabLine(line) : (line || ' ')}
 </div>
 );
 })}
 </div>
 </div>
 );
};
