import { describe, it, expect, vi, beforeEach } from 'vitest';
import { shareSong, getPendingSongShares, acceptSongShare, declineSongShare } from '../api/songShares';
import { apiClient } from '../services/authService';

vi.mock('../services/authService', () => ({
  apiClient: {
    post: vi.fn(),
    get: vi.fn(),
  },
}));

describe('songShares API client', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('shareSong posts to /songs/:id/share with email', async () => {
    const mockData = { id: 'share-1', status: 'PENDING' };
    vi.mocked(apiClient.post).mockResolvedValueOnce({ data: mockData });

    const result = await shareSong('song-1', 'test@example.com');

    expect(apiClient.post).toHaveBeenCalledWith('/songs/song-1/share', { email: 'test@example.com' });
    expect(result).toEqual(mockData);
  });

  it('getPendingSongShares gets from /songs/shares/pending', async () => {
    const mockData = [{ shareId: 'share-1', songTitle: 'Song A' }];
    vi.mocked(apiClient.get).mockResolvedValueOnce({ data: mockData });

    const result = await getPendingSongShares();

    expect(apiClient.get).toHaveBeenCalledWith('/songs/shares/pending');
    expect(result).toEqual(mockData);
  });

  it('acceptSongShare posts to /songs/shares/:id/accept', async () => {
    const mockData = { id: 'new-song-id', title: 'Song A' };
    vi.mocked(apiClient.post).mockResolvedValueOnce({ data: mockData });

    const result = await acceptSongShare('share-1');

    expect(apiClient.post).toHaveBeenCalledWith('/songs/shares/share-1/accept');
    expect(result).toEqual(mockData);
  });

  it('declineSongShare posts to /songs/shares/:id/decline', async () => {
    vi.mocked(apiClient.post).mockResolvedValueOnce({ data: null });

    await declineSongShare('share-1');

    expect(apiClient.post).toHaveBeenCalledWith('/songs/shares/share-1/decline');
  });
});
