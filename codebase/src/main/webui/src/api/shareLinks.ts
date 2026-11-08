import { apiClient } from '../services/authService';

export interface ShareLinkCreate {
  type: 'SONG' | 'GROUP';
  resourceId: string;
}

export interface ShareLinkResponse {
  token: string;
  type: 'SONG' | 'GROUP';
  resourceId: string;
  resourceName: string;
  authorName: string;
  expiresAt: string;
  url: string;
}

export const createShareLink = async (payload: ShareLinkCreate): Promise<ShareLinkResponse> => {
  const response = await apiClient.post('/share-links', payload);
  return response.data;
};

export const getShareLinkInfo = async (token: string): Promise<ShareLinkResponse> => {
  const response = await apiClient.get(`/share-links/${token}`);
  return response.data;
};

export const acceptShareLink = async (token: string): Promise<{ success: boolean; message: string }> => {
  const response = await apiClient.post(`/share-links/${token}/accept`);
  return response.data;
};
