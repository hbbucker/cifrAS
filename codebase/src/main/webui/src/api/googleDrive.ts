import { apiClient } from '../services/authService';

export interface DriveFile {
  id: string;
  name: string;
  mimeType: string;
  parentFolderName?: string;
}

export interface AuthUrlResponse {
  url: string;
}

export interface ExtractTextResponse {
  text: string;
}

export interface AccountResponse {
  email: string;
}

export const googleDriveApi = {
  getAccounts: async (): Promise<AccountResponse[]> => {
    const res = await apiClient.get<AccountResponse[]>('/integrations/google/accounts');
    return res.data;
  },

  getAuthUrl: async (): Promise<string> => {
    const res = await apiClient.get<AuthUrlResponse>('/integrations/google/auth-url');
    return res.data.url;
  },

  exchangeCode: async (code: string): Promise<void> => {
    await apiClient.post('/integrations/google/callback', { code });
  },

  listFiles: async (email: string, q?: string): Promise<DriveFile[]> => {
    const res = await apiClient.get<DriveFile[]>('/integrations/google/drive/files', {
      params: { email, q }
    });
    return res.data;
  },

  extractText: async (fileId: string, email: string): Promise<string> => {
    const res = await apiClient.post<ExtractTextResponse>(`/integrations/google/drive/extract-text/${fileId}`, {}, {
      params: { email }
    });
    return res.data.text;
  }
};
