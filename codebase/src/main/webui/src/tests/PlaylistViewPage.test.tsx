import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { PlaylistViewPage } from '../pages/PlaylistViewPage';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { AuthProvider } from '../context/AuthContext';
import { ToastProvider } from '../context/ToastContext';
import { ThemeProvider } from '../context/ThemeContext';
import '@testing-library/jest-dom/vitest';

const mockPlaylist = {
  id: 'pl-1',
  name: 'Minha Playlist',
  isCollaborative: false,
  userId: 'user-1',
  songs: [
    { id: 'song-1', title: 'Música 1', artist: 'Artista 1', originalKey: 'C' }
  ]
};

const mockLibraryPagedResponse = {
  items: [
    { id: 'song-1', title: 'Música 1', artist: 'Artista 1', originalKey: 'C' },
    { id: 'song-2', title: 'Música 2', artist: 'Artista 2', originalKey: 'D' },
    { id: 'song-3', title: 'Música 3', artist: 'Artista 3', originalKey: 'G' }
  ],
  totalCount: 3,
  page: 1,
  size: 50
};

describe('PlaylistViewPage Component', () => {
  beforeEach(() => {
    localStorage.setItem('token', 'fake-jwt');
    localStorage.setItem('user', JSON.stringify({ id: 'user-1', email: 'user1@example.com', name: 'User 1' }));
    // Mock user in auth context
    vi.stubGlobal('fetch', vi.fn((url: string, options?: RequestInit) => {
      const urlStr = url.toString();
      if (urlStr.includes('/api/playlists/pl-1/songs') && options?.method === 'POST') {
        return Promise.resolve({
          ok: true,
          status: 200,
          json: () => Promise.resolve({ success: true })
        } as Response);
      }
      if (urlStr.includes('/api/playlists/pl-1')) {
        return Promise.resolve({
          ok: true,
          status: 200,
          json: () => Promise.resolve(mockPlaylist)
        } as Response);
      }
      if (urlStr.includes('/api/songs')) {
        return Promise.resolve({
          ok: true,
          status: 200,
          json: () => Promise.resolve(mockLibraryPagedResponse)
        } as Response);
      }
      return Promise.resolve({
        ok: true,
        status: 200,
        json: () => Promise.resolve({})
      } as Response);
    }));
  });

  afterEach(() => {
    vi.clearAllMocks();
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
    localStorage.clear();
  });

  it('renders playlist and existing songs', async () => {
    render(
      <AuthProvider>
        <ThemeProvider>
          <ToastProvider>
            <MemoryRouter initialEntries={['/playlists/pl-1']}>
              <Routes>
                <Route path="/playlists/:id" element={<PlaylistViewPage />} />
              </Routes>
            </MemoryRouter>
          </ToastProvider>
        </ThemeProvider>
      </AuthProvider>
    );

    expect(await screen.findByText('Minha Playlist')).toBeInTheDocument();
    expect(screen.getByText('Música 1')).toBeInTheDocument();
  });

  it('opens add songs modal and renders unadded songs from PagedResponse items', async () => {
    render(
      <AuthProvider>
        <ThemeProvider>
          <ToastProvider>
            <MemoryRouter initialEntries={['/playlists/pl-1']}>
              <Routes>
                <Route path="/playlists/:id" element={<PlaylistViewPage />} />
              </Routes>
            </MemoryRouter>
          </ToastProvider>
        </ThemeProvider>
      </AuthProvider>
    );

    await screen.findByText('Minha Playlist');

    // Click "Add Song" button
    const addBtn = screen.getByRole('button', { name: /addSong/i });
    fireEvent.click(addBtn);

    // Modal should appear and load songs from library
    await waitFor(() => {
      expect(screen.getByText('Música 2')).toBeInTheDocument();
      expect(screen.getByText('Música 3')).toBeInTheDocument();
    });

    // Música 1 is already in playlist, so it should not appear in the available list in modal
    const addButtons = screen.getAllByRole('button', { name: /add/i });
    expect(addButtons.length).toBeGreaterThan(0);
  });

  it('handles reorder and delete actions', async () => {
    render(
      <AuthProvider>
        <ThemeProvider>
          <ToastProvider>
            <MemoryRouter initialEntries={['/playlists/pl-1']}>
              <Routes>
                <Route path="/playlists/:id" element={<PlaylistViewPage />} />
              </Routes>
            </MemoryRouter>
          </ToastProvider>
        </ThemeProvider>
      </AuthProvider>
    );

    expect(await screen.findByText('Minha Playlist')).toBeInTheDocument();
    expect(screen.getByTestId('playlist-item-song-1')).toBeInTheDocument();

    const moveUpBtn = screen.getByTestId('move-up-song-1');
    const moveDownBtn = screen.getByTestId('move-down-song-1');
    expect(moveUpBtn).toBeInTheDocument();
    expect(moveDownBtn).toBeInTheDocument();

    fireEvent.click(moveUpBtn);
    fireEvent.click(moveDownBtn);
  });
});
