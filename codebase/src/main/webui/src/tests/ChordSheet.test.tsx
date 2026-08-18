import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { ChordSheet } from '../components/music/ChordSheet';
import '@testing-library/jest-dom/vitest';

vi.mock('react-window', () => ({
 FixedSizeList: ({ children, itemCount }: { children: (props: { index: number; style: React.CSSProperties }) => React.ReactNode; itemCount: number }) => (
 <div data-testid="mock-virtual-list">
 {Array.from({ length: itemCount }).map((_, index) => 
 children({ index, style: {} })
 )}
 </div>
 )
}));

describe('ChordSheet Component', () => {
 const mockContent = `[Intro]
C G Am F

[Verse 1]
C G
Today is gonna be the day
 Am F
That they're gonna throw it back to you`;

 it('renders within a virtualized container', () => {
 render(<ChordSheet content={mockContent} height={500} />);
 expect(screen.getByTestId('chord-sheet-container')).toBeInTheDocument();
 });

 it('renders lines accurately', () => {
 render(<ChordSheet content={mockContent} height={500} />);
 
 // Check for some lines (virtualized so only visible ones render)
 expect(screen.getByText('C G Am F')).toBeInTheDocument();
 expect(screen.getByText('Today is gonna be the day')).toBeInTheDocument();
 });

 it('applies custom font size', () => {
 render(<ChordSheet content={mockContent} fontSize={24} />);
 const container = screen.getByTestId('chord-sheet-container');
 expect(container.style.fontSize).toBe('24px');
 });

  it('handles empty content without crashing', () => {
    render(<ChordSheet content="" />);
    expect(screen.getByTestId('chord-sheet-container')).toBeInTheDocument();
  });

  it('hides chord lines and tab lines when singerMode is active (Modo Cantor)', () => {
    const mixedContent = `[Intro]
C G Am F
e|---0---2---|
B|---1---3---|
↓↑↓↑

[Verse 1]
C G
Hoje é o dia de cantar
Am F
Sem cifras na tela`;

    const { rerender } = render(<ChordSheet content={mixedContent} singerMode={false} />);

    // In normal mode, chords and tabs are rendered
    expect(screen.getByText('C G Am F')).toBeInTheDocument();
    expect(screen.getByText('Hoje é o dia de cantar')).toBeInTheDocument();
    expect(screen.getByText(/e\|/)).toBeInTheDocument();

    // In singer mode, chords, tabs and strumming are hidden
    rerender(<ChordSheet content={mixedContent} singerMode={true} />);

    expect(screen.queryByText('C G Am F')).not.toBeInTheDocument();
    expect(screen.queryByText('C G')).not.toBeInTheDocument();
    expect(screen.queryByText('Am F')).not.toBeInTheDocument();
    expect(screen.queryByText(/e\|/)).not.toBeInTheDocument();
    expect(screen.queryByText(/↓↑↓↑/)).not.toBeInTheDocument();

    // Section headers and lyrics are preserved
    expect(screen.getByText('[Intro]')).toBeInTheDocument();
    expect(screen.getByText('[Verse 1]')).toBeInTheDocument();
    expect(screen.getByText('Hoje é o dia de cantar')).toBeInTheDocument();
    expect(screen.getByText('Sem cifras na tela')).toBeInTheDocument();
  });

  it('displays instrumental notice when song has no lyrics in singerMode', () => {
    const instrumentalContent = `[Solo]
e|---0---2---3---|
B|---1---3---0---|
G|---0---2---0---|
D|---2---0---0---|
A|---3-------2---|
E|-----------3---|`;

    render(<ChordSheet content={instrumentalContent} singerMode={true} />);
    expect(screen.getByTestId('instrumental-singer-notice')).toBeInTheDocument();
    expect(screen.getByText('(Música Instrumental / Sem Letra)')).toBeInTheDocument();
  });
});
