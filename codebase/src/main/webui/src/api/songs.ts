import { apiClient } from '../services/authService';
import type { PaginatedResponse } from '../types/api';

export interface SongData {
  id: string;
  title: string;
  artist: string;
  originalKey?: string;
  keySignature: string;
  isFavorite: boolean;
  categories?: string[];
  tags?: string[];
  [key: string]: unknown;
}

export interface TagCount {
  name: string;
  count: number;
}

export const getSongs = async (
  page: number = 1,
  limit: number = 20,
  search?: string,
  tags?: string[] | string
): Promise<PaginatedResponse<SongData> | SongData[]> => {
  const params: Record<string, string | number> = { page, size: limit };
  if (search && search.trim().length >= 1) {
    params.q = search.trim();
  }
  if (tags) {
    if (Array.isArray(tags) && tags.length > 0) {
      params.tags = tags.join(',');
    } else if (typeof tags === 'string' && tags.trim().length > 0) {
      params.tags = tags.trim();
    }
  }

  const response = await apiClient.get('/songs', { params });
  let data = response.data;
  
  if (typeof data === 'string') {
    try {
      data = JSON.parse(data);
    } catch {
      // Ignore JSON parse errors, return as string
    }
  }

  return data;
};

export const getUserTags = async (): Promise<TagCount[]> => {
  const response = await apiClient.get('/songs/tags');
  return response.data || [];
};
export const importSong = async (url: string): Promise<SongData> => {
  const response = await api.post<SongData>('/songs/import', { url });
  return response.data;
};
