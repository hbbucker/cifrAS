import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { SkeletonCard } from '../components/ui/SkeletonCard';
import '@testing-library/jest-dom/vitest';

describe('SkeletonCard Component', () => {
  it('renders default single skeleton card', () => {
    render(<SkeletonCard />);
    
    const cards = screen.getAllByTestId('skeleton-card');
    expect(cards).toHaveLength(1);
    
    // Check pulse animation is applied
    expect(cards[0].className).toContain('animate-pulse');
  });

  it('renders specified count of skeleton cards in a responsive grid', () => {
    render(<SkeletonCard count={6} />);
    
    const grid = screen.getByTestId('skeleton-grid');
    expect(grid.className).toContain('grid-cols-1');
    expect(grid.className).toContain('sm:grid-cols-2');
    expect(grid.className).toContain('lg:grid-cols-3');
    
    const cards = screen.getAllByTestId('skeleton-card');
    expect(cards).toHaveLength(6);
  });
});
