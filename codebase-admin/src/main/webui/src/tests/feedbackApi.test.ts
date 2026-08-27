import { describe, it, expect, vi } from 'vitest';
import { getFeedbacks, replyFeedback } from '../api/feedback';
import { adminClient } from '../api/adminApi';

vi.mock('../api/adminApi', () => ({
  adminClient: {
    get: vi.fn(),
    put: vi.fn(),
  },
}));

describe('feedbackApi', () => {
  it('gets feedbacks correctly', async () => {
    vi.mocked(adminClient.get).mockResolvedValueOnce({ data: [{ id: '1' }] } as never);
    
    const data = await getFeedbacks();
    
    expect(adminClient.get).toHaveBeenCalledWith('/feedbacks');
    expect(data).toEqual([{ id: '1' }]);
  });

  it('replies to feedback correctly', async () => {
    vi.mocked(adminClient.put).mockResolvedValueOnce({ data: {} } as never);
    
    await replyFeedback('1', { replyMessage: 'Thanks' });
    
    expect(adminClient.put).toHaveBeenCalledWith('/feedbacks/1/reply', { replyMessage: 'Thanks' });
  });
});
