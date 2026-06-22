import { apiClient } from '../services/authService';

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
