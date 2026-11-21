import React, { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useTranslation } from 'react-i18next';
import { X, ExternalLink, PlayCircle } from 'lucide-react';

export const DEFAULT_GROUP_TUTORIAL_VIDEO_ID = 'CenYFX8YfKM';

interface TutorialVideoModalProps {
  isOpen: boolean;
  onClose: () => void;
  videoId?: string;
  title?: string;
  description?: string;
}

export const TutorialVideoModal: React.FC<TutorialVideoModalProps> = ({
  isOpen,
  onClose,
  videoId = DEFAULT_GROUP_TUTORIAL_VIDEO_ID,
  title,
  description,
}) => {
  const { t } = useTranslation();

  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const modalTitle = title ?? t('tutorial.groupPlaylistTitle');
  const modalDesc = description ?? t('tutorial.groupPlaylistDesc');
  const embedUrl = `https://www.youtube.com/embed/${videoId}?rel=0`;
  const watchUrl = `https://youtube.com/shorts/${videoId}`;

  return createPortal(
    <div
      className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="tutorial-video-title"
      data-testid="tutorial-video-modal"
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
    >
      <div className="bg-bg-card rounded-3xl max-w-md w-full p-5 sm:p-6 shadow-2xl relative flex flex-col max-h-[92vh]">
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 w-9 h-9 flex items-center justify-center rounded-full text-text-mute hover:text-text-main hover:bg-bg-elevated transition-colors"
          aria-label={t('common.close')}
          data-testid="tutorial-modal-close-btn"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-2.5 pr-8 mb-1.5">
          <div className="w-8 h-8 rounded-lg bg-[#aa3bff]/10 text-[#aa3bff] flex items-center justify-center shrink-0">
            <PlayCircle className="w-5 h-5" />
          </div>
          <h2 id="tutorial-video-title" className="text-lg sm:text-xl font-bold text-text-main leading-tight">
            {modalTitle}
          </h2>
        </div>

        <p className="text-xs sm:text-sm text-text-mute mb-4">
          {modalDesc}
        </p>

        <div className="w-full flex justify-center mb-4 min-h-0 flex-1">
          <div className="aspect-[9/16] h-full max-h-[58vh] rounded-2xl overflow-hidden bg-black border border-border-main">
            <iframe
              src={embedUrl}
              title={modalTitle}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              className="w-full h-full border-0"
              data-testid="tutorial-video-iframe"
            />
          </div>
        </div>

        <div className="flex items-center justify-between gap-3 pt-1">
          <a
            href={watchUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-medium text-[#aa3bff] hover:underline min-h-[40px]"
            data-testid="tutorial-youtube-link"
          >
            <ExternalLink className="w-4 h-4" />
            <span>{t('tutorial.watchOnYoutube')}</span>
          </a>

          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 min-h-[40px] rounded-md font-medium bg-bg-elevated text-text-main hover:bg-border-main transition-colors text-xs sm:text-sm"
          >
            {t('common.close')}
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
};
