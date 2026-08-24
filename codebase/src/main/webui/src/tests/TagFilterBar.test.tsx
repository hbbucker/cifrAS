import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { TagFilterBar } from '../components/ui/TagFilterBar';
import '@testing-library/jest-dom/vitest';

describe('TagFilterBar Component', () => {
  const mockTags = [
    { name: 'Rock', count: 10 },
    { name: 'Pop', count: 5 },
  ];

  it('renders null when tags array is empty', () => {
    const onSelectTag = vi.fn();
    const { container } = render(
      <TagFilterBar tags={[]} selectedTag={null} onSelectTag={onSelectTag} />
    );
    expect(container.firstChild).toBeNull();
  });

  it('renders all tags and counts correctly', () => {
    const onSelectTag = vi.fn();
    render(
      <TagFilterBar tags={mockTags} selectedTag={null} onSelectTag={onSelectTag} totalCount={15} />
    );

    expect(screen.getByTestId('tag-chip-all')).toBeInTheDocument();
    expect(screen.getByText('Rock')).toBeInTheDocument();
    expect(screen.getByText('10')).toBeInTheDocument();
    expect(screen.getByText('Pop')).toBeInTheDocument();
    expect(screen.getByText('5')).toBeInTheDocument();
  });

  it('calls onSelectTag with tag name when clicking a tag', () => {
    const onSelectTag = vi.fn();
    render(
      <TagFilterBar tags={mockTags} selectedTag={null} onSelectTag={onSelectTag} />
    );

    fireEvent.click(screen.getByTestId('tag-filter-chip-Rock'));
    expect(onSelectTag).toHaveBeenCalledWith('Rock');
  });

  it('deselects tag when clicking the already selected tag', () => {
    const onSelectTag = vi.fn();
    render(
      <TagFilterBar tags={mockTags} selectedTag="Rock" onSelectTag={onSelectTag} />
    );

    fireEvent.click(screen.getByTestId('tag-filter-chip-Rock'));
    expect(onSelectTag).toHaveBeenCalledWith(null);
  });

  it('calls onSelectTag with null when clicking Todas', () => {
    const onSelectTag = vi.fn();
    render(
      <TagFilterBar tags={mockTags} selectedTag="Pop" onSelectTag={onSelectTag} />
    );

    fireEvent.click(screen.getByTestId('tag-chip-all'));
    expect(onSelectTag).toHaveBeenCalledWith(null);
  });
});
