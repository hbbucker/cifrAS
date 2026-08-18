import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { SharedWithMePage } from '../pages/SharedWithMePage';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from '../context/AuthContext';
import { ToastProvider } from '../context/ToastContext';
import * as songSharesApi from '../api/songShares';
import '@testing-library/jest-dom/vitest';

vi.mock('../api/songShares', () => ({
  getPendingSongShares: vi.fn(),
  acceptSongShare: vi.fn(),
  declineSongShare: vi.fn(),
}));

vi.mock('../api/groups', () => ({
  getGroupPlaylists: vi.fn().mockResolvedValue([]),
}));

describe('SharedWithMePage Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      ok: true,
      json: async () => [],
    } as unknown as Response));
  });

  const renderPage = () => {
    return render(
      <AuthProvider>
        <ToastProvider>
          <BrowserRouter>
            <SharedWithMePage />
          </BrowserRouter>
        </ToastProvider>
      </AuthProvider>
    );
  };

  it('renders empty state when no pending shares and no playlists', async () => {
    vi.mocked(songSharesApi.getPendingSongShares).mockResolvedValueOnce([]);

    renderPage();

    expect(await screen.findByText('songSharing.noPendingSongs')).toBeInTheDocument();
    expect(screen.getByText('sharedWithMe.noPlaylists')).toBeInTheDocument();
  });

  it('renders received songs list with pending shares', async () => {
    vi.mocked(songSharesApi.getPendingSongShares).mockResolvedValueOnce([
      {
        shareId: 'share-1',
        songId: 'song-1',
        songTitle: 'Música Compartilhada 1',
        songArtist: 'Artista Top',
        originalKey: 'G',
        inviterId: 'user-sender',
        inviteeEmail: 'receiver@test.com',
        createdAt: new Date().toISOString(),
      },
    ]);

    renderPage();

    expect(await screen.findByText('Música Compartilhada 1')).toBeInTheDocument();
    expect(screen.getByText('Artista Top')).toBeInTheDocument();
    expect(screen.getByText('G')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /songSharing.accept/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /songSharing.decline/i })).toBeInTheDocument();
  });

  it('accepts pending song share when accept button is clicked', async () => {
    vi.mocked(songSharesApi.getPendingSongShares).mockResolvedValueOnce([
      {
        shareId: 'share-1',
        songId: 'song-1',
        songTitle: 'Música para Aceitar',
        songArtist: 'Artista Top',
        originalKey: 'A',
        inviterId: 'user-sender',
        inviteeEmail: 'receiver@test.com',
        createdAt: new Date().toISOString(),
      },
    ]);
    vi.mocked(songSharesApi.acceptSongShare).mockResolvedValueOnce({
      id: 'new-song-id',
      title: 'Música para Aceitar',
      artist: 'Artista Top',
      originalKey: 'A',
      lyrics: {},
      isFavorite: false,
      createdAt: new Date().toISOString(),
    });

    renderPage();

    const acceptBtn = await screen.findByRole('button', { name: /songSharing.accept/i });
    fireEvent.click(acceptBtn);

    await waitFor(() => {
      expect(songSharesApi.acceptSongShare).toHaveBeenCalledWith('share-1');
      expect(screen.queryByText('Música para Aceitar')).not.toBeInTheDocument();
    });
  });

  it('shows error toast when accept fails', async () => {
    vi.mocked(songSharesApi.getPendingSongShares).mockResolvedValueOnce([
      {
        shareId: 'share-1',
        songId: 'song-1',
        songTitle: 'Música Falha Aceite',
        songArtist: 'Artista Top',
        originalKey: 'A',
        inviterId: 'user-sender',
        inviteeEmail: 'receiver@test.com',
        createdAt: new Date().toISOString(),
      },
    ]);
    vi.mocked(songSharesApi.acceptSongShare).mockRejectedValueOnce(new Error('Accept failed'));

    renderPage();

    const acceptBtn = await screen.findByRole('button', { name: /songSharing.accept/i });
    fireEvent.click(acceptBtn);

    await waitFor(() => {
      expect(songSharesApi.acceptSongShare).toHaveBeenCalledWith('share-1');
      expect(screen.getByText('Música Falha Aceite')).toBeInTheDocument();
    });
  });

  it('declines pending song share when decline button is clicked', async () => {
    vi.mocked(songSharesApi.getPendingSongShares).mockResolvedValueOnce([
      {
        shareId: 'share-1',
        songId: 'song-1',
        songTitle: 'Música para Recusar',
        songArtist: 'Artista Top',
        originalKey: 'B',
        inviterId: 'user-sender',
        inviteeEmail: 'receiver@test.com',
        createdAt: new Date().toISOString(),
      },
    ]);
    vi.mocked(songSharesApi.declineSongShare).mockResolvedValueOnce();

    renderPage();

    const declineBtn = await screen.findByRole('button', { name: /songSharing.decline/i });
    fireEvent.click(declineBtn);

    await waitFor(() => {
      expect(songSharesApi.declineSongShare).toHaveBeenCalledWith('share-1');
      expect(screen.queryByText('Música para Recusar')).not.toBeInTheDocument();
    });
  });

  it('shows error toast when decline fails', async () => {
    vi.mocked(songSharesApi.getPendingSongShares).mockResolvedValueOnce([
      {
        shareId: 'share-1',
        songId: 'song-1',
        songTitle: 'Música Falha Recusa',
        songArtist: 'Artista Top',
        originalKey: 'B',
        inviterId: 'user-sender',
        inviteeEmail: 'receiver@test.com',
        createdAt: new Date().toISOString(),
      },
    ]);
    vi.mocked(songSharesApi.declineSongShare).mockRejectedValueOnce(new Error('Decline failed'));

    renderPage();

    const declineBtn = await screen.findByRole('button', { name: /songSharing.decline/i });
    fireEvent.click(declineBtn);

    await waitFor(() => {
      expect(songSharesApi.declineSongShare).toHaveBeenCalledWith('share-1');
      expect(screen.getByText('Música Falha Recusa')).toBeInTheDocument();
    });
  });

  it('renders shared group playlists with correct songCount and navigation', async () => {
    vi.mocked(songSharesApi.getPendingSongShares).mockResolvedValueOnce([]);
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      ok: true,
      json: async () => [{ id: 'group-1', name: 'Banda Louvor' }],
    } as unknown as Response));

    const groupsApi = await import('../api/groups');
    vi.mocked(groupsApi.getGroupPlaylists).mockResolvedValueOnce([
      {
        id: 'pl-1',
        name: 'Playlist Culto Domingo',
        songCount: 12,
        userId: 'other-user',
      },
    ]);

    renderPage();

    expect(await screen.findByText('Playlist Culto Domingo')).toBeInTheDocument();
    expect(screen.getByText(/12.*playlists\.songsCount/)).toBeInTheDocument();
    expect(screen.getByText(/sharedWithMe\.from.*Banda Louvor/)).toBeInTheDocument();
  });
});
