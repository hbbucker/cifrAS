import React, { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { Minimize2, Save, Edit3, Columns, Eye } from 'lucide-react';
import { ChordSheet } from './ChordSheet';
import { Button } from '../ui/Button';
import { useTour } from '../../context/TourContext';
import { CoachMark } from '../ui/CoachMark';

export type ViewMode = 'editor' | 'split' | 'preview';

export interface SongEditorFullscreenProps {
  isOpen: boolean;
  content: string;
  onChange: (value: string) => void;
  onClose: () => void;
  onSave: () => void;
  title?: string;
  artist?: string;
  songKey?: string;
  insertText?: (text: string) => void;
}

export const SongEditorFullscreen: React.FC<SongEditorFullscreenProps> = ({
  isOpen,
  content,
  onChange,
  onClose,
  onSave,
  title,
  artist,
  songKey,
  insertText,
}) => {
  const { t } = useTranslation();
  const { startTour, hasSeenTour } = useTour();
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const [viewMode, setViewMode] = useState<ViewMode>(() => {
    if (typeof window !== 'undefined' && window.innerWidth >= 1280) {
      return 'split';
    }
    return 'editor';
  });

  const [prevIsOpen, setPrevIsOpen] = useState(isOpen);
  if (isOpen !== prevIsOpen) {
    setPrevIsOpen(isOpen);
    if (isOpen) {
      setViewMode(typeof window !== 'undefined' && window.innerWidth >= 1280 ? 'split' : 'editor');
    }
  }

  // Trava o scroll do body quando o modal está aberto
  useEffect(() => {
    if (isOpen) {
      if (!hasSeenTour('fullscreen-view-mode')) {
        startTour('fullscreen-view-mode');
      } else if (!hasSeenTour('fullscreen-restore')) {
        startTour('fullscreen-restore');
      }
    }
  }, [isOpen, startTour, hasSeenTour]);

  useEffect(() => {
    if (isOpen) {
      const originalOverflow = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = originalOverflow;
      };
    }
  }, [isOpen]);

  // Atalhos globais de teclado (Esc para fechar e Ctrl+S / Cmd+S para salvar)
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
      } else if ((e.ctrlKey || e.metaKey) && (e.key === 's' || e.key === 'S')) {
        e.preventDefault();
        onSave();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose, onSave]);

  if (!isOpen) return null;

  const handleInsert = (textToInsert: string) => {
    const textarea = textareaRef.current;
    if (!textarea) {
      if (insertText) {
        insertText(textToInsert);
      } else {
        onChange(content + textToInsert);
      }
      return;
    }

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const newContent = content.substring(0, start) + textToInsert + content.substring(end);
    onChange(newContent);

    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + textToInsert.length, start + textToInsert.length);
    }, 0);
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={t('songForm.fullscreenBtn')}
      data-testid="song-editor-fullscreen-modal"
      className="fixed inset-0 z-50 bg-bg-card flex flex-col w-screen h-screen overflow-hidden"
    >
      {/* Barra Superior / Header do Modo Tela Cheia */}
      <header className="min-h-[56px] sm:min-h-[64px] px-3 sm:px-6 bg-bg-card border-b border-border-main flex items-center justify-between gap-3 shrink-0 z-20">
        {/* Lado Esquerdo: Restaurar e Identificação da Música */}
        <div className="flex items-center gap-2 sm:gap-3 min-w-0">
          <CoachMark
            tourId="fullscreen-restore"
            title={t('songForm.tourRestoreTitle', 'Restaurar Editor')}
            description={t('songForm.tourRestoreDesc', 'Clique aqui ou pressione a tecla Esc a qualquer momento para voltar ao formulário principal sem perder suas alterações.')}
            position="bottom"
          >
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              data-testid="fullscreen-restore-btn"
              title={t('songForm.restoreBtn')}
              aria-label={t('songForm.restoreBtn')}
              className="p-2 text-text-mute hover:text-text-main hover:bg-bg-elevated rounded-md shrink-0 flex items-center justify-center min-w-[36px] min-h-[36px]"
            >
              <Minimize2 className="w-5 h-5 text-text-main" />
            </Button>
          </CoachMark>

          <div className="hidden sm:flex flex-col min-w-0 pr-2 border-r border-border-main">
            <div className="flex items-center gap-2">
              <span className="font-bold text-sm sm:text-base text-text-main truncate max-w-[180px] lg:max-w-[260px]">
                {title || t('songForm.newTitle')}
              </span>
              {songKey && (
                <span className="px-1.5 py-0.5 text-xs font-semibold rounded bg-primary/10 text-primary shrink-0">
                  {songKey}
                </span>
              )}
            </div>
            {artist && (
              <span className="text-xs text-text-mute truncate max-w-[180px] lg:max-w-[260px]">
                {artist}
              </span>
            )}
          </div>
        </div>

        {/* Centro / Ações Rápidas & Controle de Visualização */}
        <div className="flex items-center gap-2 sm:gap-4 overflow-x-auto no-scrollbar">
          {/* Seletor Segmentado de Visualização */}
          <CoachMark
            tourId="fullscreen-view-mode"
            nextTourId="fullscreen-restore"
            title={t('songForm.tourViewModeTitle', 'Modos de Visualização')}
            description={t('songForm.tourViewModeDesc', 'Alterne entre apenas o editor, visão dividida (Split com cifra ao vivo) ou apenas pré-visualização.')}
            position="bottom"
          >
            <div
              data-testid="view-mode-selector"
              className="flex items-center bg-bg-main p-1 rounded-full border border-border-main shrink-0"
            >
              <button
                type="button"
                onClick={() => setViewMode('editor')}
                data-testid="view-mode-editor"
                title={t('songForm.viewEditor')}
                className={`flex items-center gap-1.5 px-2.5 sm:px-3 py-1 sm:py-1.5 text-xs font-semibold rounded-full transition-colors ${
                  viewMode === 'editor'
                    ? 'bg-bg-card text-text-main shadow-xs'
                    : 'text-text-mute hover:text-text-main'
                }`}
              >
                <Edit3 className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">{t('songForm.viewEditor')}</span>
              </button>

              <button
                type="button"
                onClick={() => setViewMode('split')}
                data-testid="view-mode-split"
                title={t('songForm.viewSplit')}
                className={`flex items-center gap-1.5 px-2.5 sm:px-3 py-1 sm:py-1.5 text-xs font-semibold rounded-full transition-colors ${
                  viewMode === 'split'
                    ? 'bg-bg-card text-text-main shadow-xs'
                    : 'text-text-mute hover:text-text-main'
                }`}
              >
                <Columns className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">{t('songForm.viewSplit')}</span>
              </button>

              <button
                type="button"
                onClick={() => setViewMode('preview')}
                data-testid="view-mode-preview"
                title={t('songForm.viewPreview')}
                className={`flex items-center gap-1.5 px-2.5 sm:px-3 py-1 sm:py-1.5 text-xs font-semibold rounded-full transition-colors ${
                  viewMode === 'preview'
                    ? 'bg-bg-card text-text-main shadow-xs'
                    : 'text-text-mute hover:text-text-main'
                }`}
              >
                <Eye className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">{t('songForm.viewPreview')}</span>
              </button>
            </div>
          </CoachMark>

          {/* Marcadores Rápidos (visíveis quando o editor está ativo) */}
          {viewMode !== 'preview' && (
            <div className="hidden lg:flex items-center gap-1.5 bg-bg-main p-1 rounded-md border border-border-main">
              <button
                type="button"
                onClick={() => handleInsert('[Refrão]\n')}
                data-testid="fullscreen-insert-refrao"
                className="px-2.5 py-1 text-xs font-semibold text-text-main bg-bg-card border border-border-main rounded hover:bg-bg-elevated transition-colors"
              >
                {t('songForm.refrao')}
              </button>
              <button
                type="button"
                onClick={() => handleInsert('\n[coluna]\n\n')}
                data-testid="fullscreen-insert-coluna"
                className="px-2.5 py-1 text-xs font-semibold text-text-main bg-bg-card border border-border-main rounded hover:bg-bg-elevated transition-colors"
              >
                {t('songForm.coluna')}
              </button>
              <button
                type="button"
                onClick={() => handleInsert('\n---\n')}
                data-testid="fullscreen-insert-separador"
                className="px-2.5 py-1 text-xs font-semibold text-text-main bg-bg-card border border-border-main rounded hover:bg-bg-elevated transition-colors"
              >
                {t('songForm.separador')}
              </button>
              <button
                type="button"
                onClick={() => handleInsert('\ne|---\nB|---\nG|---\nD|---\nA|---\nE|---\n')}
                data-testid="fullscreen-insert-tablatura"
                className="px-2.5 py-1 text-xs font-semibold text-text-main bg-bg-card border border-border-main rounded hover:bg-bg-elevated transition-colors"
              >
                {t('songForm.tablatura')}
              </button>
            </div>
          )}
        </div>

        {/* Lado Direito: Botão Salvar e Atalho */}
        <div className="flex items-center gap-2 shrink-0">
          <Button
            onClick={onSave}
            data-testid="fullscreen-save-btn"
            title={t('songForm.saveShortcut')}
            className="min-h-[38px] sm:min-h-[42px] px-3 sm:px-4 text-xs sm:text-sm font-semibold shrink-0"
          >
            <Save className="w-4 h-4 sm:mr-1.5" />
            <span>{t('common.save')}</span>
          </Button>
        </div>
      </header>

      {/* Área Central / Conteúdo Principal */}
      <div className="flex-1 flex overflow-hidden min-h-0 bg-bg-main">
        {/* Painel do Editor */}
        {(viewMode === 'editor' || viewMode === 'split') && (
          <div
            data-testid="fullscreen-editor-pane"
            className={`flex flex-col relative h-full bg-bg-card min-w-0 ${
              viewMode === 'split' ? 'w-full lg:w-1/2 border-r border-border-main' : 'w-full'
            }`}
          >
            {/* Barra de marcadores rápidos para telas compactas no modo editor */}
            <div className="lg:hidden flex items-center gap-1.5 px-3 py-2 border-b border-border-main bg-bg-main overflow-x-auto no-scrollbar">
              <button
                type="button"
                onClick={() => handleInsert('[Refrão]\n')}
                data-testid="compact-insert-refrao"
                className="px-2 py-1 text-[11px] font-semibold text-text-main bg-bg-card border border-border-main rounded shrink-0"
              >
                {t('songForm.refrao')}
              </button>
              <button
                type="button"
                onClick={() => handleInsert('\n[coluna]\n\n')}
                data-testid="compact-insert-coluna"
                className="px-2 py-1 text-[11px] font-semibold text-text-main bg-bg-card border border-border-main rounded shrink-0"
              >
                {t('songForm.coluna')}
              </button>
              <button
                type="button"
                onClick={() => handleInsert('\n---\n')}
                data-testid="compact-insert-separador"
                className="px-2 py-1 text-[11px] font-semibold text-text-main bg-bg-card border border-border-main rounded shrink-0"
              >
                {t('songForm.separador')}
              </button>
              <button
                type="button"
                onClick={() => handleInsert('\ne|---\nB|---\nG|---\nD|---\nA|---\nE|---\n')}
                data-testid="compact-insert-tablatura"
                className="px-2 py-1 text-[11px] font-semibold text-text-main bg-bg-card border border-border-main rounded shrink-0"
              >
                {t('songForm.tablatura')}
              </button>
            </div>

            {/* Container do Textarea com Linha Guia Vertical */}
            <div className="relative flex-1 flex flex-col h-full p-4 sm:p-6 overflow-y-auto font-mono text-sm sm:text-base">
              <div
                data-testid="song-editor-line-guide"
                title={t('songForm.lineGuideTooltip')}
                aria-hidden="true"
                className="absolute top-0 bottom-0 left-[37ch] sm:left-[40ch] border-r border-dashed border-border-main pointer-events-none z-0 flex flex-col justify-start"
              >
                <span className="text-[10px] text-text-mute/70 tracking-tight font-sans select-none -translate-x-1/2 bg-bg-card/80 px-1 py-0.5 rounded border border-border-main/60 mt-2 whitespace-nowrap shadow-none opacity-70">
                  <span className="sm:hidden">{t('songForm.lineGuideMobile', '37 carac.')}</span>
                  <span className="hidden sm:inline">{t('songForm.lineGuideDesktop', '40 carac.')}</span>
                </span>
              </div>

              <textarea
                ref={textareaRef}
                value={content}
                onChange={(e) => onChange(e.target.value)}
                className="relative z-10 w-full flex-1 min-h-full bg-transparent text-text-main font-mono text-sm sm:text-base focus:outline-none resize-none leading-relaxed"
                placeholder={t('songForm.contentPlaceholder')}
                data-testid="fullscreen-content-input"
              />
            </div>
          </div>
        )}

        {/* Painel do Live Preview */}
        {(viewMode === 'preview' || viewMode === 'split') && (
          <div
            data-testid="fullscreen-preview-pane"
            className={`flex flex-col h-full bg-bg-main overflow-y-auto min-w-0 ${
              viewMode === 'split' ? 'w-full lg:w-1/2' : 'w-full'
            }`}
          >
            <div className="sticky top-0 z-10 bg-bg-main/90 backdrop-blur-sm px-4 sm:px-6 py-2.5 border-b border-border-main flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-text-mute">
                {t('songForm.livePreview')}
              </span>
              <span className="text-[11px] text-text-mute">
                {t('songForm.linesCount', { count: content.split('\n').filter((l) => l.trim().length > 0).length })}
              </span>
            </div>

            <div className="p-4 sm:p-6 flex-1">
              {content.trim().length === 0 ? (
                <div
                  data-testid="fullscreen-preview-empty"
                  className="h-full min-h-[300px] flex items-center justify-center text-center p-8 border border-dashed border-border-main rounded-lg text-text-mute text-sm sm:text-base"
                >
                  <p>{t('songForm.emptyPreview')}</p>
                </div>
              ) : (
                <div className="bg-bg-card p-4 sm:p-6 rounded-lg border border-border-main">
                  <ChordSheet
                    content={content}
                    transparent={true}
                    fontSize={16}
                    columns={1}
                  />
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
