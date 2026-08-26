import { describe, it, expect, vi } from 'vitest';
import { getFeedbacks, replyFeedback } from '../api/feedback';
import { adminApi } from '../api/adminApi';

vi.mock('../api/adminApi', () => ({
  adminApi: {
    get: vi.fn(),
    put: vi.fn(),
  },
}));

describe('feedbackApi', () => {
  it('gets feedbacks correctly and parses string responses', async () => {
    (adminApi.get as any).mockResolvedValueOnce({ data: JSON.stringify([{ id: '1' }]) });
    
    const data = await getFeedbacks();
    
    expect(adminApi.get).toHaveBeenCalledWith('/feedbacks');
    expect(data).toEqual([{ id: '1' }]);
  });

  it('gets feedbacks correctly and returns object responses', async () => {
    (adminApi.get as any).mockResolvedValueOnce({ data: [{ id: '2' }] });
    
    const data = await getFeedbacks();
    
    expect(adminApi.get).toHaveBeenCalledWith('/feedbacks');
    expect(data).toEqual([{ id: '2' }]);
  });

  it('replies to feedback correctly', async () => {
    (adminApi.put as any).mockResolvedValueOnce({ data: {} });
    
    await replyFeedback('1', { replyMessage: 'Thanks' });
    
    expect(adminApi.put).toHaveBeenCalledWith('/feedbacks/1/reply', { replyMessage: 'Thanks' });
  });
});
