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
  const params: Record<string, string | number> = { page, limit };
  if (search && search.trim().length >= 3) {
    params.search = search.trim();
  }

  const { data } = await apiClient.get<PaginatedResponse<SongData> | SongData[]>('/songs', {
    params
  });

  return data;
};
