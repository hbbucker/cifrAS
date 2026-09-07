import React, { useMemo } from 'react';
import { isChordLineHelper } from '../../utils/chordTransposer';

interface ChordSheetProps {
  content: string;
  fontSize?: number;
  width?: number | string;
  height?: number | string;
  transparent?: boolean;
  singerMode?: boolean;
  columns?: 1 | 2;
}

export const ChordSheet: React.FC<ChordSheetProps> = ({ 
  content, 
  fontSize = 18, 
  width = '100%', 
  height = '100%',
  transparent = false,
  singerMode = false,
  columns = 1
}) => {
  // Parse content line by line
  const rawLines = useMemo(() => content.split('\n'), [content]);
  
  // Calculate line height based on font size (approx 1.5x)
  const itemSize = Math.max(24, Math.round(fontSize * 1.5));

  const lines = useMemo(() => {
    if (!singerMode) return rawLines;
    
    const filtered: string[] = [];
    let prevWasEmpty = false;

    for (const line of rawLines) {
      const trimmed = line.trim();
      const isChordLine = isChordLineHelper(line);
      const isTabLine = /^[eBGDAEa-g][#b]?\|/.test(trimmed);
      const isStrumLine = /^[\s]*[↓↑v^]+[\s↓↑v^]*$/.test(line) && trimmed.length > 0;

      if (isChordLine || isTabLine || isStrumLine) {
        continue;
      }

      if (!trimmed) {
        if (!prevWasEmpty && filtered.length > 0) {
          filtered.push('');
          prevWasEmpty = true;
        }
      } else {
        filtered.push(line);
        prevWasEmpty = false;
      }
    }

    return filtered;
  }, [rawLines, singerMode]);

  const hasLyrics = useMemo(() => {
    return lines.some(l => {
      const trimmed = l.trim();
      return trimmed.length > 0 && !(trimmed.startsWith('[') && trimmed.endsWith(']'));
    });
  }, [lines]);

  const stanzas = useMemo(() => {
    const result: { startIndex: number; lines: string[] }[] = [];
    let currentStanza: string[] = [];
    let currentStartIndex = 0;

    lines.forEach((line, index) => {
      const trimmed = line.trim();
      const isEmpty = trimmed.length === 0;

      if (isEmpty) {
        if (currentStanza.length > 0) {
          result.push({ startIndex: currentStartIndex, lines: currentStanza });
          currentStanza = [];
        }
        result.push({ startIndex: index, lines: [line] });
        currentStartIndex = index + 1;
      } else {
        if (currentStanza.length === 0) {
          currentStartIndex = index;
        }
        currentStanza.push(line);
      }
    });

    if (currentStanza.length > 0) {
      result.push({ startIndex: currentStartIndex, lines: currentStanza });
    }

    return result;
  }, [lines]);

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
            return <span key={i} className="text-gray-500 dark:text-text-mute">{chunk}</span>;
          }
        })}
      </>
    );
  };

  const renderLine = (line: string, index: number) => {
    const trimmed = line.trim();
    const isEmptyLine = trimmed.length === 0;
    const isChordLine = !singerMode && isChordLineHelper(line);
    const isSectionHeader = trimmed.startsWith('[') && trimmed.endsWith(']');
    const isTabLine = !singerMode && /^[eBGDAEa-g][#b]?\|/.test(trimmed);
    const isStrumLine = !singerMode && /^[\s]*[↓↑v^]+[\s↓↑v^]*$/.test(line) && trimmed.length > 0;
    
    const lineMinHeight = isEmptyLine ? 12 : itemSize;

    // All lines use whitespace-pre to preserve chord/lyric column alignment.
    let lineClasses = transparent ? 'text-inherit' : 'text-text-main';
    if (isChordLine) {
      lineClasses = 'text-[#aa3bff] font-bold';
    } else if (isSectionHeader) {
      lineClasses = 'text-text-main font-bold';
    } else if (isStrumLine) {
      lineClasses = 'text-orange-500 font-black tracking-widest';
    }

    return (
      <div 
        key={index}
        style={{ 
          display: 'flex', 
          alignItems: 'center', 
          minHeight: `${lineMinHeight}px`,
          ...(isEmptyLine ? { height: `${lineMinHeight}px`, lineHeight: `${lineMinHeight}px` } : {})
        }} 
        className={`whitespace-pre font-mono ${lineClasses}`}
        data-testid={`line-${index}`}
      >
        {isTabLine ? renderTabLine(line) : (line || ' ')}
      </div>
    );
  };

  const isMultiColumn = columns === 2;

  return (
    <div 
      className={transparent ? "w-full overflow-x-hidden" : "bg-bg-card rounded p-4 border border-border-main shadow-sm overflow-y-auto"}
      style={transparent ? { fontSize: `${fontSize}px` } : { fontSize: `${fontSize}px`, width, height }}
      data-testid="chord-sheet-container"
    >
      <div 
        className={`h-full w-full ${isMultiColumn ? 'columns-1 md:columns-2 gap-8 [column-fill:balance]' : ''}`} 
        style={{ lineHeight: `${itemSize}px` }}
        data-testid="chord-sheet-columns"
      >
        {singerMode && !hasLyrics && content.trim().length > 0 ? (
          <div className="text-center py-12 text-text-mute italic text-lg" data-testid="instrumental-singer-notice">
            (Música Instrumental / Sem Letra)
          </div>
        ) : (
          stanzas.map((stanza, sIdx) => {
            const isBlankStanza = stanza.lines.length === 1 && stanza.lines[0].trim().length === 0;
            return (
              <div 
                key={sIdx} 
                className={`${isMultiColumn ? (isBlankStanza ? '' : 'break-inside-avoid inline-block w-full mb-1') : ''}`}
              >
                {stanza.lines.map((line, lIdx) => renderLine(line, stanza.startIndex + lIdx))}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
