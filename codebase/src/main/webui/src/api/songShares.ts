import { apiClient } from '../services/authService';

export interface SongShareResponse {
  id: string;
  songId: string;
  inviterId: string;
  inviteeEmail: string;
  status: 'PENDING' | 'ACCEPTED' | 'DECLINED';
  createdAt: string;
}

export interface PendingSongShareItem {
  shareId: string;
  songId: string;
  songTitle: string;
  songArtist: string;
  originalKey?: string;
  inviterId: string;
  inviteeEmail: string;
  createdAt: string;
}

export interface ClonedSongResponse {
  id: string;
  title: string;
  artist: string;
  originalKey: string;
  lyrics: unknown;
  isFavorite: boolean;
  createdAt: string;
  updatedAt?: string;
}

export const shareSong = async (songId: string, email: string): Promise<SongShareResponse> => {
  const response = await apiClient.post(`/songs/${songId}/share`, { email });
  return response.data;
};

export const getPendingSongShares = async (): Promise<PendingSongShareItem[]> => {
  const response = await apiClient.get('/songs/shares/pending');
  return response.data;
};

export const acceptSongShare = async (shareId: string): Promise<ClonedSongResponse> => {
  const response = await apiClient.post(`/songs/shares/${shareId}/accept`);
  return response.data;
};

export const declineSongShare = async (shareId: string): Promise<void> => {
  await apiClient.post(`/songs/shares/${shareId}/decline`);
};
