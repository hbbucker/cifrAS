import { renderHook, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { usePendingSharesCount } from '../hooks/usePendingSharesCount';
import * as songSharesApi from '../api/songShares';
import * as authContext from '../context/AuthContext';

vi.mock('../api/songShares', () => ({
  getPendingSongShares: vi.fn(),
}));

vi.mock('../context/AuthContext', () => ({
  useAuth: vi.fn(),
}));

vi.mock('react-router-dom', () => ({
  useLocation: () => ({ pathname: '/dashboard' }),
}));

describe('usePendingSharesCount hook', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns 0 when user is not authenticated', () => {
    vi.mocked(authContext.useAuth).mockReturnValue({
      user: null,
      isAuthenticated: false,
      login: vi.fn(),
      logout: vi.fn(),
      loading: false,
    });

    const { result } = renderHook(() => usePendingSharesCount());
    expect(result.current).toBe(0);
  });

  it('fetches and returns pending shares count when user is authenticated', async () => {
    vi.mocked(authContext.useAuth).mockReturnValue({
      user: { id: 'user-1', email: 'test@example.com', name: 'User' },
      isAuthenticated: true,
      login: vi.fn(),
      logout: vi.fn(),
      loading: false,
    });

    vi.mocked(songSharesApi.getPendingSongShares).mockResolvedValueOnce([
      {
        shareId: '1',
        songId: 's1',
        songTitle: 'Song 1',
        songArtist: 'Artist 1',
        inviterId: 'u2',
        inviteeEmail: 'test@example.com',
        createdAt: new Date().toISOString(),
      },
      {
        shareId: '2',
        songId: 's2',
        songTitle: 'Song 2',
        songArtist: 'Artist 2',
        inviterId: 'u3',
        inviteeEmail: 'test@example.com',
        createdAt: new Date().toISOString(),
      },
    ]);

    const { result } = renderHook(() => usePendingSharesCount());

    await waitFor(() => {
      expect(result.current).toBe(2);
    });
  });

  it('handles API error gracefully and returns 0', async () => {
    vi.mocked(authContext.useAuth).mockReturnValue({
      user: { id: 'user-1', email: 'test@example.com', name: 'User' },
      isAuthenticated: true,
      login: vi.fn(),
      logout: vi.fn(),
      loading: false,
    });

    vi.mocked(songSharesApi.getPendingSongShares).mockRejectedValueOnce(new Error('Network error'));

    const { result } = renderHook(() => usePendingSharesCount());

    await waitFor(() => {
      expect(result.current).toBe(0);
    });
  });
});
