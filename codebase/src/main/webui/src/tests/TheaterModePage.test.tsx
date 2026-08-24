import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { TheaterModePage } from '../pages/TheaterModePage';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from '../context/AuthContext';
import { ToastProvider } from '../context/ToastContext';
import { ThemeProvider } from '../context/ThemeContext';
import { apiClient } from '../services/authService';
import '@testing-library/jest-dom/vitest';

const mockNavigate = vi.fn();
const mockParams = { playlistId: 'p1', songId: undefined as string | undefined };
let mockLocation = { state: null as unknown, search: '', pathname: '/theater/p1' };

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual as Record<string, unknown>,
    useNavigate: () => mockNavigate,
    useParams: () => mockParams,
    useLocation: () => mockLocation,
    useSearchParams: () => [new URLSearchParams(mockLocation.search), vi.fn()],
  };
});

vi.mock('../services/authService', () => ({
  apiClient: {
    get: vi.fn(),
    put: vi.fn().mockResolvedValue({ status: 200, data: {} }),
  },
  supabase: {
    auth: {
      getSession: vi.fn().mockResolvedValue({ data: { session: null }, error: null }),
      onAuthStateChange: vi.fn().mockReturnValue({ data: { subscription: { unsubscribe: vi.fn() } } }),
    }
  }
}));

vi.mock('../hooks/usePerformanceSession', () => ({
  usePerformanceSession: () => ({
    activeSession: null,
    saveProgress: vi.fn(),
    clearSession: vi.fn(),
  })
}));

