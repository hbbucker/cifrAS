import React, { useRef, useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Play, Pause, ChevronDown, ChevronUp, Radio } from 'lucide-react';
import { usePedalController, type PedalKeyConfig, type PedalFeedback } from '../../hooks/usePedalController';

interface PedalSimulatorProps {
  config: PedalKeyConfig;
}

export const SAMPLE_CHORD_SHEET = `[Intro]
G  D  Em  C

[Verso 1]
G                 D
Lorem ipsum dolor sit amet
Em                C
Consectetur adipiscing elit
G                 D
Sed do eiusmod tempor incididunt
Em                C
Ut labore et dolore magna aliqua

[Refrão]
C                 G
Ut enim ad minim veniam
D                 Em
Quis nostrud exercitation ullamco
C                 G
Laboris nisi ut aliquip ex ea
D                 G
Commodo consequat duis aute

[Verso 2]
G                 D
Duis aute irure dolor in reprehenderit
Em                C
In voluptate velit esse cillum
G                 D
Dolore eu fugiat nulla pariatur
Em                C
Excepteur sint occaecat cupidatat

[Refrão]
C                 G
Ut enim ad minim veniam
D                 Em
Quis nostrud exercitation ullamco
C                 G
Laboris nisi ut aliquip ex ea
D                 G
Commodo consequat duis aute`;

