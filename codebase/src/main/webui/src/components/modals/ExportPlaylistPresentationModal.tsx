import React, { useState, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { useTranslation } from 'react-i18next';
import { X, Presentation, Download, Copy, Check, Sparkles, Moon, Sun, Church } from 'lucide-react';
import { useToast } from '../../context/ToastContext';
import {
  generatePlaylistPresentation,
  exportCleanLyricsText,
} from '../../utils/presentationGenerator';
import type {
  PresentationTheme,
  SongForPresentation,
} from '../../utils/presentationGenerator';

export interface ExportPlaylistPresentationModalProps {
  isOpen: boolean;
  playlistTitle: string;
  songs: SongForPresentation[];
  onClose: () => void;
}

export const ExportPlaylistPresentationModal: React.FC<ExportPlaylistPresentationModalProps> = ({
  isOpen,
  playlistTitle,
  songs,
  onClose,
}) => {
  const { t } = useTranslation();
  const { toast } = useToast();

  const [excludedSongIds, setExcludedSongIds] = useState<string[]>([]);
  const [theme, setTheme] = useState<PresentationTheme>('dark');
  const [includeCover, setIncludeCover] = useState(true);
  const [includeSongTitles, setIncludeSongTitles] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleClose = useCallback(() => {
    if (isGenerating) return;
    setExcludedSongIds([]);
    setIsGenerating(false);
    setCopied(false);
    onClose();
  }, [isGenerating, onClose]);

  // Handle ESC key
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

  const toggleSong = (id: string) => {
    setExcludedSongIds(prev =>
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };

  const handleSelectAll = () => {
    setExcludedSongIds([]);
  };

  const handleDeselectAll = () => {
    setExcludedSongIds(songs.map(s => s.id));
  };

  const filteredSongs = songs.filter(s => !excludedSongIds.includes(s.id));
  const selectedCount = filteredSongs.length;

  const handleDownload = async () => {
    if (filteredSongs.length === 0) {
      toast(t('playlistPresentation.noSongsSelected'), 'error');
      return;
    }

    setIsGenerating(true);
    try {
      await generatePlaylistPresentation(playlistTitle, filteredSongs, {
        theme,
        includePlaylistTitleSlide: includeCover,
        includeSongTitleSlides: includeSongTitles,
        maxLinesPerSlide: 5,
      });
      toast(t('playlistPresentation.exportSuccess'), 'success');
      onClose();
    } catch (error) {
      console.error('Failed to generate presentation:', error);
      toast(t('playlistPresentation.exportError'), 'error');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCopyLyrics = async () => {
    if (filteredSongs.length === 0) {
      toast(t('playlistPresentation.noSongsSelected'), 'error');
      return;
    }

    try {
      const text = exportCleanLyricsText(playlistTitle, filteredSongs);
      await navigator.clipboard.writeText(text);
      setCopied(true);
      toast(t('playlistPresentation.copySuccess'), 'success');
      setTimeout(() => setCopied(false), 2500);
    } catch (error) {
      console.error('Failed to copy lyrics to clipboard:', error);
      toast(t('playlistPresentation.exportError'), 'error');
    }
  };

  return createPortal(
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200"
      role="dialog"
      aria-modal="true"
      aria-labelledby="export-presentation-title"
    >
      <div className="bg-bg-card border border-border-main rounded-lg sm:rounded-3xl max-w-xl w-full p-4 sm:p-6 relative flex flex-col max-h-[92vh] shadow-2xl">
        {/* Header */}
        <div className="flex items-start justify-between pb-3.5 border-b border-border-main shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-[#aa3bff]/10 text-[#aa3bff] rounded-md flex items-center justify-center">
              <Presentation className="w-5 h-5 sm:w-6 sm:h-6" />
            </div>
            <div>
              <h2
                id="export-presentation-title"
                className="text-lg sm:text-xl font-bold text-text-main leading-tight"
              >
                {t('playlistPresentation.modalTitle')}
              </h2>
              <p className="text-xs sm:text-sm text-text-mute">
                {t('playlistPresentation.modalSubtitle')}
              </p>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="p-1.5 text-text-mute hover:text-text-main rounded-full hover:bg-bg-elevated transition-colors"
            aria-label="Close"
            data-testid="close-presentation-modal-btn"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto py-4 space-y-5 min-h-0 pr-1">
          {/* Theme Selector */}
          <div>
            <label className="text-xs font-semibold uppercase tracking-wider text-text-mute mb-2 block">
              {t('playlistPresentation.theme')}
            </label>
            <div className="grid grid-cols-3 gap-2 sm:gap-3">
              <button
                type="button"
                onClick={() => setTheme('dark')}
                className={`flex flex-col items-center justify-center gap-1 py-2 px-1 sm:p-3 rounded-md border text-center transition-all min-h-[58px] sm:min-h-[64px] ${
                  theme === 'dark'
                    ? 'border-[#aa3bff] bg-black text-white ring-2 ring-[#aa3bff]/20'
                    : 'border-border-main bg-bg-elevated/40 text-text-main hover:bg-bg-elevated'
                }`}
                data-testid="theme-dark-btn"
              >
                <Moon className="w-4 h-4 text-[#aa3bff] shrink-0" />
                <span className="text-[11px] sm:text-xs font-semibold leading-tight text-center break-words max-w-full">
                  {t('playlistPresentation.themeDark')}
                </span>
              </button>

              <button
                type="button"
                onClick={() => setTheme('light')}
                className={`flex flex-col items-center justify-center gap-1 py-2 px-1 sm:p-3 rounded-md border text-center transition-all min-h-[58px] sm:min-h-[64px] ${
                  theme === 'light'
                    ? 'border-[#aa3bff] bg-white text-gray-900 ring-2 ring-[#aa3bff]/20 shadow-xs'
                    : 'border-border-main bg-bg-elevated/40 text-text-main hover:bg-bg-elevated'
                }`}
                data-testid="theme-light-btn"
              >
                <Sun className="w-4 h-4 text-amber-500 shrink-0" />
                <span className="text-[11px] sm:text-xs font-semibold leading-tight text-center break-words max-w-full">
                  {t('playlistPresentation.themeLight')}
                </span>
              </button>

              <button
                type="button"
                onClick={() => setTheme('liturgic')}
                className={`flex flex-col items-center justify-center gap-1 py-2 px-1 sm:p-3 rounded-md border text-center transition-all min-h-[58px] sm:min-h-[64px] ${
                  theme === 'liturgic'
                    ? 'border-[#aa3bff] bg-[#0A1128] text-blue-50 ring-2 ring-[#aa3bff]/20'
                    : 'border-border-main bg-bg-elevated/40 text-text-main hover:bg-bg-elevated'
                }`}
                data-testid="theme-liturgic-btn"
              >
                <Church className="w-4 h-4 text-blue-400 shrink-0" />
                <span className="text-[11px] sm:text-xs font-semibold leading-tight text-center break-words max-w-full">
                  {t('playlistPresentation.themeLiturgic')}
                </span>
              </button>
            </div>
          </div>

          {/* Options Checkboxes */}
          <div className="bg-bg-elevated/40 rounded-md p-3.5 border border-border-main space-y-2.5">
            <label className="text-xs font-semibold uppercase tracking-wider text-text-mute block mb-1">
              {t('playlistPresentation.optionsTitle')}
            </label>

            <label className="flex items-center gap-2.5 text-xs sm:text-sm text-text-main cursor-pointer">
              <input
                type="checkbox"
                checked={includeCover}
                onChange={e => setIncludeCover(e.target.checked)}
                className="w-4 h-4 rounded text-[#aa3bff] focus:ring-[#aa3bff] accent-[#aa3bff]"
              />
              <span>{t('playlistPresentation.includeCover')}</span>
            </label>

            <label className="flex items-center gap-2.5 text-xs sm:text-sm text-text-main cursor-pointer">
              <input
                type="checkbox"
                checked={includeSongTitles}
                onChange={e => setIncludeSongTitles(e.target.checked)}
                className="w-4 h-4 rounded text-[#aa3bff] focus:ring-[#aa3bff] accent-[#aa3bff]"
              />
              <span>{t('playlistPresentation.includeSongTitles')}</span>
            </label>
          </div>

          {/* Song Selection List */}
          <div>
            <div className="flex flex-wrap items-center justify-between gap-1.5 mb-2">
              <label className="text-xs font-semibold uppercase tracking-wider text-text-mute shrink-0">
                {t('playlistPresentation.selectSongs')} ({selectedCount}/{songs.length})
              </label>
              <div className="flex items-center gap-2 text-xs shrink-0">
                <button
                  type="button"
                  onClick={handleSelectAll}
                  className="text-[#aa3bff] hover:underline font-medium"
                >
                  {t('playlistPresentation.selectAll')}
                </button>
                <span className="text-text-mute">•</span>
                <button
                  type="button"
                  onClick={handleDeselectAll}
                  className="text-text-mute hover:text-text-main hover:underline"
                >
                  {t('playlistPresentation.deselectAll')}
                </button>
              </div>
            </div>

            <div className="space-y-1.5 max-h-48 overflow-y-auto border border-border-main rounded-md p-2 bg-bg-card">
              {songs.map((song, index) => {
                const isSelected = !excludedSongIds.includes(song.id);
                return (
                  <div
                    key={song.id}
                    onClick={() => toggleSong(song.id)}
                    className={`flex items-center justify-between p-2 rounded-lg cursor-pointer transition-colors text-xs sm:text-sm ${
                      isSelected
                        ? 'bg-[#aa3bff]/10 text-text-main font-medium'
                        : 'text-text-mute hover:bg-bg-elevated/50'
                    }`}
                    data-testid={`presentation-song-item-${song.id}`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => {}} // Handled by parent div
                        className="w-4 h-4 rounded text-[#aa3bff] focus:ring-[#aa3bff] accent-[#aa3bff] shrink-0"
                      />
                      <span className="text-text-mute shrink-0 font-mono text-xs">
                        {index + 1}.
                      </span>
                      <span className="truncate">{song.title}</span>
                    </div>
                    {song.artist && (
                      <span className="text-xs text-text-mute truncate ml-2 max-w-[120px]">
                        {song.artist}
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="pt-3.5 border-t border-border-main flex flex-col sm:flex-row items-center justify-end gap-2.5 shrink-0">
          <button
            type="button"
            onClick={handleCopyLyrics}
            disabled={isGenerating || filteredSongs.length === 0}
            className="w-full sm:w-auto flex items-center justify-center gap-2 px-3.5 py-2.5 rounded-md border border-border-main bg-bg-elevated hover:bg-bg-elevated/80 text-text-main text-xs sm:text-sm font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            data-testid="copy-lyrics-btn"
          >
            {copied ? (
              <>
                <Check className="w-4 h-4 text-emerald-500" />
                <span>{t('playlistPresentation.copySuccess')}</span>
              </>
            ) : (
              <>
                <Copy className="w-4 h-4" />
                <span>{t('playlistPresentation.copyLyrics')}</span>
              </>
            )}
          </button>

          <button
            type="button"
            onClick={handleDownload}
            disabled={isGenerating || filteredSongs.length === 0}
            className="w-full sm:w-auto flex items-center justify-center gap-2 px-4 py-2.5 rounded-md bg-[#aa3bff] hover:bg-[#9926f0] text-white text-xs sm:text-sm font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed active:scale-98"
            data-testid="download-pptx-btn"
          >
            {isGenerating ? (
              <>
                <Sparkles className="w-4 h-4 animate-spin" />
                <span>{t('playlistPresentation.generating')}</span>
              </>
            ) : (
              <>
                <Download className="w-4 h-4" />
                <span>{t('playlistPresentation.downloadPptx')}</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
};
