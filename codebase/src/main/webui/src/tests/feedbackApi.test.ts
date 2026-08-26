import { describe, it, expect, vi } from 'vitest';
import { sendFeedback } from '../api/feedback';
import { apiClient } from '../services/authService';

vi.mock('../services/authService', () => ({
  apiClient: {
    post: vi.fn(),
  },
}));

describe('feedbackApi', () => {
  it('sends feedback correctly', async () => {
    (apiClient.post as any).mockResolvedValueOnce({ data: {} });
    
    await sendFeedback({ message: 'Great app' });
    
    expect(apiClient.post).toHaveBeenCalledWith('/feedbacks', { message: 'Great app' });
  });
});
