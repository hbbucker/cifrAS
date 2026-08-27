import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { sendFeedback } from '../../api/feedback';
import { useToast } from '../../context/ToastContext';
import { Button } from '../ui/Button';

interface FeedbackModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const FeedbackModal: React.FC<FeedbackModalProps> = ({ isOpen, onClose }) => {
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast: showToast } = useToast();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) return;

    setIsSubmitting(true);
    try {
      await sendFeedback({ message });
      showToast('Recebemos seu feedback! Obrigado por nos ajudar a melhorar o CifrAS.', 'success');
      setMessage('');
      onClose();
    } catch (error) {
      showToast('Erro ao enviar feedback. Tente novamente mais tarde.', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" role="dialog" aria-modal="true">
      <div className="bg-bg-card rounded-3xl shadow-2xl max-w-md w-full p-6 border border-border-main mx-auto">
        <h3 className="text-xl font-bold mb-2 text-text-main">Envie seu Feedback</h3>
        <p className="text-sm text-text-mute mb-4">Nos diga o que está achando ou reporte algum problema.</p>
        <form onSubmit={handleSubmit}>
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            className="w-full h-32 p-3 bg-bg-main border border-border-main rounded-xl focus:ring-2 focus:ring-brand-primary focus:border-brand-primary outline-none resize-none text-text-main mb-4"
            placeholder="Digite sua mensagem aqui..."
            required
            disabled={isSubmitting}
          />
          <div className="flex justify-end gap-3">
            <Button
              variant="secondary"
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
            >
              Cancelar
            </Button>
            <Button
              variant="primary"
              type="submit"
              isLoading={isSubmitting}
              disabled={isSubmitting || !message.trim()}
            >
              Enviar
            </Button>
          </div>
        </form>
      </div>
    </div>,
    document.body
  );
};
