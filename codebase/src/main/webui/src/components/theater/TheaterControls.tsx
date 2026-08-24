import React from 'react';
import { useTranslation } from 'react-i18next';
import { Play, Pause, ChevronLeft, ChevronRight, Maximize, X, Lock, Unlock, Mic } from 'lucide-react';
import { TransposePad } from '../music/TransposePad';

interface TheaterControlsProps {
  title?: string;
  artist?: string;
  isScrolling: boolean;
  speed: number;
  currentKey: string;
  onPlayPause: () => void;
  onSpeedChange: (speed: number) => void;
  onTransposeUp: () => void;
  onTransposeDown: () => void;
  onNextSong?: () => void;
  onPrevSong?: () => void;
  onToggleFullscreen?: () => void;
  onExit?: () => void;
  onFontSizeIncrease?: () => void;
  onFontSizeDecrease?: () => void;
  className?: string;
  isLocked?: boolean;
  onLockToggle?: () => void;
  isSingerMode?: boolean;
  onToggleSingerMode?: () => void;
}

export const TheaterControls: React.FC<TheaterControlsProps> = ({
  title,
  artist,
  isScrolling,
  speed,
  currentKey,
  onPlayPause,
  onSpeedChange,
  onTransposeUp,
  onTransposeDown,
  onNextSong,
  onPrevSong,
  onToggleFullscreen,
  onExit,
  onFontSizeIncrease,
  onFontSizeDecrease,
  className = '',
  isLocked = false,
  onLockToggle,
  isSingerMode = false,
  onToggleSingerMode
}) => {
  const { t } = useTranslation();

  return (
    <div 
      className={`fixed inset-0 pointer-events-none z-40 transition-all duration-300 ${className}`} 
      data-testid="theater-controls"
    >
      {/* ========================================================================= */}
      {/* 1. TOP HEADER (Session & Utilities)                                       */}
      {/* ========================================================================= */}
      <header className="fixed top-0 left-0 right-0 px-3.5 sm:px-6 py-2.5 sm:py-3.5 flex items-center justify-between bg-gradient-to-b from-bg-main via-bg-main/85 to-transparent backdrop-blur-sm border-b border-border-main/30 pointer-events-auto transition-all">
        {/* Left: Exit button + Song Title & Artist */}
        <div className="flex items-center gap-2 sm:gap-3.5 min-w-0 pr-2">
          <button 
            onClick={onExit} 
            className="p-2 min-h-[38px] min-w-[38px] sm:min-h-[42px] sm:min-w-[42px] flex items-center justify-center rounded-full bg-bg-card/90 hover:bg-red-500/20 text-text-mute hover:text-red-500 transition-colors border border-border-main/50 shadow-sm shrink-0" 
            title={t('theater.exit')} 
            aria-label={t('theater.exit')}
            data-testid="exit-theater-btn"
          >
            <X className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>
          
          {(title || artist) && (
            <div className="min-w-0">
              {title && <h1 className="text-sm sm:text-base md:text-lg font-bold truncate text-text-main">{title}</h1>}
              {artist && <p className="text-xs sm:text-sm text-text-mute truncate">{artist}</p>}
            </div>
          )}
        </div>

        {/* Right: Lock & Fullscreen buttons */}
        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
          <button 
            onClick={onLockToggle}
            className={`p-2 min-h-[38px] min-w-[38px] sm:min-h-[42px] sm:min-w-[42px] flex items-center justify-center rounded-full bg-bg-card/90 hover:bg-bg-elevated transition-colors border border-border-main/50 shadow-sm ${isLocked ? 'text-[#8629cc] ring-1 ring-[#8629cc]/40' : 'text-text-mute hover:text-text-main'}`}
            title={isLocked ? t('theater.unlock') : t('theater.lock')} 
            aria-label={isLocked ? t('theater.unlock') : t('theater.lock')}
            data-testid="lock-mode-btn"
          >
            {isLocked ? <Lock className="w-4 h-4 sm:w-5 sm:h-5" /> : <Unlock className="w-4 h-4 sm:w-5 sm:h-5" />}
          </button>

          {!isLocked && (
            <button 
              onClick={onToggleFullscreen} 
              className="p-2 min-h-[38px] min-w-[38px] sm:min-h-[42px] sm:min-w-[42px] flex items-center justify-center rounded-full bg-bg-card/90 hover:bg-bg-elevated text-text-mute hover:text-text-main transition-colors border border-border-main/50 shadow-sm" 
              title={t('theater.fullscreen')} 
              aria-label={t('theater.fullscreen')}
              data-testid="fullscreen-btn"
            >
              <Maximize className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>
          )}
        </div>
      </header>

      {/* ========================================================================= */}
      {/* 2. SIDE DOCK (Typography & View Mode)                                     */}
      {/* ========================================================================= */}
      {!isLocked && (
        <aside className="fixed right-3 sm:right-6 top-1/3 -translate-y-1/2 flex flex-col items-center gap-1 sm:gap-1.5 p-1.5 bg-bg-card/90 backdrop-blur-xl border border-border-main rounded-2xl shadow-xl pointer-events-auto transition-all">
          <button 
            onClick={onFontSizeIncrease} 
            className="p-2 min-h-[36px] min-w-[36px] sm:min-h-[40px] sm:min-w-[40px] flex items-center justify-center hover:bg-bg-elevated rounded-xl transition-colors text-text-mute hover:text-text-main font-bold text-sm sm:text-base" 
            title={t('theater.increaseFont')} 
            aria-label={t('theater.increaseFont')}
            data-testid="increase-font-btn"
          >
            {t('theater.aPlus')}
          </button>
          
          <button 
            onClick={onFontSizeDecrease} 
            className="p-2 min-h-[36px] min-w-[36px] sm:min-h-[40px] sm:min-w-[40px] flex items-center justify-center hover:bg-bg-elevated rounded-xl transition-colors text-text-mute hover:text-text-main font-bold text-xs sm:text-sm" 
            title={t('theater.decreaseFont')} 
            aria-label={t('theater.decreaseFont')}
            data-testid="decrease-font-btn"
          >
            {t('theater.aMinus')}
          </button>

          <div className="w-4 h-px bg-border-main my-0.5" />

          <button 
            onClick={onToggleSingerMode}
            className={`p-2 min-h-[36px] min-w-[36px] sm:min-h-[40px] sm:min-w-[40px] flex items-center justify-center hover:bg-bg-elevated rounded-xl transition-colors ${isSingerMode ? 'bg-[#8629cc]/15 text-[#8629cc] ring-1 ring-[#8629cc]/30' : 'text-text-mute hover:text-text-main'}`}
            title={isSingerMode ? t('theater.chordsMode') : t('theater.singerMode')} 
            aria-label={isSingerMode ? t('theater.chordsMode') : t('theater.singerMode')}
            data-testid="singer-mode-btn"
          >
            <Mic className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>
        </aside>
      )}

      {/* ========================================================================= */}
      {/* 3. BOTTOM DOCK (Performance & Playback)                                   */}
      {/* ========================================================================= */}
      <nav 
        className="fixed bottom-4 sm:bottom-6 left-1/2 -translate-x-1/2 bg-bg-card/95 backdrop-blur-xl text-text-main px-3.5 sm:px-6 py-2.5 sm:py-3.5 rounded-full shadow-2xl border border-border-main flex items-center gap-2 sm:gap-4 md:gap-5 pointer-events-auto transition-all max-w-[95%] w-auto"
        aria-label="Controles de Performance"
      >
        {/* Playlist Navigation */}
        {!isLocked && (
          <div className="flex items-center gap-0.5 sm:gap-1 shrink-0">
            <button 
              onClick={onPrevSong} 
              className="p-1.5 sm:p-2 min-h-[38px] min-w-[38px] sm:min-h-[42px] sm:min-w-[42px] flex items-center justify-center hover:bg-bg-elevated rounded-full transition-colors disabled:opacity-30 disabled:cursor-not-allowed" 
              disabled={!onPrevSong} 
              aria-label="Música Anterior"
              data-testid="prev-song-btn"
            >
              <ChevronLeft className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>
            <button 
              onClick={onNextSong} 
              className="p-1.5 sm:p-2 min-h-[38px] min-w-[38px] sm:min-h-[42px] sm:min-w-[42px] flex items-center justify-center hover:bg-bg-elevated rounded-full transition-colors disabled:opacity-30 disabled:cursor-not-allowed" 
              disabled={!onNextSong} 
              aria-label="Próxima Música"
              data-testid="next-song-btn"
            >
              <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>
          </div>
        )}

        {!isLocked && <div className="w-px h-6 sm:h-7 bg-border-main shrink-0" />}

        {/* Playback & Speed Controls */}
        <div className="flex items-center gap-2 sm:gap-3.5 shrink-0">
          {!isLocked && (
            <div className="flex flex-col gap-0.5 w-16 sm:w-24 md:w-28">
              <div className="flex justify-between text-[9px] sm:text-[10px] text-text-mute font-medium px-0.5">
                <span>{t('theater.slow')}</span>
                <span>{t('theater.fast')}</span>
              </div>
              <input 
                type="range" min="1" max="10" step="1" 
                value={speed} onChange={(e) => onSpeedChange(Number(e.target.value))}
                className="w-full accent-[#8629cc] h-1.5 bg-bg-elevated rounded-lg cursor-pointer"
                data-testid="speed-slider"
                aria-label="Velocidade da Rolagem"
              />
            </div>
          )}

          <button 
            onClick={onPlayPause}
            className="w-10 h-10 sm:w-12 sm:h-12 bg-[#8629cc] hover:bg-[#721eb8] flex items-center justify-center rounded-full transition-transform hover:scale-105 active:scale-95 shadow-lg shadow-[#8629cc]/20 shrink-0 disabled:opacity-50"
            data-testid="play-pause-btn"
            disabled={isLocked}
            aria-label={isScrolling ? 'Pausar Rolagem' : 'Iniciar Rolagem'}
          >
            {isScrolling ? (
              <Pause className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 fill-white text-white" />
            ) : (
              <Play className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 fill-white text-white ml-0.5" />
            )}
          </button>
        </div>

        {/* Transpose Controls - Only when not in singer mode and not locked */}
        {!isLocked && !isSingerMode && (
          <>
            <div className="w-px h-6 sm:h-7 bg-border-main shrink-0" />
            <div className="shrink-0">
              <TransposePad 
                currentKey={currentKey} 
                onTransposeDown={onTransposeDown} 
                onTransposeUp={onTransposeUp} 
                size="sm" 
              />
            </div>
          </>
        )}
      </nav>
    </div>
  );
};

