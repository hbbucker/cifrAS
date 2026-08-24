import React from 'react';
import { useTranslation } from 'react-i18next';
import { Play, Pause, ChevronLeft, ChevronRight, Maximize, X, Lock, Unlock, Mic } from 'lucide-react';
import { TransposePad } from '../music/TransposePad';

interface TheaterControlsProps {
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
  isScrolling, speed, currentKey,
  onPlayPause, onSpeedChange, onTransposeUp, onTransposeDown,
  onNextSong, onPrevSong, onToggleFullscreen, onExit,
  onFontSizeIncrease, onFontSizeDecrease, className = '',
  isLocked = false, onLockToggle,
  isSingerMode = false, onToggleSingerMode
}) => {
  const { t } = useTranslation();

  return (
    <div className={`fixed bottom-4 sm:bottom-6 left-1/2 -translate-x-1/2 bg-bg-card/95 backdrop-blur-xl text-text-main px-3.5 sm:px-6 py-3 sm:py-4 rounded-3xl shadow-2xl border border-border-main flex flex-col md:flex-row items-center gap-3 md:gap-6 z-40 transition-all hover:bg-bg-card w-[94%] max-w-lg md:w-auto ${className}`} data-testid="theater-controls">
      
      {/* --- First Row (Mobile) / Left Group (Desktop) --- */}
      <div className="flex flex-row items-center justify-between w-full md:w-auto gap-2 md:gap-6">
        {/* Song Navigation */}
        {!isLocked && (
          <div className="flex items-center gap-1 md:gap-2 shrink-0">
            <button onClick={onPrevSong} className="p-2 min-h-[40px] min-w-[40px] sm:min-h-[44px] sm:min-w-[44px] flex items-center justify-center hover:bg-bg-elevated rounded-full transition-colors disabled:opacity-30 disabled:cursor-not-allowed" disabled={!onPrevSong} data-testid="prev-song-btn">
              <ChevronLeft className="w-5 h-5 sm:w-6 sm:h-6" />
            </button>
            <button onClick={onNextSong} className="p-2 min-h-[40px] min-w-[40px] sm:min-h-[44px] sm:min-w-[44px] flex items-center justify-center hover:bg-bg-elevated rounded-full transition-colors disabled:opacity-30 disabled:cursor-not-allowed" disabled={!onNextSong} data-testid="next-song-btn">
              <ChevronRight className="w-5 h-5 sm:w-6 sm:h-6" />
            </button>
          </div>
        )}

        {!isLocked && <div className="w-px h-8 bg-border-main hidden md:block shrink-0" />}

        {/* Playback & Speed */}
        <div className="flex items-center gap-2.5 sm:gap-4 flex-1 justify-end md:justify-start">
          {!isLocked && (
            <div className="flex flex-col gap-1 w-20 sm:w-28 md:w-32">
              <div className="flex justify-between text-[10px] md:text-xs text-text-mute font-medium px-1">
                <span>{t('theater.slow')}</span>
                <span>{t('theater.fast')}</span>
              </div>
              <input 
                type="range" min="1" max="10" step="1" 
                value={speed} onChange={(e) => onSpeedChange(Number(e.target.value))}
                className="w-full accent-[#8629cc]"
                data-testid="speed-slider"
              />
            </div>
          )}

          <button 
            onClick={onPlayPause}
            className="w-11 h-11 sm:w-12 sm:h-12 md:w-14 md:h-14 bg-[#8629cc] hover:bg-[#721eb8] flex items-center justify-center rounded-full transition-transform hover:scale-105 active:scale-95 shadow-lg shadow-[#8629cc]/20 shrink-0 disabled:opacity-50"
            data-testid="play-pause-btn"
            disabled={isLocked}
          >
            {isScrolling ? <Pause className="w-5 h-5 sm:w-6 sm:h-6 md:w-7 md:h-7 fill-white text-white" /> : <Play className="w-5 h-5 sm:w-6 sm:h-6 md:w-7 md:h-7 fill-white text-white ml-0.5" />}
          </button>
        </div>
      </div>

      {!isLocked && <div className="w-full h-px bg-border-main block md:hidden" />}
      {!isLocked && <div className="w-px h-8 bg-border-main hidden md:block shrink-0" />}

      {/* --- Second Row (Mobile) / Right Group (Desktop) --- */}
      <div className="flex flex-row items-center justify-between w-full md:w-auto gap-1.5 sm:gap-3 md:gap-6 overflow-x-auto no-scrollbar py-0.5">
        
        {!isLocked && (
          <>
            {/* Transpose - only when not in Singer Mode */}
            {!isSingerMode && (
              <>
                <div className="shrink-0">
                  <TransposePad currentKey={currentKey} onTransposeDown={onTransposeDown} onTransposeUp={onTransposeUp} size="sm" />
                </div>
                <div className="w-px h-6 bg-border-main shrink-0" />
              </>
            )}
            
            {/* Font Size */}
            <div className="flex items-center gap-0.5 shrink-0">
              <button onClick={onFontSizeDecrease} className="p-2 min-h-[36px] min-w-[36px] sm:min-h-[40px] sm:min-w-[40px] flex items-center justify-center hover:bg-bg-elevated rounded-lg transition-colors text-text-mute hover:text-text-main font-bold text-xs sm:text-sm" title={t('theater.decreaseFont')} data-testid="decrease-font-btn">
                {t('theater.aMinus')}
              </button>
              <button onClick={onFontSizeIncrease} className="p-2 min-h-[36px] min-w-[36px] sm:min-h-[40px] sm:min-w-[40px] flex items-center justify-center hover:bg-bg-elevated rounded-lg transition-colors text-text-mute hover:text-text-main font-bold text-sm sm:text-base" title={t('theater.increaseFont')} data-testid="increase-font-btn">
                {t('theater.aPlus')}
              </button>
            </div>

            <div className="w-px h-6 bg-border-main shrink-0" />
          </>
        )}

        {/* Display Options */}
        <div className="flex items-center gap-0.5 sm:gap-1 shrink-0">
          {!isLocked && (
            <button 
              onClick={onToggleSingerMode}
              className={`p-2 sm:p-2.5 md:p-3 min-h-[38px] min-w-[38px] sm:min-h-[44px] sm:min-w-[44px] flex items-center justify-center hover:bg-bg-elevated rounded-full transition-colors ${isSingerMode ? 'bg-[#8629cc]/15 text-[#8629cc] ring-1 ring-[#8629cc]/30' : 'text-text-mute hover:text-text-main'}`}
              title={isSingerMode ? t('theater.chordsMode') : t('theater.singerMode')} 
              aria-label={isSingerMode ? t('theater.chordsMode') : t('theater.singerMode')}
              data-testid="singer-mode-btn"
            >
              <Mic className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>
          )}

          <button 
            onClick={onLockToggle}
            className={`p-2 sm:p-2.5 md:p-3 min-h-[38px] min-w-[38px] sm:min-h-[44px] sm:min-w-[44px] flex items-center justify-center hover:bg-bg-elevated rounded-full transition-colors ${isLocked ? 'text-[#8629cc]' : 'text-text-mute hover:text-text-main'}`}
            title={isLocked ? t('theater.unlock') : t('theater.lock')} 
            data-testid="lock-mode-btn"
          >
            {isLocked ? <Lock className="w-4 h-4 sm:w-5 sm:h-5" /> : <Unlock className="w-4 h-4 sm:w-5 sm:h-5" />}
          </button>

          {!isLocked && (
            <button onClick={onToggleFullscreen} className="p-2 sm:p-2.5 md:p-3 min-h-[38px] min-w-[38px] sm:min-h-[44px] sm:min-w-[44px] flex items-center justify-center hover:bg-bg-elevated rounded-full transition-colors text-text-mute hover:text-text-main" title={t('theater.fullscreen')} data-testid="fullscreen-btn">
              <Maximize className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>
          )}

          <button onClick={onExit} className="p-2 sm:p-2.5 md:p-3 min-h-[38px] min-w-[38px] sm:min-h-[44px] sm:min-w-[44px] flex items-center justify-center hover:bg-red-500/20 rounded-full transition-colors text-text-mute hover:text-red-500" title={t('theater.exit')} data-testid="exit-theater-btn">
            <X className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>
        </div>
      </div>

    </div>
  );
};
