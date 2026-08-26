export interface FeedbackDTO {
  id: string;
  userId: string;
  message: string;
  status: string;
  adminReply?: string;
  createdAt: string;
  updatedAt: string;
}

export interface FeedbackReplyDTO {
  replyMessage: string;
}