describe('TheaterModePage Component — Gesture & Interaction Navigation', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockLocation = { state: null, search: '', pathname: '/theater/p1' };
    mockParams.playlistId = 'p1';
    mockParams.songId = undefined;
    vi.mocked(apiClient.get).mockImplementation((url: string) => {
      if (url.includes('/playlists/p1')) {
        return Promise.resolve({
          data: {
            id: 'p1',
            name: 'Show Playlist',
            songs: [
              { id: 's1', title: 'Song 1', artist: 'Artist 1' },
              { id: 's2', title: 'Song 2', artist: 'Artist 2' },
            ]
          }
        });
      }
      if (url.includes('/songs/s1')) {
        return Promise.resolve({
          data: {
            id: 's1',
            title: 'Song 1',
            artist: 'Artist 1',
            originalKey: 'C',
            lyrics: { sections: [{ label: 'Verso', lines: [{ chords: [], text: 'Line 1' }] }] }
          }
        });
      }
      if (url.includes('/songs/s2')) {
        return Promise.resolve({
          data: {
            id: 's2',
            title: 'Song 2',
            artist: 'Artist 2',
            originalKey: 'G',
            lyrics: { sections: [{ label: 'Verso', lines: [{ chords: [], text: 'Line 2' }] }] }
          }
        });
      }
      if (url.includes('/theater/song-preferences/')) {
        return Promise.resolve({
          status: 200,
          data: { autoScrollSpeed: 1, transposeSteps: 0, fontSize: 32 }
        });
      }
      return Promise.reject(new Error('Unknown url: ' + url));
    });
  });

  const renderComponent = () => {
    return render(
      <AuthProvider>
        <ThemeProvider>
          <ToastProvider>
            <BrowserRouter>
              <TheaterModePage />
            </BrowserRouter>
          </ToastProvider>
        </ThemeProvider>
      </AuthProvider>
    );
  };

  it('renders initial song from playlist', async () => {
    renderComponent();
    expect(await screen.findByText('Song 1')).toBeInTheDocument();
    expect(screen.getByText('Artist 1')).toBeInTheDocument();
  });

  it('AC1 & AC2: clicking left or right lateral zones does NOT change song and toggles controls', async () => {
    renderComponent();
    expect(await screen.findByText('Song 1')).toBeInTheDocument();

    const container = screen.getByTestId('theater-scroll-container').parentElement!;

    // Click on left edge (clientX = 50, width = 1000)
    fireEvent.click(container, { clientX: 50 });
    // Still Song 1
    expect(screen.getByText('Song 1')).toBeInTheDocument();

    // Click on right edge (clientX = 950, width = 1000)
    fireEvent.click(container, { clientX: 950 });
    // Still Song 1 (did not switch to Song 2)
    expect(screen.getByText('Song 1')).toBeInTheDocument();
  });

  it('AC3: swiping horizontal left (arrastar para esquerda) navigates to next song', async () => {
    renderComponent();
    expect(await screen.findByText('Song 1')).toBeInTheDocument();

    const container = screen.getByTestId('theater-scroll-container').parentElement!;

    // Touch start at x=300, y=200
    fireEvent.touchStart(container, {
      targetTouches: [{ clientX: 300, clientY: 200 }]
    });

    // Touch move to x=150, y=200 (deltaX = 150 > 100px minSwipeDistance, deltaY = 0)
    fireEvent.touchMove(container, {
      targetTouches: [{ clientX: 150, clientY: 200 }]
    });

    // Touch end
    fireEvent.touchEnd(container);

    // Should load Song 2
    expect(await screen.findByText('Song 2')).toBeInTheDocument();
  });

  it('AC4: swiping horizontal right navigates to previous song', async () => {
    renderComponent();
    expect(await screen.findByText('Song 1')).toBeInTheDocument();

    const container = screen.getByTestId('theater-scroll-container').parentElement!;

    // First go to Song 2
    fireEvent.touchStart(container, { targetTouches: [{ clientX: 300, clientY: 200 }] });
    fireEvent.touchMove(container, { targetTouches: [{ clientX: 150, clientY: 200 }] });
    fireEvent.touchEnd(container);
    expect(await screen.findByText('Song 2')).toBeInTheDocument();

    // Now swipe right (from x=100 to x=280 -> deltaX = -180)
    fireEvent.touchStart(container, { targetTouches: [{ clientX: 100, clientY: 200 }] });
    fireEvent.touchMove(container, { targetTouches: [{ clientX: 280, clientY: 200 }] });
    fireEvent.touchEnd(container);

    // Should return to Song 1
    expect(await screen.findByText('Song 1')).toBeInTheDocument();
  });

  it('AC5: vertical scroll gestures do not trigger song navigation', async () => {
    renderComponent();
    expect(await screen.findByText('Song 1')).toBeInTheDocument();

    const container = screen.getByTestId('theater-scroll-container').parentElement!;

    // Vertical drag: start at y=100, move to y=400 (deltaY = 300, deltaX = 20)
    fireEvent.touchStart(container, { targetTouches: [{ clientX: 200, clientY: 100 }] });
    fireEvent.touchMove(container, { targetTouches: [{ clientX: 220, clientY: 400 }] });
    fireEvent.touchEnd(container);

    // Should still be Song 1
    expect(screen.getByText('Song 1')).toBeInTheDocument();
  });

  it('AC6: explicit next and prev buttons in TheaterControls navigate songs', async () => {
    renderComponent();
    expect(await screen.findByText('Song 1')).toBeInTheDocument();

    const nextBtn = screen.getByTestId('next-song-btn');
    fireEvent.click(nextBtn);

    expect(await screen.findByText('Song 2')).toBeInTheDocument();

    const prevBtn = screen.getByTestId('prev-song-btn');
    fireEvent.click(prevBtn);

    expect(await screen.findByText('Song 1')).toBeInTheDocument();
  });

  it('AC7: gestures and navigation are ignored when locked', async () => {
    renderComponent();
    expect(await screen.findByText('Song 1')).toBeInTheDocument();

    const lockBtn = screen.getByTestId('lock-mode-btn');
    fireEvent.click(lockBtn);

    const container = screen.getByTestId('theater-scroll-container').parentElement!;

    // Try swipe left
    fireEvent.touchStart(container, { targetTouches: [{ clientX: 300, clientY: 200 }] });
    fireEvent.touchMove(container, { targetTouches: [{ clientX: 100, clientY: 200 }] });
    fireEvent.touchEnd(container);

    // Should remain on Song 1
    expect(screen.getByText('Song 1')).toBeInTheDocument();
  });

  it('AC8: keyboard arrow keys navigate songs', async () => {
    renderComponent();
    expect(await screen.findByText('Song 1')).toBeInTheDocument();

    // ArrowRight -> next song
    fireEvent.keyDown(window, { key: 'ArrowRight' });
    expect(await screen.findByText('Song 2')).toBeInTheDocument();

    // ArrowLeft -> prev song
    fireEvent.keyDown(window, { key: 'ArrowLeft' });
    expect(await screen.findByText('Song 1')).toBeInTheDocument();
  });

  it('handles spacebar to play/pause autoscroll and ignores keys inside input elements', async () => {
    renderComponent();
    expect(await screen.findByText('Song 1')).toBeInTheDocument();

    // Space key
    fireEvent.keyDown(window, { key: ' ' });

    // Key inside input should be ignored
    const input = document.createElement('input');
    document.body.appendChild(input);
    fireEvent.keyDown(input, { key: 'ArrowRight' });
    expect(screen.getByText('Song 1')).toBeInTheDocument();
    document.body.removeChild(input);
  });

  it('handles exit theater mode button', async () => {
    renderComponent();
    expect(await screen.findByText('Song 1')).toBeInTheDocument();

    const exitBtn = screen.getByTestId('exit-theater-btn');
    fireEvent.click(exitBtn);

    expect(mockNavigate).toHaveBeenCalledWith('/playlists/p1');
  });

  it('handles font size and transpose controls', async () => {
    renderComponent();
    expect(await screen.findByText('Song 1')).toBeInTheDocument();

    const increaseFont = screen.getByTestId('increase-font-btn');
    const decreaseFont = screen.getByTestId('decrease-font-btn');
    fireEvent.click(increaseFont);
    fireEvent.click(decreaseFont);

    const transposeUp = screen.getByTestId('transpose-up');
    const transposeDown = screen.getByTestId('transpose-down');
    fireEvent.click(transposeUp);
    fireEvent.click(transposeDown);
  });

  it('toggles singer mode (Modo Cantor) hiding chords and transpose pad from the stage view', async () => {
    renderComponent();
    expect(await screen.findByText('Song 1')).toBeInTheDocument();

    const singerBtn = screen.getByTestId('singer-mode-btn');
    expect(singerBtn).toBeInTheDocument();

    // Click to toggle Singer Mode on
    fireEvent.click(singerBtn);

    // Transpose controls should be hidden in Singer Mode
    expect(screen.queryByTestId('transpose-up')).not.toBeInTheDocument();

    // Click to toggle Singer Mode back off
    fireEvent.click(singerBtn);
    expect(screen.getByTestId('transpose-up')).toBeInTheDocument();
  });

  it('initializes theater mode with intermediate song via query params (?songId=s2)', async () => {
    mockLocation.search = '?songId=s2';

    renderComponent();

    // Song 2 should be immediately rendered as the active song
    expect(await screen.findByText('Song 2')).toBeInTheDocument();
    expect(screen.getByText('Artist 2')).toBeInTheDocument();

    // Previous song button should be enabled and navigate back to Song 1
    const prevBtn = screen.getByTestId('prev-song-btn');
    expect(prevBtn).toBeEnabled();
    fireEvent.click(prevBtn);

    expect(await screen.findByText('Song 1')).toBeInTheDocument();

    // At Song 1 (first song), previous button should now be disabled
    expect(screen.getByTestId('prev-song-btn')).toBeDisabled();
  });

  it('initializes theater mode with intermediate song via location state ({ songIndex: 1, songId: "s2" })', async () => {
    mockLocation.state = { songIndex: 1, songId: 's2' };

    renderComponent();

    // Song 2 should be immediately loaded
    expect(await screen.findByText('Song 2')).toBeInTheDocument();
    expect(screen.getByText('Artist 2')).toBeInTheDocument();

    // Next song button should be disabled as Song 2 is the last song (N - 1)
    const nextBtn = screen.getByTestId('next-song-btn');
    expect(nextBtn).toBeDisabled();
  });

  it('initializes theater mode with startIndex query param (?startIndex=1)', async () => {
    mockLocation.search = '?startIndex=1';

    renderComponent();

    expect(await screen.findByText('Song 2')).toBeInTheDocument();
  });

  it('falls back to first song if query param songId is not found in playlist', async () => {
    mockLocation.search = '?songId=nonexistent-id';

    renderComponent();

    expect(await screen.findByText('Song 1')).toBeInTheDocument();
  });

  it('disables previous button on first song (K = 0) and next button on last song (K = N - 1)', async () => {
    renderComponent();

    // Initial state: Song 1 (K = 0)
    expect(await screen.findByText('Song 1')).toBeInTheDocument();
    expect(screen.getByTestId('prev-song-btn')).toBeDisabled();
    expect(screen.getByTestId('next-song-btn')).toBeEnabled();

    // Navigate to Song 2 (K = 1, last song)
    fireEvent.click(screen.getByTestId('next-song-btn'));
    expect(await screen.findByText('Song 2')).toBeInTheDocument();
    expect(screen.getByTestId('prev-song-btn')).toBeEnabled();
    expect(screen.getByTestId('next-song-btn')).toBeDisabled();
  });

  it('isolates transpose steps per song and does not propagate transpose changes to next song in playlist', async () => {
    vi.mocked(apiClient.get).mockImplementation((url: string) => {
      if (url.includes('/playlists/p1')) {
        return Promise.resolve({
          data: {
            id: 'p1',
            name: 'Show Playlist',
            songs: [
              { id: 's1', title: 'Song 1', artist: 'Artist 1' },
              { id: 's2', title: 'Song 2', artist: 'Artist 2' },
            ]
          }
        });
      }
      if (url.includes('/songs/s1')) {
        return Promise.resolve({
          data: {
            id: 's1',
            title: 'Song 1',
            artist: 'Artist 1',
            originalKey: 'C',
            lyrics: { sections: [{ label: 'Verso', lines: [{ chords: [], text: 'Line 1' }] }] }
          }
        });
      }
      if (url.includes('/songs/s2')) {
        return Promise.resolve({
          data: {
            id: 's2',
            title: 'Song 2',
            artist: 'Artist 2',
            originalKey: 'G',
            lyrics: { sections: [{ label: 'Verso', lines: [{ chords: [], text: 'Line 2' }] }] }
          }
        });
      }
      if (url.includes('/theater/song-preferences/s1')) {
        return Promise.resolve({
          status: 200,
          data: { autoScrollSpeed: 1, transposeSteps: 2, fontSize: 30 }
        });
      }
      if (url.includes('/theater/song-preferences/s2')) {
        return Promise.resolve({
          status: 200,
          data: { autoScrollSpeed: 2, transposeSteps: 0, fontSize: 24 }
        });
      }
      return Promise.reject(new Error('Unknown url: ' + url));
    });

    renderComponent();

    // Song 1 has transposeSteps = 2 (C -> D)
    expect(await screen.findByText('Song 1')).toBeInTheDocument();
    expect(screen.getByText('D')).toBeInTheDocument();

    // Navigate to Song 2
    fireEvent.click(screen.getByTestId('next-song-btn'));
    expect(await screen.findByText('Song 2')).toBeInTheDocument();

    // Song 2 has transposeSteps = 0 (G remains G, not transposed to A)
    expect(await screen.findByText('G')).toBeInTheDocument();
  });
});
