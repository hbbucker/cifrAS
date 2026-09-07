import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { SongViewPage } from '../pages/SongViewPage';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from '../context/AuthContext';
import { ToastProvider } from '../context/ToastContext';
import { ThemeProvider } from '../context/ThemeContext';
import '@testing-library/jest-dom/vitest';

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual as Record<string, unknown>,
    useParams: () => ({ id: '1' }),
  };
});

describe('SongViewPage Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
    global.fetch = vi.fn().mockImplementation((url: string) => {
      if (url.includes('/api/songs/1')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({
            id: '1',
            title: 'Wonderwall',
            artist: 'Oasis',
            originalKey: 'Em',
            lyrics: { sections: [{ label: 'Verso', lines: [{ chords: [], text: 'Today is gonna be the day' }] }] }
          })
        });
      }
      if (url.includes('/api/theater/song-preferences/1')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ autoScrollSpeed: 1, transposeSteps: 0 })
        });
      }
      return Promise.resolve({ ok: true, json: () => Promise.resolve({}) });
    }) as unknown as typeof fetch;
  });

  it('loads correct mock song title based on id', async () => {
    render(
      <AuthProvider>
        <ThemeProvider>
          <ToastProvider>
            <BrowserRouter>
              <SongViewPage />
            </BrowserRouter>
          </ToastProvider>
        </ThemeProvider>
      </AuthProvider>
    );
  
    expect(await screen.findByText('Wonderwall')).toBeInTheDocument();
  });

  it('allows toggling columns and full-width mode with persistence in localStorage', async () => {
    render(
      <AuthProvider>
        <ThemeProvider>
          <ToastProvider>
            <BrowserRouter>
              <SongViewPage />
            </BrowserRouter>
          </ToastProvider>
        </ThemeProvider>
      </AuthProvider>
    );

    expect(await screen.findByText('Wonderwall')).toBeInTheDocument();

    const toggleColsBtn = screen.getByTestId('toggle-columns-btn');
    const toggleFullWidthBtn = screen.getByTestId('toggle-fullwidth-btn');

    // Toggle columns to 2
    fireEvent.click(toggleColsBtn);
    expect(localStorage.getItem('cifras_songview_columns')).toBe('2');

    // Toggle full-width to true
    fireEvent.click(toggleFullWidthBtn);
    expect(localStorage.getItem('cifras_songview_fullwidth')).toBe('true');

    // Toggle back
    fireEvent.click(toggleColsBtn);
    expect(localStorage.getItem('cifras_songview_columns')).toBe('1');

    fireEvent.click(toggleFullWidthBtn);
    expect(localStorage.getItem('cifras_songview_fullwidth')).toBe('false');
  });
});

