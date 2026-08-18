import { apiClient } from '../services/authService';
import type { GroupData, GroupMember, GroupInvitation } from '../types/groups';

export const getGroups = async (): Promise<GroupData[]> => {
  const res = await apiClient.get<GroupData[]>('/groups');
  return res.data;
};

export const createGroup = async (name: string): Promise<GroupData> => {
  const res = await apiClient.post<GroupData>('/groups', { name });
  return res.data;
};

export const getGroupMembers = async (groupId: string): Promise<GroupMember[]> => {
  const res = await apiClient.get<GroupMember[]>(`/groups/${groupId}/members`);
  return res.data;
};

export const inviteGroupMember = async (groupId: string, email: string): Promise<void> => {
  await apiClient.post(`/groups/${groupId}/members`, { email });
};

export const removeGroupMember = async (groupId: string, targetUserId: string): Promise<void> => {
  await apiClient.delete(`/groups/${groupId}/members/${targetUserId}`);
};

export const getGroupInvitations = async (groupId: string): Promise<GroupInvitation[]> => {
  const res = await apiClient.get<GroupInvitation[]>(`/groups/${groupId}/invitations`);
  return res.data;
};

export const cancelGroupInvitation = async (groupId: string, invitationId: string): Promise<void> => {
  await apiClient.delete(`/groups/${groupId}/invitations/${invitationId}`);
};

export const linkPlaylist = async (groupId: string, playlistId: string): Promise<void> => {
  await apiClient.post(`/groups/${groupId}/playlists`, { playlistId });
};

export const getGroupPlaylists = async (groupId: string): Promise<Record<string, unknown>[]> => {
  const res = await apiClient.get<Record<string, unknown>[]>(`/groups/${groupId}/playlists`);
  return res.data;
};

export const unlinkPlaylist = async (groupId: string, playlistId: string): Promise<void> => {
  await apiClient.delete(`/groups/${groupId}/playlists/${playlistId}`);
};
