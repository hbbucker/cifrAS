import { apiClient } from '../services/authService';
import type { PaginatedResponse } from '../types/api';

export interface SongData {
  id: string;
  title: string;
  artist: string;
  originalKey?: string;
  keySignature: string;
  isFavorite: boolean;
  categories: string[];
  [key: string]: unknown;
}

export const getSongs = async (
  page: number = 1,
  limit: number = 20,
  search?: string
): Promise<PaginatedResponse<SongData> | SongData[]> => {
  const params: Record<string, string | number> = { page, size: limit };
  if (search && search.trim().length >= 3) {
    params.q = search.trim();
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
