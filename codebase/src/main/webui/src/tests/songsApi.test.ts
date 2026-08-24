import { describe, it, expect, vi, beforeEach } from 'vitest';
import { getSongs, getUserTags } from '../api/songs';
import { apiClient } from '../services/authService';

vi.mock('../services/authService', () => ({
  apiClient: {
    get: vi.fn(),
    post: vi.fn(),
  },
}));

describe('songs API client', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('getSongs sends query and tag parameters', async () => {
    const mockResponse = { data: { items: [], totalCount: 0 } };
    vi.mocked(apiClient.get).mockResolvedValueOnce(mockResponse);

    await getSongs(1, 20, 'rock', ['gospel', 'worship']);

    expect(apiClient.get).toHaveBeenCalledWith('/songs', {
      params: { page: 1, size: 20, q: 'rock', tags: 'gospel,worship' },
    });
  });

  it('getSongs handles single string tag and string JSON response', async () => {
    const mockResponse = { data: JSON.stringify({ items: [], totalCount: 0 }) };
    vi.mocked(apiClient.get).mockResolvedValueOnce(mockResponse);

    const result = await getSongs(2, 10, 'jazz', 'acoustic');

    expect(apiClient.get).toHaveBeenCalledWith('/songs', {
      params: { page: 2, size: 10, q: 'jazz', tags: 'acoustic' },
    });
    expect(result).toEqual({ items: [], totalCount: 0 });
  });

  it('getUserTags fetches tags list from /songs/tags', async () => {
    const mockTags = [{ name: 'Rock', count: 5 }];
    vi.mocked(apiClient.get).mockResolvedValueOnce({ data: mockTags });

    const result = await getUserTags();

    expect(apiClient.get).toHaveBeenCalledWith('/songs/tags');
    expect(result).toEqual(mockTags);
  });
});
