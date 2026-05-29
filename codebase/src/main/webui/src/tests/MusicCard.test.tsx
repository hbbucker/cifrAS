import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { MusicCard } from '../components/cards/MusicCard';
import '@testing-library/jest-dom/vitest';

describe('MusicCard Component', () => {
 const mockProps = {
 id: '1',
 title: 'Wonderwall',
 artist: 'Oasis',
 keySignature: 'F#m',
 isFavorite: false,
 categories: ['Rock', '90s'],
 onToggleFavorite: vi.fn(),
 onEdit: vi.fn(),
 onShare: vi.fn(),
 onDelete: vi.fn(),
 };

 it('renders prop data correctly', () => {
 render(<MusicCard {...mockProps} />);
 expect(screen.getByText('Wonderwall')).toBeInTheDocument();
 expect(screen.getByText('Oasis')).toBeInTheDocument();
 expect(screen.getByText('F#m')).toBeInTheDocument();
 expect(screen.getByText('Rock')).toBeInTheDocument();
 expect(screen.getByText('90s')).toBeInTheDocument();
 });

 it('toggles favorite correctly', () => {
 render(<MusicCard {...mockProps} />);
 const favBtn = screen.getByTestId('favorite-btn');
 fireEvent.click(favBtn);
 expect(mockProps.onToggleFavorite).toHaveBeenCalledWith('1');
 });

 it('opens dropdown and displays actions', () => {
 render(<MusicCard {...mockProps} />);
 const menuBtn = screen.getByTestId('menu-btn');
 
 expect(screen.queryByTestId('dropdown-menu')).not.toBeInTheDocument();
 fireEvent.click(menuBtn);
 expect(screen.getByTestId('dropdown-menu')).toBeInTheDocument();
 expect(screen.getByText('Edit')).toBeInTheDocument();
 expect(screen.getByText('Share')).toBeInTheDocument();
 expect(screen.getByText('Delete')).toBeInTheDocument();
 });

 it('triggers action callbacks from dropdown', () => {
 render(<MusicCard {...mockProps} />);
 fireEvent.click(screen.getByTestId('menu-btn'));
 
 fireEvent.click(screen.getByText('Edit'));
 expect(mockProps.onEdit).toHaveBeenCalledWith('1');
 
 fireEvent.click(screen.getByTestId('menu-btn'));
 fireEvent.click(screen.getByText('Share'));
 expect(mockProps.onShare).toHaveBeenCalledWith('1');
 
 fireEvent.click(screen.getByTestId('menu-btn'));
 fireEvent.click(screen.getByText('Delete'));
 expect(mockProps.onDelete).toHaveBeenCalledWith('1');
 });

 it('stops event propagation when clicking menu items', () => {
 const mockClick = vi.fn();
 render(
 <div onClick={mockClick} data-testid="parent-wrapper">
 <MusicCard {...mockProps} />
 </div>
 );
 
 // Click menu button
 fireEvent.click(screen.getByTestId('menu-btn'));
 expect(mockClick).not.toHaveBeenCalled();
 
 // Click Edit
 fireEvent.click(screen.getByText('Edit'));
 expect(mockClick).not.toHaveBeenCalled();
 });
});
