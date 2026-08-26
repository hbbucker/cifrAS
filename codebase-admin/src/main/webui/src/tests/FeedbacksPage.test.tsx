import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { FeedbacksPage } from '../pages/FeedbacksPage';
import { getFeedbacks, replyFeedback } from '../api/feedback';
import '@testing-library/jest-dom';

vi.mock('../api/feedback', () => ({
  getFeedbacks: vi.fn(),
  replyFeedback: vi.fn(),
}));

describe('FeedbacksPage', () => {
  const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders loading state initially', () => {
    (getFeedbacks as any).mockReturnValue(new Promise(() => {}));
    render(<FeedbacksPage />);
    expect(screen.getByText('Carregando feedbacks...')).toBeInTheDocument();
  });

  it('renders error state on fetch failure', async () => {
    (getFeedbacks as any).mockRejectedValue(new Error('Fetch Error'));
    render(<FeedbacksPage />);
    
    await waitFor(() => {
      expect(screen.getByText('Feedbacks')).toBeInTheDocument();
      expect(consoleErrorSpy).toHaveBeenCalledWith('Error fetching feedbacks', expect.any(Error));
    });
  });

  it('renders empty feedbacks message', async () => {
    (getFeedbacks as any).mockResolvedValue([]);
    render(<FeedbacksPage />);
    
    await waitFor(() => {
      expect(screen.getByText('Nenhum feedback encontrado.')).toBeInTheDocument();
    });
  });

  it('renders feedbacks table correctly with different statuses', async () => {
    const mockData = [
      {
        id: '1',
        userId: 'UserA',
        message: 'Great app',
        status: 'PENDING',
        createdAt: '2023-01-01T12:00:00Z',
        updatedAt: '2023-01-01T12:00:00Z'
      },
      {
        id: '2',
        userId: '',
        message: 'Bug found',
        status: 'REPLIED',
        adminReply: 'Fixed',
        createdAt: '2023-01-02T12:00:00Z',
        updatedAt: '2023-01-02T12:00:00Z'
      }
    ];
    (getFeedbacks as any).mockResolvedValue(mockData);

    render(<FeedbacksPage />);

    await waitFor(() => {
      expect(screen.getByText('Great app')).toBeInTheDocument();
      expect(screen.getByText('Bug found')).toBeInTheDocument();
      expect(screen.getByText('Pendente')).toBeInTheDocument();
      expect(screen.getByText('Respondido')).toBeInTheDocument();
      expect(screen.getByText('Anônimo')).toBeInTheDocument();
    });
  });

  it('opens and closes modal using X button', async () => {
    const mockData = [{ id: '1', userId: 'UserA', message: 'Test', status: 'PENDING', createdAt: '2023-01-01T12:00:00Z' }];
    (getFeedbacks as any).mockResolvedValue(mockData);
    render(<FeedbacksPage />);

    await waitFor(() => screen.getByText('Test'));
    fireEvent.click(screen.getByText('Test'));

    await waitFor(() => expect(screen.getByText('Detalhes do Feedback')).toBeInTheDocument());
    
    fireEvent.click(screen.getByText('✕'));
    
    await waitFor(() => expect(screen.queryByText('Detalhes do Feedback')).not.toBeInTheDocument());
  });

  it('opens and closes modal using Cancel button', async () => {
    const mockData = [{ id: '1', userId: 'UserA', message: 'Test', status: 'PENDING', createdAt: '2023-01-01T12:00:00Z' }];
    (getFeedbacks as any).mockResolvedValue(mockData);
    render(<FeedbacksPage />);

    await waitFor(() => screen.getByText('Test'));
    fireEvent.click(screen.getByText('Test'));

    await waitFor(() => expect(screen.getByText('Detalhes do Feedback')).toBeInTheDocument());
    
    fireEvent.click(screen.getByText('Cancelar'));
    
    await waitFor(() => expect(screen.queryByText('Detalhes do Feedback')).not.toBeInTheDocument());
  });

  it('submits reply correctly', async () => {
    const mockData = [{ id: '1', userId: 'UserA', message: 'Need dark mode', status: 'PENDING', createdAt: '2023-01-01T12:00:00Z' }];
    (getFeedbacks as any).mockResolvedValue(mockData);
    (replyFeedback as any).mockResolvedValue();

    render(<FeedbacksPage />);

    await waitFor(() => screen.getByText('Need dark mode'));
    fireEvent.click(screen.getByText('Need dark mode'));

    await waitFor(() => expect(screen.getByText('Detalhes do Feedback')).toBeInTheDocument());

    const textarea = screen.getByPlaceholderText('Escreva a resposta aqui...');
    fireEvent.change(textarea, { target: { value: 'We will add it' } });

    fireEvent.click(screen.getByText('Enviar Resposta'));

    expect(replyFeedback).toHaveBeenCalledWith('1', { replyMessage: 'We will add it' });

    await waitFor(() => {
      expect(getFeedbacks).toHaveBeenCalledTimes(2); // Initial + after reply
      expect(screen.queryByText('Detalhes do Feedback')).not.toBeInTheDocument();
    });
  });

  it('prevents submission with empty message', async () => {
    const mockData = [{ id: '1', userId: 'UserA', message: 'Need dark mode', status: 'PENDING', createdAt: '2023-01-01T12:00:00Z' }];
    (getFeedbacks as any).mockResolvedValue(mockData);

    render(<FeedbacksPage />);
    await waitFor(() => screen.getByText('Need dark mode'));
    fireEvent.click(screen.getByText('Need dark mode'));
    await waitFor(() => expect(screen.getByText('Detalhes do Feedback')).toBeInTheDocument());

    const form = screen.getByPlaceholderText('Escreva a resposta aqui...').closest('form');
    fireEvent.submit(form!);

    expect(replyFeedback).not.toHaveBeenCalled();
  });

  it('handles reply failure', async () => {
    const mockData = [{ id: '1', userId: 'UserA', message: 'Test', status: 'PENDING', createdAt: '2023-01-01T12:00:00Z' }];
    (getFeedbacks as any).mockResolvedValue(mockData);
    (replyFeedback as any).mockRejectedValue(new Error('Reply Error'));

    render(<FeedbacksPage />);
    await waitFor(() => screen.getByText('Test'));
    fireEvent.click(screen.getByText('Test'));

    await waitFor(() => expect(screen.getByText('Detalhes do Feedback')).toBeInTheDocument());

    const textarea = screen.getByPlaceholderText('Escreva a resposta aqui...');
    fireEvent.change(textarea, { target: { value: 'Error response' } });

    fireEvent.click(screen.getByText('Enviar Resposta'));

    await waitFor(() => {
      expect(consoleErrorSpy).toHaveBeenCalledWith('Error replying feedback', expect.any(Error));
      expect(screen.getByText('Detalhes do Feedback')).toBeInTheDocument(); // Modal stays open
    });
  });

  it('shows replied message in readonly mode when status is REPLIED', async () => {
    const mockData = [{ id: '1', userId: 'UserA', message: 'Bug', status: 'REPLIED', adminReply: 'Fixed bug', createdAt: '2023-01-01T12:00:00Z' }];
    (getFeedbacks as any).mockResolvedValue(mockData);

    render(<FeedbacksPage />);
    await waitFor(() => screen.getByText('Bug'));
    fireEvent.click(screen.getByText('Bug'));

    await waitFor(() => {
      const textarea = screen.getByPlaceholderText('Escreva a resposta aqui...');
      expect(textarea).toHaveValue('Fixed bug');
      expect(textarea).toBeDisabled();
      expect(screen.queryByText('Enviar Resposta')).not.toBeInTheDocument();
      expect(screen.queryByText('Cancelar')).not.toBeInTheDocument();
    });
  });
});
