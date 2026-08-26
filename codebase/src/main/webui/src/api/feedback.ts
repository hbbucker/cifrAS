import { apiClient } from '../services/authService';
import { FeedbackCreateDTO } from '../types/feedback';

export const sendFeedback = async (data: FeedbackCreateDTO): Promise<void> => {
  await apiClient.post('/feedbacks', data);
};
