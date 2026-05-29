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
});
