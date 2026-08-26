import { adminApi } from './adminApi';
import { FeedbackDTO, FeedbackReplyDTO } from '../types/feedback';

export const getFeedbacks = async (): Promise<FeedbackDTO[]> => {
  const response = await adminApi.get('/feedbacks');
  let data = response.data;
  if (typeof data === 'string') {
    try {
      data = JSON.parse(data);
    } catch {
      // ignore
    }
  }
  return data;
};

export const replyFeedback = async (id: string, reply: FeedbackReplyDTO): Promise<void> => {
  await adminApi.put(`/feedbacks/${id}/reply`, reply);
};
