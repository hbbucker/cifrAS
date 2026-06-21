export interface DriveFile {
  id: string;
  name: string;
  mimeType: string;
}

export interface AuthUrlResponse {
  url: string;
}

export interface ExtractTextResponse {
  text: string;
}

const getHeaders = () => {
  const token = localStorage.getItem('token');
  return {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  };
};

export const googleDriveApi = {
  getAuthUrl: async (): Promise<string> => {
    const res = await fetch('/api/integrations/google/auth-url', {
      headers: getHeaders()
    });
    if (!res.ok) throw new Error('Failed to get auth url');
    const data: AuthUrlResponse = await res.json();
    return data.url;
  },

  exchangeCode: async (code: string): Promise<void> => {
    const res = await fetch('/api/integrations/google/callback', {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ code })
    });
    if (!res.ok) throw new Error('Failed to exchange code');
  },

  listFiles: async (): Promise<DriveFile[]> => {
    const res = await fetch('/api/integrations/google/drive/files', {
      headers: getHeaders()
    });
    if (!res.ok) throw new Error('Failed to list files');
    return await res.json();
  },

  extractText: async (fileId: string): Promise<string> => {
    const res = await fetch(`/api/integrations/google/drive/extract-text/${fileId}`, {
      method: 'POST',
      headers: getHeaders()
    });
    if (!res.ok) throw new Error('Failed to extract text');
    const data: ExtractTextResponse = await res.json();
    return data.text;
  }
};
