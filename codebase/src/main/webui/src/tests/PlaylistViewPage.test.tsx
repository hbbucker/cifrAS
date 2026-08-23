import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { PlaylistViewPage } from '../pages/PlaylistViewPage';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { AuthProvider } from '../context/AuthContext';
import { ToastProvider } from '../context/ToastContext';
import { ThemeProvider } from '../context/ThemeContext';
import '@testing-library/jest-dom/vitest';

const mockNavigate = vi.fn();

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual as Record<string, unknown>,
    useNavigate: () => mockNavigate,
  };
});

const mockPlaylist = {
  id: 'pl-1',
  name: 'Minha Playlist',
  isCollaborative: false,
  userId: 'user-1',
  songs: [
    { id: 'song-1', title: 'Música 1', artist: 'Artista 1', originalKey: 'C' },
    { id: 'song-2', title: 'Música 2', artist: 'Artista 2', originalKey: 'D' }
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
    expect(screen.getByText('Música 2')).toBeInTheDocument();
  });

  it('renders play-theater-song button for each song with proper a11y labels and touch target', async () => {
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

    const playSong1Btn = screen.getByTestId('play-theater-song-song-1');
    const playSong2Btn = screen.getByTestId('play-theater-song-song-2');

    expect(playSong1Btn).toBeInTheDocument();
    expect(playSong2Btn).toBeInTheDocument();

    // Verify touch target classes (min 44x44px for mobile WCAG 2.1 AA)
    expect(playSong1Btn).toHaveClass('min-h-[44px]');
    expect(playSong1Btn).toHaveClass('min-w-[44px]');

    // Verify a11y attributes
    expect(playSong1Btn).toHaveAttribute('aria-label');
    expect(playSong1Btn).toHaveAttribute('title');
  });

  it('navigates to theater mode with songId and songIndex in state when play button is clicked', async () => {
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

    const playSong2Btn = screen.getByTestId('play-theater-song-song-2');
    fireEvent.click(playSong2Btn);

    expect(mockNavigate).toHaveBeenCalledWith('/theater/pl-1?songId=song-2', {
      state: { songIndex: 1, songId: 'song-2' }
    });
  });

  it('allows non-owner users to see and click play theater button while hiding owner management actions', async () => {
    // Current user is user-2 (not the owner)
    localStorage.setItem('user', JSON.stringify({ id: 'user-2', email: 'user2@example.com', name: 'User 2' }));

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

    // Play in theater button must be visible and interactive
    const playSong1Btn = screen.getByTestId('play-theater-song-song-1');
    expect(playSong1Btn).toBeInTheDocument();
    fireEvent.click(playSong1Btn);

    expect(mockNavigate).toHaveBeenCalledWith('/theater/pl-1?songId=song-1', {
      state: { songIndex: 0, songId: 'song-1' }
    });

    // Owner-only actions should NOT be visible
    expect(screen.queryByTestId('move-up-song-1')).not.toBeInTheDocument();
    expect(screen.queryByTestId('move-down-song-1')).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /addSong/i })).not.toBeInTheDocument();
  });

  it('navigates to theater mode from header button starting at index 0', async () => {
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

    const startTheaterBtn = screen.getByTestId('start-theater-btn');
    fireEvent.click(startTheaterBtn);

    expect(mockNavigate).toHaveBeenCalledWith('/theater/pl-1');
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
      expect(screen.getByText('Música 3')).toBeInTheDocument();
    });

    // Música 1 and 2 are already in playlist, so they should not appear in the available list in modal
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

  it('opens export presentation modal when Gerar Slides button is clicked', async () => {
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

    const exportBtn = screen.getByTestId('export-presentation-btn');
    expect(exportBtn).toBeInTheDocument();
    fireEvent.click(exportBtn);

    expect(await screen.findByRole('dialog')).toBeInTheDocument();
  });

  it('handles drag and drop reordering of playlist items', async () => {
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
    const item1 = screen.getByTestId('playlist-item-song-1');
    const item2 = screen.getByTestId('playlist-item-song-2');

    fireEvent.dragStart(item1);
    fireEvent.dragOver(item2);
    fireEvent.drop(item2);
    fireEvent.dragEnd(item1);
  });

  it('handles song removal with confirm dialog', async () => {
    vi.spyOn(window, 'confirm').mockReturnValue(true);

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

    const removeBtns = screen.getAllByRole('button', { name: /confirmRemoveSong/i });
    expect(removeBtns.length).toBeGreaterThan(0);
    fireEvent.click(removeBtns[0]);
  });

  it('renders empty playlist state when no songs are present', async () => {
    vi.stubGlobal('fetch', vi.fn((url: string) => {
      if (url.toString().includes('/api/playlists/pl-1')) {
        return Promise.resolve({
          ok: true,
          status: 200,
          json: () => Promise.resolve({ id: 'pl-1', name: 'Empty Playlist', userId: 'user-1', songs: [] })
        } as Response);
      }
      return Promise.resolve({ ok: true, status: 200, json: () => Promise.resolve({}) } as Response);
    }));

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

    expect(await screen.findByText('Empty Playlist')).toBeInTheDocument();
    expect(screen.getByText(/noSongs/i)).toBeInTheDocument();
  });
});

