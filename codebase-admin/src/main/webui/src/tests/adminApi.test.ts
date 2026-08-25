import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  adminClient,
  getDashboardMetrics,
  getRecentActivity,
  getAdminUsers,
  blockUser,
  unblockUser,
  getUserAuditLogs,
  getAdminSongs,
  softDeleteSong,
  restoreSong,
  permanentDeleteSong,
} from '../api/adminApi';

vi.mock('axios', () => {
  const mockAxiosInstance = {
    get: vi.fn(),
    post: vi.fn(),
    delete: vi.fn(),
    interceptors: {
      request: { use: vi.fn() },
      response: { use: vi.fn() },
    },
  };
  return {
    default: {
      create: vi.fn(() => mockAxiosInstance),
    },
  };
});

describe('adminApi client functions', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('getDashboardMetrics calls /dashboard/metrics', async () => {
    const mockData = { totalUsers: 10, totalSongs: 50 };
    vi.mocked(adminClient.get).mockResolvedValueOnce({ data: mockData });

    const result = await getDashboardMetrics();
    expect(adminClient.get).toHaveBeenCalledWith('/dashboard/metrics');
    expect(result).toEqual(mockData);
  });

  it('getRecentActivity calls /dashboard/recent-activity with limit', async () => {
    const mockData = [{ id: '1', title: 'Activity' }];
    vi.mocked(adminClient.get).mockResolvedValueOnce({ data: mockData });

    const result = await getRecentActivity(5);
    expect(adminClient.get).toHaveBeenCalledWith('/dashboard/recent-activity', { params: { limit: 5 } });
    expect(result).toEqual(mockData);
  });

  it('getAdminUsers calls /users with pagination and search', async () => {
    const mockData = { items: [], totalElements: 0, page: 0, pageSize: 20, totalPages: 0 };
    vi.mocked(adminClient.get).mockResolvedValueOnce({ data: mockData });

    const result = await getAdminUsers(1, 20, 'john');
    expect(adminClient.get).toHaveBeenCalledWith('/users', {
      params: { page: 1, pageSize: 20, search: 'john' },
    });
    expect(result).toEqual(mockData);
  });

  it('blockUser calls POST /users/:id/block with reason', async () => {
    const mockUser = { id: 'u1', email: 'test@cifras.com', status: 'BLOCKED', isBlocked: true };
    vi.mocked(adminClient.post).mockResolvedValueOnce({ data: mockUser });

    const result = await blockUser('u1', 'Spamming content');
    expect(adminClient.post).toHaveBeenCalledWith('/users/u1/block', { reason: 'Spamming content' });
    expect(result).toEqual(mockUser);
  });

  it('unblockUser calls POST /users/:id/unblock with reason', async () => {
    const mockUser = { id: 'u1', email: 'test@cifras.com', status: 'ACTIVE', isBlocked: false };
    vi.mocked(adminClient.post).mockResolvedValueOnce({ data: mockUser });

    const result = await unblockUser('u1', 'Support review');
    expect(adminClient.post).toHaveBeenCalledWith('/users/u1/unblock', { reason: 'Support review' });
    expect(result).toEqual(mockUser);
  });

  it('getUserAuditLogs calls GET /users/:id/audit-logs', async () => {
    const mockLogs = [{ id: 'log1', action: 'BLOCK', reason: 'Spam' }];
    vi.mocked(adminClient.get).mockResolvedValueOnce({ data: mockLogs });

    const result = await getUserAuditLogs('u1');
    expect(adminClient.get).toHaveBeenCalledWith('/users/u1/audit-logs');
    expect(result).toEqual(mockLogs);
  });

  it('getAdminSongs calls /songs with params', async () => {
    const mockData = { items: [], totalElements: 0, page: 0, pageSize: 20, totalPages: 0 };
    vi.mocked(adminClient.get).mockResolvedValueOnce({ data: mockData });

    const result = await getAdminSongs(0, 10, 'rock', true);
    expect(adminClient.get).toHaveBeenCalledWith('/songs', {
      params: { page: 0, pageSize: 10, search: 'rock', deletedOnly: true },
    });
    expect(result).toEqual(mockData);
  });

  it('softDeleteSong calls DELETE /songs/:id', async () => {
    const mockSong = { id: 's1', isDeleted: true };
    vi.mocked(adminClient.delete).mockResolvedValueOnce({ data: mockSong });

    const result = await softDeleteSong('s1');
    expect(adminClient.delete).toHaveBeenCalledWith('/songs/s1');
    expect(result).toEqual(mockSong);
  });

  it('restoreSong calls POST /songs/:id/restore', async () => {
    const mockSong = { id: 's1', isDeleted: false };
    vi.mocked(adminClient.post).mockResolvedValueOnce({ data: mockSong });

    const result = await restoreSong('s1');
    expect(adminClient.post).toHaveBeenCalledWith('/songs/s1/restore', {});
    expect(result).toEqual(mockSong);
  });

  it('permanentDeleteSong calls DELETE /songs/:id/permanent', async () => {
    vi.mocked(adminClient.delete).mockResolvedValueOnce({});

    await permanentDeleteSong('s1');
    expect(adminClient.delete).toHaveBeenCalledWith('/songs/s1/permanent');
  });
});
