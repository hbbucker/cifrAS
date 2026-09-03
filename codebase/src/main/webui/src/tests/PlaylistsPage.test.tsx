import { render, screen, waitFor, fireEvent, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { PlaylistsPage } from '../pages/PlaylistsPage';
import { MemoryRouter } from 'react-router-dom';
import { AuthProvider } from '../context/AuthContext';
import { ToastProvider } from '../context/ToastContext';
import { ThemeProvider } from '../context/ThemeContext';
import { TourProvider } from '../context/TourContext';
import '@testing-library/jest-dom/vitest';

const mockPlaylists = [
  { id: '1', name: 'Playlist 1', songCount: 5, isCollaborative: false }
];

describe('PlaylistsPage Component', () => {
  beforeEach(() => {
    localStorage.setItem('token', 'fake-jwt');
    vi.stubGlobal('fetch', vi.fn(() =>
      Promise.resolve({
        ok: true,
        status: 200,
        json: () => Promise.resolve(mockPlaylists),
      } as Response)
    ));
  });

  afterEach(() => {
    vi.clearAllMocks();
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
    localStorage.clear();
  });

  it('renders header with BrandLogo anchor and playlists list', async () => {
    render(
      <AuthProvider>
        <ThemeProvider>
          <ToastProvider>
            <TourProvider>
              <MemoryRouter>
                <PlaylistsPage />
              </MemoryRouter>
            </TourProvider>
          </ToastProvider>
        </ThemeProvider>
      </AuthProvider>
    );

    expect(screen.getByRole('banner')).toBeInTheDocument();
    expect(screen.getByTestId('brand-icon')).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getByText('Playlist 1')).toBeInTheDocument();
    });
  });

  it('renders educational empty state when playlists list is empty and opens create modal', async () => {
    vi.stubGlobal('fetch', vi.fn(() =>
      Promise.resolve({
        ok: true,
        status: 200,
        json: () => Promise.resolve([]),
      } as Response)
    ));

    render(
      <AuthProvider>
        <ThemeProvider>
          <ToastProvider>
            <TourProvider>
              <MemoryRouter>
                <PlaylistsPage />
              </MemoryRouter>
            </TourProvider>
          </ToastProvider>
        </ThemeProvider>
      </AuthProvider>
    );

    await waitFor(() => {
      expect(screen.getByText(/Organize seu repertório em Playlists|educationalEmptyTitle/i)).toBeInTheDocument();
    });

    const createBtns = screen.getAllByRole('button', { name: /Criar Playlist|createPlaylist/i });
    expect(createBtns.length).toBeGreaterThan(0);
    fireEvent.click(createBtns[0]);

    expect(screen.getByTestId('playlist-name-input')).toBeInTheDocument();
  });

  it('triggers playlist-create coach mark after delay on initial visit', async () => {
    vi.useFakeTimers({ toFake: ['setTimeout', 'clearTimeout'] });

    render(
      <AuthProvider>
        <ThemeProvider>
          <ToastProvider>
            <TourProvider>
              <MemoryRouter>
                <PlaylistsPage />
              </MemoryRouter>
            </TourProvider>
          </ToastProvider>
        </ThemeProvider>
      </AuthProvider>
    );

    act(() => {
      vi.advanceTimersByTime(1000);
    });

    expect(screen.getByText(/Crie sua primeira Playlist|tourTitle/i)).toBeInTheDocument();

    const gotItBtn = screen.getByRole('button', { name: /Entendi|gotIt/i });
    act(() => {
      fireEvent.click(gotItBtn);
    });

    expect(screen.queryByText(/Crie sua primeira Playlist|tourTitle/i)).not.toBeInTheDocument();
    expect(localStorage.getItem('tour_seen_playlist-create')).toBe('true');

    vi.useRealTimers();
  });
});
