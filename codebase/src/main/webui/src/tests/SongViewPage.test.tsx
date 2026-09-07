import { render, screen } from '@testing-library/react';
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
    globalThis.fetch = vi.fn().mockImplementation((url: string) => {
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
});


