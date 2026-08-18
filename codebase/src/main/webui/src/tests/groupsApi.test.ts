import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  getGroups,
  createGroup,
  getGroupMembers,
  inviteGroupMember,
  removeGroupMember,
  getGroupInvitations,
  cancelGroupInvitation,
  linkPlaylist,
  getGroupPlaylists,
  unlinkPlaylist
} from '../api/groups';
import { apiClient } from '../services/authService';

vi.mock('../services/authService', () => ({
  apiClient: {
    get: vi.fn(),
    post: vi.fn(),
    delete: vi.fn()
  }
}));

describe('Groups API Client', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('getGroups calls /groups and returns data', async () => {
    const mockGroups = [{ id: '1', name: 'Band 1', memberCount: 3, ownerId: 'user-1' }];
    vi.mocked(apiClient.get).mockResolvedValueOnce({ data: mockGroups });

    const result = await getGroups();
    expect(apiClient.get).toHaveBeenCalledWith('/groups');
    expect(result).toEqual(mockGroups);
  });

  it('createGroup calls POST /groups with name', async () => {
    const mockCreated = { id: '2', name: 'New Band', memberCount: 1, ownerId: 'user-1' };
    vi.mocked(apiClient.post).mockResolvedValueOnce({ data: mockCreated });

    const result = await createGroup('New Band');
    expect(apiClient.post).toHaveBeenCalledWith('/groups', { name: 'New Band' });
    expect(result).toEqual(mockCreated);
  });

  it('getGroupMembers calls /groups/:id/members', async () => {
    const mockMembers = [{ id: 'm1', groupId: 'g1', userId: 'u1', email: 'u1@test.com', name: 'User 1', role: 'OWNER', joinedAt: '2026-01-01' }];
    vi.mocked(apiClient.get).mockResolvedValueOnce({ data: mockMembers });

    const result = await getGroupMembers('g1');
    expect(apiClient.get).toHaveBeenCalledWith('/groups/g1/members');
    expect(result).toEqual(mockMembers);
  });

  it('inviteGroupMember calls POST /groups/:id/members with email', async () => {
    vi.mocked(apiClient.post).mockResolvedValueOnce({ data: {} });

    await inviteGroupMember('g1', 'test@example.com');
    expect(apiClient.post).toHaveBeenCalledWith('/groups/g1/members', { email: 'test@example.com' });
  });

  it('removeGroupMember calls DELETE /groups/:id/members/:targetUserId', async () => {
    vi.mocked(apiClient.delete).mockResolvedValueOnce({ data: {} });

    await removeGroupMember('g1', 'u2');
    expect(apiClient.delete).toHaveBeenCalledWith('/groups/g1/members/u2');
  });

  it('getGroupInvitations calls GET /groups/:id/invitations', async () => {
    const mockInvites = [{ id: 'inv-1', groupId: 'g1', inviterId: 'u1', inviteeEmail: 'inv@test.com', status: 'PENDING' }];
    vi.mocked(apiClient.get).mockResolvedValueOnce({ data: mockInvites });

    const result = await getGroupInvitations('g1');
    expect(apiClient.get).toHaveBeenCalledWith('/groups/g1/invitations');
    expect(result).toEqual(mockInvites);
  });

  it('cancelGroupInvitation calls DELETE /groups/:id/invitations/:invitationId', async () => {
    vi.mocked(apiClient.delete).mockResolvedValueOnce({ data: {} });

    await cancelGroupInvitation('g1', 'inv-1');
    expect(apiClient.delete).toHaveBeenCalledWith('/groups/g1/invitations/inv-1');
  });

  it('linkPlaylist calls POST /groups/:id/playlists', async () => {
    vi.mocked(apiClient.post).mockResolvedValueOnce({ data: {} });

    await linkPlaylist('g1', 'p1');
    expect(apiClient.post).toHaveBeenCalledWith('/groups/g1/playlists', { playlistId: 'p1' });
  });

  it('getGroupPlaylists calls GET /groups/:id/playlists', async () => {
    const mockPlaylists = [{ id: 'p1', name: 'Playlist 1' }];
    vi.mocked(apiClient.get).mockResolvedValueOnce({ data: mockPlaylists });

    const result = await getGroupPlaylists('g1');
    expect(apiClient.get).toHaveBeenCalledWith('/groups/g1/playlists');
    expect(result).toEqual(mockPlaylists);
  });

  it('unlinkPlaylist calls DELETE /groups/:id/playlists/:playlistId', async () => {
    vi.mocked(apiClient.delete).mockResolvedValueOnce({ data: {} });

    await unlinkPlaylist('g1', 'p1');
    expect(apiClient.delete).toHaveBeenCalledWith('/groups/g1/playlists/p1');
  });
});
