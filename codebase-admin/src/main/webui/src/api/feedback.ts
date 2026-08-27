import { adminClient } from './adminApi';
import type { FeedbackDTO, FeedbackReplyDTO } from '../types/feedback';


export const getFeedbacks = async (): Promise<FeedbackDTO[]> => {
  const response = await adminClient.get<FeedbackDTO[]>('/feedbacks');
  return response.data;
};

export const replyFeedback = async (id: string, reply: FeedbackReplyDTO): Promise<void> => {
  await adminClient.put(`/feedbacks/${id}/reply`, reply);
};
