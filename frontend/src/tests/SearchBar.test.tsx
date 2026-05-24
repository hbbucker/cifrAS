import { render, screen, fireEvent, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { SearchBar } from '../components/search/SearchBar';
import authClient from '../services/authService';
import '@testing-library/jest-dom/vitest';

vi.mock('../services/authService', () => ({
  default: {
    get: vi.fn(),
  }
}));

describe('SearchBar Component', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.clearAllMocks();
    vi.restoreAllMocks();
  });

  it('debounces input and calls search API', async () => {
    const mockData = { results: [{ id: '1', title: 'Test Song', artist: 'Test Artist', keySignature: 'C' }] };
    (authClient.get as unknown as { mockResolvedValue: (val: unknown) => void }).mockResolvedValue({ data: mockData });

    render(
      <MemoryRouter>
        <SearchBar />
      </MemoryRouter>
    );

    const input = screen.getByTestId('search-input');
    fireEvent.change(input, { target: { value: 'Test' } });

    // Instantly shouldn't call API
    expect(authClient.get).not.toHaveBeenCalled();

    // Fast-forward timers
    await act(async () => {
      vi.advanceTimersByTime(300);
    });

    // We might need an extra tick for promises to resolve
    await act(async () => {
      vi.runAllTimers();
    });

    expect(authClient.get).toHaveBeenCalledWith('/search?q=Test&limit=5');
    expect(screen.getByTestId('search-dropdown')).toBeInTheDocument();
    expect(screen.getByText('Test Song')).toBeInTheDocument();
  });

  it('redirects on Enter key', async () => {
    render(
      <MemoryRouter initialEntries={['/']}>
        <Routes>
          <Route path="/" element={<SearchBar />} />
          <Route path="/search" element={<div data-testid="search-page">Search Page</div>} />
        </Routes>
      </MemoryRouter>
    );

    const input = screen.getByTestId('search-input');
    fireEvent.change(input, { target: { value: 'Oasis' } });
    fireEvent.keyDown(input, { key: 'Enter', code: 'Enter' });

    expect(screen.getByTestId('search-page')).toBeInTheDocument();
  });
});
