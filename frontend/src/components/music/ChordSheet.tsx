import React, { useMemo } from 'react';
import * as ReactWindow from 'react-window';
const List = (ReactWindow as any).FixedSizeList || (ReactWindow as any).default?.FixedSizeList || ((props: any) => <div {...props}>{props.children({ index: 0, style: {} })}</div>);

interface ChordSheetProps {
  content: string;
  fontSize?: number;
  width?: number | string;
  height?: number;
}

export const ChordSheet: React.FC<ChordSheetProps> = ({ 
  content, 
  fontSize = 18, 
  width = '100%', 
  height = 600 
}) => {
  // Parse content: simple assumption that lines starting with brackets or matching chord regex are chords
  // But for this requirement, we'll assume the content is already raw text that just needs Courier New formatting
  // and virtualization. The exact parsing of chords over text can be complex, but we'll assume line-by-line formatting.
  const lines = useMemo(() => content.split('\n'), [content]);
  
  // Calculate line height based on font size (approx 1.5x)
  const itemSize = Math.max(24, Math.round(fontSize * 1.5));

  const Row = ({ index, style }: { index: number, style: React.CSSProperties }) => {
    const line = lines[index];
    // Very basic heuristic: if line has many spaces and common chord letters, it might be a chord line
    // In a real app, the parsing is done beforehand into a structured JSON
    const isChordLine = line.trim().length > 0 && /^[A-G][#b]?[m]?\s*/.test(line.trim());
    
    return (
      <div 
        style={{...style, display: 'flex', alignItems: 'center'}} 
        className={`whitespace-pre font-mono ${isChordLine ? 'text-[#aa3bff] font-bold' : 'text-gray-800 dark:text-gray-200'}`}
        data-testid={`line-${index}`}
      >
        {line || ' '}
      </div>
    );
  };

  return (
    <div 
      className="bg-white dark:bg-gray-900 rounded p-4 border border-gray-100 dark:border-gray-800 shadow-sm"
      style={{ fontSize: `${fontSize}px` }}
      data-testid="chord-sheet-container"
    >
      <List
        height={height}
        itemCount={lines.length}
        itemSize={itemSize}
        width={width}
      >
        {Row}
      </List>
    </div>
  );
};
