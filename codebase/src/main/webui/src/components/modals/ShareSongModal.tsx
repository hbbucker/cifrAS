import React, { useState, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { useTranslation } from 'react-i18next';
import { X, Link, Copy, Check } from 'lucide-react';
import { createShareLink } from '../../api/shareLinks';
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
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [shareUrl, setShareUrl] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const handleClose = useCallback(() => {
    setShareUrl(null);
    setErrorMsg(null);
    setLoading(false);
    setCopied(false);
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

  const handleGenerate = async () => {
    setLoading(true);
    setErrorMsg(null);

    try {
      const data = await createShareLink({ type: 'SONG', resourceId: songId });
      const url = `${window.location.origin}/invite/${data.token}`;
      setShareUrl(url);
    } catch (err: unknown) {
      setErrorMsg(t('songSharing.generalError', 'Ocorreu um erro ao gerar o link.'));
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = async () => {
    if (!shareUrl) return;
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      toast(t('songSharing.copySuccess', 'Link copiado!'), 'success');
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      toast(t('songSharing.copyError', 'Erro ao copiar o link.'), 'error');
    }
  };

  return createPortal(
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50"
      role="dialog"
      aria-modal="true"
      aria-labelledby="share-song-title"
    >
      <div className="bg-bg-card border border-border-main rounded-lg max-w-md w-full p-6 relative">
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 p-2 text-text-mute hover:text-text-main rounded-full hover:bg-bg-elevated transition-colors"
          aria-label="Close"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-4">
          <div className="p-3 bg-[#aa3bff]/10 text-[#aa3bff] rounded-md">
            <Link className="w-6 h-6" />
          </div>
          <div>
            <h3 id="share-song-title" className="text-xl font-bold text-text-main">
              {t('songSharing.shareSong', 'Compartilhar Cifra')}
            </h3>
            <p className="text-sm text-text-mute line-clamp-1">{songTitle}</p>
          </div>
        </div>

        <p className="text-sm text-text-mute mb-5">
          {t('songSharing.shareLinkDesc', 'Gere um link para que outras pessoas possam acessar esta cifra.')}
        </p>

        {errorMsg && (
          <div className="mb-4 p-3 rounded-md bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 text-sm font-medium">
            {errorMsg}
          </div>
        )}

        {!shareUrl ? (
          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={handleClose}
              className="px-4 py-2 rounded-md text-sm font-medium text-text-main bg-bg-elevated hover:bg-bg-card border border-border-main transition-colors"
              disabled={loading}
            >
              {t('common.cancel', 'Cancelar')}
            </button>
            <Button
              type="button"
              variant="primary"
              size="sm"
              isLoading={loading}
              disabled={loading}
              onClick={handleGenerate}
            >
              {t('songSharing.generateLink', 'Gerar Link')}
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <input
                type="text"
                readOnly
                value={shareUrl}
                className="flex-1 px-4 py-2.5 rounded-md border border-border-main bg-bg-main text-text-main focus:outline-none focus:ring-2 focus:ring-[#aa3bff] transition-colors text-sm"
              />
              <Button
                type="button"
                variant="primary"
                size="sm"
                onClick={handleCopy}
              >
                {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              </Button>
            </div>
            <div className="flex justify-end gap-3 pt-2">
              <Button
                type="button"
                onClick={handleClose}
                variant="primary"
                size="sm"
              >
                {t('common.close', 'Fechar')}
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>,
    document.body
  );
};