export const PedalSimulator: React.FC<PedalSimulatorProps> = ({ config }) => {
  const { t } = useTranslation();
  const containerRef = useRef<HTMLDivElement>(null);
  const [feedback, setFeedback] = useState<PedalFeedback | null>(null);
  const [isAutoScrolling, setIsAutoScrolling] = useState(false);
  const [songIndex, setSongIndex] = useState(1);
  const totalSimulatedSongs = 3;

  const handleNextSong = () => {
    setSongIndex((prev) => (prev < totalSimulatedSongs ? prev + 1 : 1));
    if (containerRef.current) {
      containerRef.current.scrollTop = 0;
    }
  };

  const handlePrevSong = () => {
    setSongIndex((prev) => (prev > 1 ? prev - 1 : totalSimulatedSongs));
    if (containerRef.current) {
      containerRef.current.scrollTop = 0;
    }
  };

  const handleToggleAutoScroll = () => {
    setIsAutoScrolling((prev) => !prev);
  };

  const handleFeedback = (fb: PedalFeedback) => {
    setFeedback(fb);
  };

  // Clear feedback after 2 seconds
  useEffect(() => {
    if (!feedback) return;
    const timer = setTimeout(() => setFeedback(null), 2000);
    return () => clearTimeout(timer);
  }, [feedback]);

  // Handle auto-scroll simulation
  useEffect(() => {
    if (!isAutoScrolling) return;
    const interval = setInterval(() => {
      if (containerRef.current) {
        containerRef.current.scrollTop += 2;
      }
    }, 30);
    return () => clearInterval(interval);
  }, [isAutoScrolling]);

  const { scrollDown, scrollUp } = usePedalController({
    containerRef,
    enabled: true,
    config,
    onNextSong: handleNextSong,
    onPrevSong: handlePrevSong,
    onToggleAutoScroll: handleToggleAutoScroll,
    onPedalFeedback: handleFeedback,
  });

  const getActionLabel = (action?: string) => {
    switch (action) {
      case 'scroll_down':
        return t('pedal.actionScrollDown', 'Rolou para baixo');
      case 'scroll_up':
        return t('pedal.actionScrollUp', 'Rolou para cima');
      case 'toggle_autoscroll':
        return isAutoScrolling
          ? t('pedal.actionAutoScrollPaused', 'AutoScroll Pausado')
          : t('pedal.actionAutoScrollStarted', 'AutoScroll Iniciado');
      case 'next_song':
        return t('pedal.actionNextSong', 'Próxima Música da Playlist');
      case 'prev_song':
        return t('pedal.actionPrevSong', 'Música Anterior da Playlist');
      default:
        return '';
    }
  };

  return (
    <div
      className="bg-bg-card rounded-lg border border-border-main p-4 sm:p-5 flex flex-col h-full select-none"
      data-testid="pedal-simulator"
    >
      {/* Simulator Header */}
      <div className="flex items-center justify-between pb-3 border-b border-border-main mb-3">
        <div className="flex items-center gap-2">
          <span className="flex h-2.5 w-2.5 rounded-full bg-emerald-500 animate-pulse" />
          <h3 className="text-sm font-bold text-text-main">
            {t('pedal.simulatorTitle', 'Simulador de Palco (Modo Teatro)')}
          </h3>
        </div>
        <span className="text-[11px] font-medium px-2 py-0.5 rounded-full bg-[#aa3bff]/15 text-[#aa3bff] border border-[#aa3bff]/30">
          {t('pedal.simulatorBadge', 'Música')} {songIndex}/{totalSimulatedSongs}
        </span>
      </div>

      {/* Helper instruction */}
      <p className="text-xs text-text-mute mb-2">
        {t(
          'pedal.simulatorInstruction',
          'Pise no pedal físico conectado ou use os botões abaixo para simular as ações:'
        )}
      </p>

      {/* Interactive Mock Stage Container */}
      <div className="relative flex-1 min-h-[220px] max-h-[300px] rounded-md border border-border-main bg-bg-main overflow-hidden flex flex-col">
        {/* Floating Feedback HUD */}
        {feedback && (
          <div
            className="absolute top-2 left-1/2 -translate-x-1/2 z-20 px-3 py-1.5 rounded-full bg-[#aa3bff] text-white text-xs font-semibold shadow-md flex items-center gap-1.5 animate-bounce"
            data-testid="pedal-hud-feedback"
          >
            <Radio className="w-3.5 h-3.5 animate-spin" />
            <span>
              [{feedback.key}]: {getActionLabel(feedback.action)}
            </span>
          </div>
        )}

        {/* Scrollable Chord Content */}
        <div
          ref={containerRef}
          tabIndex={0}
          className="flex-1 overflow-y-auto p-3.5 font-mono text-xs sm:text-sm whitespace-pre-wrap leading-relaxed outline-none focus:ring-1 focus:ring-[#aa3bff]/40"
          data-testid="pedal-simulator-scroll-container"
        >
          {SAMPLE_CHORD_SHEET}
        </div>

        {/* Stage Simulated Status Bar */}
        <div className="bg-bg-card/90 border-t border-border-main px-3 py-1.5 flex items-center justify-between text-[11px] text-text-mute shrink-0">
          <span>{isAutoScrolling ? '▶ AutoScroll Ativo' : '⏸ Estático'}</span>
          <span>{t('pedal.scrollStepTitle', 'Salto')}: {config.scrollStepPercentage}%</span>
        </div>
      </div>

      {/* Manual Tester Controls */}
      <div className="mt-3 pt-3 border-t border-border-main flex items-center justify-between gap-2">
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={scrollUp}
            className="p-2 rounded-md bg-bg-elevated hover:bg-border-main text-text-main transition-colors text-xs font-medium flex items-center gap-1 min-h-[36px]"
            title={t('pedal.testScrollUp', 'Subir / Anterior')}
          >
            <ChevronUp className="w-4 h-4" />
            <span className="hidden sm:inline">{t('pedal.up', 'Subir')}</span>
          </button>
          <button
            type="button"
            onClick={scrollDown}
            className="p-2 rounded-md bg-bg-elevated hover:bg-border-main text-text-main transition-colors text-xs font-medium flex items-center gap-1 min-h-[36px]"
            title={t('pedal.testScrollDown', 'Descer / Próxima')}
          >
            <ChevronDown className="w-4 h-4" />
            <span className="hidden sm:inline">{t('pedal.down', 'Descer')}</span>
          </button>
        </div>

        <button
          type="button"
          onClick={handleToggleAutoScroll}
          className={`px-3 py-1.5 rounded-md text-xs font-bold flex items-center gap-1.5 min-h-[36px] transition-colors ${
            isAutoScrolling
              ? 'bg-amber-500 text-white hover:bg-amber-600'
              : 'bg-[#aa3bff] text-white hover:bg-[#9926f0]'
          }`}
        >
          {isAutoScrolling ? (
            <>
              <Pause className="w-3.5 h-3.5" /> {t('pedal.pause', 'Pausar')}
            </>
          ) : (
            <>
              <Play className="w-3.5 h-3.5" /> {t('pedal.play', 'AutoScroll')}
            </>
          )}
        </button>
      </div>
    </div>
  );
};
