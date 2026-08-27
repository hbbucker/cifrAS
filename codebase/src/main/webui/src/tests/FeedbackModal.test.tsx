import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { FeedbackModal } from '../components/modals/FeedbackModal';
import { sendFeedback } from '../api/feedback';
import { useToast } from '../context/ToastContext';
import '@testing-library/jest-dom';

vi.mock('../api/feedback', () => ({
  sendFeedback: vi.fn(),
}));

vi.mock('../context/ToastContext', () => ({
  useToast: vi.fn(),
}));

describe('FeedbackModal', () => {
  const mockOnClose = vi.fn();
  const mockShowToast = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    (useToast as any).mockReturnValue({ toast: mockShowToast });
  });

  it('does not render when isOpen is false', () => {
    render(<FeedbackModal isOpen={false} onClose={mockOnClose} />);
    expect(screen.queryByText('Envie seu Feedback')).not.toBeInTheDocument();
  });

  it('renders correctly when isOpen is true', () => {
    render(<FeedbackModal isOpen={true} onClose={mockOnClose} />);
    expect(screen.getByText('Envie seu Feedback')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Digite sua mensagem aqui...')).toBeInTheDocument();
  });

  it('calls onClose when Cancel button is clicked', () => {
    render(<FeedbackModal isOpen={true} onClose={mockOnClose} />);
    fireEvent.click(screen.getByText('Cancelar'));
    expect(mockOnClose).toHaveBeenCalled();
  });

  it('calls onClose when Escape key is pressed', () => {
    render(<FeedbackModal isOpen={true} onClose={mockOnClose} />);
    fireEvent.keyDown(window, { key: 'Escape', code: 'Escape' });
    expect(mockOnClose).toHaveBeenCalled();
  });

  it('does not call onClose when other keys are pressed', () => {
    render(<FeedbackModal isOpen={true} onClose={mockOnClose} />);
    fireEvent.keyDown(window, { key: 'Enter', code: 'Enter' });
    expect(mockOnClose).not.toHaveBeenCalled();
  });

  it('does not call onClose on Escape if modal is closed', () => {
    render(<FeedbackModal isOpen={false} onClose={mockOnClose} />);
    fireEvent.keyDown(window, { key: 'Escape', code: 'Escape' });
    expect(mockOnClose).not.toHaveBeenCalled();
  });

  it('does not submit if message is empty', async () => {
    render(<FeedbackModal isOpen={true} onClose={mockOnClose} />);
    const form = screen.getByPlaceholderText('Digite sua mensagem aqui...').closest('form');
    fireEvent.submit(form!);
    expect(sendFeedback).not.toHaveBeenCalled();
  });

  it('submits feedback and shows success toast', async () => {
    (sendFeedback as any).mockResolvedValueOnce();
    
    render(<FeedbackModal isOpen={true} onClose={mockOnClose} />);
    
    const textarea = screen.getByPlaceholderText('Digite sua mensagem aqui...');
    fireEvent.change(textarea, { target: { value: 'Test feedback message' } });
    
    const submitBtn = screen.getByText('Enviar');
    fireEvent.click(submitBtn);

    expect(sendFeedback).toHaveBeenCalledWith({ message: 'Test feedback message' });
    
    await waitFor(() => {
      expect(mockShowToast).toHaveBeenCalledWith(
        'Recebemos seu feedback! Obrigado por nos ajudar a melhorar o CifrAS.',
        'success'
      );
      expect(mockOnClose).toHaveBeenCalled();
    });
  });

  it('shows error toast if submission fails', async () => {
    (sendFeedback as any).mockRejectedValueOnce(new Error('API Error'));
    
    render(<FeedbackModal isOpen={true} onClose={mockOnClose} />);
    
    const textarea = screen.getByPlaceholderText('Digite sua mensagem aqui...');
    fireEvent.change(textarea, { target: { value: 'Test feedback message' } });
    
    const submitBtn = screen.getByText('Enviar');
    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(mockShowToast).toHaveBeenCalledWith(
        'Erro ao enviar feedback. Tente novamente mais tarde.',
        'error'
      );
      expect(mockOnClose).not.toHaveBeenCalled();
    });
  });
});
