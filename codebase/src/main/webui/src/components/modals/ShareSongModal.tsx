import React, { useState, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { useTranslation } from 'react-i18next';
import { X, Mail } from 'lucide-react';
import { shareSong } from '../../api/songShares';
import { useToast } from '../../context/ToastContext';
import { Button } from '../ui/Button';

interface ShareSongModalProps {
  isOpen: boolean;
  songId: string;
  songTitle: string;
  onClose: () => void;
  onSuccess?: () => void;
}

export const ShareSongModal: React.FC<ShareSongModalProps> = ({
  isOpen,
  songId,
  songTitle,
  onClose,
  onSuccess,
}) => {
  const { t } = useTranslation();
  const { toast } = useToast();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleClose = useCallback(() => {
    setEmail('');
    setErrorMsg(null);
    setLoading(false);
    onClose();
  }, [onClose]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        handleClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, handleClose]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;

    setLoading(true);
    setErrorMsg(null);

    try {
      await shareSong(songId, email.trim());
      toast(t('songSharing.shareSuccess'), 'success');
      if (onSuccess) onSuccess();
      onClose();
    } catch (err: unknown) {
      const axiosErr = err as { response?: { status?: number; data?: { error?: string } } };
      const status = axiosErr.response?.status;
      if (status === 404) {
        setErrorMsg(t('songSharing.userNotFound'));
      } else if (status === 400) {
        setErrorMsg(t('songSharing.selfShareError'));
      } else if (status === 409) {
        setErrorMsg(t('songSharing.conflictError'));
      } else {
        setErrorMsg(t('songSharing.generalError'));
      }
    } finally {
      setLoading(false);
    }
  };

  return createPortal(
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50"
      role="dialog"
      aria-modal="true"
      aria-labelledby="share-song-title"
    >
      <div className="bg-bg-card border border-border-main rounded-2xl max-w-md w-full p-6 relative">
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 p-2 text-text-mute hover:text-text-main rounded-full hover:bg-bg-elevated transition-colors"
          aria-label="Close"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-4">
          <div className="p-3 bg-[#8629cc]/10 text-[#8629cc] rounded-xl">
            <Mail className="w-6 h-6" />
          </div>
          <div>
            <h3 id="share-song-title" className="text-xl font-bold text-text-main">
              {t('songSharing.shareSong')}
            </h3>
            <p className="text-sm text-text-mute line-clamp-1">{songTitle}</p>
          </div>
        </div>

        <p className="text-sm text-text-mute mb-5">
          {t('songSharing.shareDesc')}
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="share-email" className="block text-sm font-medium text-text-main mb-1.5">
              {t('songSharing.emailLabel')}
            </label>
            <input
              id="share-email"
              type="email"
              required
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                if (errorMsg) setErrorMsg(null);
              }}
              placeholder={t('songSharing.emailPlaceholder')}
              className="w-full px-4 py-2.5 rounded-xl border border-border-main bg-bg-main text-text-main focus:outline-none focus:ring-2 focus:ring-[#8629cc] transition-colors text-sm"
              disabled={loading}
              autoFocus
            />
          </div>

          {errorMsg && (
            <div className="p-3 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 text-sm font-medium">
              {errorMsg}
            </div>
          )}

          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={handleClose}
              className="px-4 py-2 rounded-xl text-sm font-medium text-text-main bg-bg-elevated hover:bg-bg-card border border-border-main transition-colors"
              disabled={loading}
            >
              {t('common.cancel')}
            </button>
            <Button
              type="submit"
              variant="primary"
              size="sm"
              isLoading={loading}
              disabled={!email.trim() || loading}
            >
              {t('songSharing.sendInvite')}
            </Button>
          </div>
        </form>
      </div>
    </div>,
    document.body
  );
};
