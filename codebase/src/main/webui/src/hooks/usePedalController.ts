import { useEffect, useCallback } from 'react';

export interface PedalKeyConfig {
  profile: 'default' | 'custom';
  scrollStepPercentage: number; // e.g. 65 means 65%
  mode: 'page_scroll' | 'autoscroll_toggle' | 'song_navigation';
  downKeys: string[];
  upKeys: string[];
  toggleScrollKeys: string[];
  nextSongKeys: string[];
  prevSongKeys: string[];
}

export interface PedalFeedback {
  key: string;
  action: 'scroll_down' | 'scroll_up' | 'toggle_autoscroll' | 'next_song' | 'prev_song';
  timestamp: number;
}

export const DEFAULT_PEDAL_CONFIG: PedalKeyConfig = {
  profile: 'default',
  scrollStepPercentage: 65,
  mode: 'page_scroll',
  downKeys: ['PageDown', 'ArrowDown', 'ArrowRight'],
  upKeys: ['PageUp', 'ArrowUp', 'ArrowLeft'],
  toggleScrollKeys: ['Space', 'Enter'],
  nextSongKeys: ['PageDown', 'ArrowDown', 'ArrowRight'],
  prevSongKeys: ['PageUp', 'ArrowUp', 'ArrowLeft'],
};

export const PEDAL_STORAGE_KEY = 'cifras_pedal_config';

export function getStoredPedalConfig(): PedalKeyConfig {
  try {
    const raw = localStorage.getItem(PEDAL_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      return {
        ...DEFAULT_PEDAL_CONFIG,
        ...parsed,
      };
    }
  } catch {
    // fallback on parsing failure
  }
  return DEFAULT_PEDAL_CONFIG;
}

export function saveStoredPedalConfig(config: PedalKeyConfig): void {
  try {
    localStorage.setItem(PEDAL_STORAGE_KEY, JSON.stringify(config));
  } catch {
    // ignore storage write errors
  }
}

export interface UsePedalControllerOptions {
  containerRef: React.RefObject<HTMLDivElement | null>;
  enabled?: boolean;
  onNextSong?: () => void;
  onPrevSong?: () => void;
  onToggleAutoScroll?: () => void;
  onPedalFeedback?: (feedback: PedalFeedback) => void;
  config?: PedalKeyConfig;
}

export const usePedalController = ({
  containerRef,
  enabled = true,
  onNextSong,
  onPrevSong,
  onToggleAutoScroll,
  onPedalFeedback,
  config: customConfig,
}: UsePedalControllerOptions) => {
  const activeConfig = customConfig || getStoredPedalConfig();

  const handleScrollByPercentage = useCallback(
    (direction: 'down' | 'up') => {
      const container = containerRef.current;
      if (!container) return;

      const clientHeight = container.clientHeight || window.innerHeight;
      const step = (clientHeight * (activeConfig.scrollStepPercentage || 65)) / 100;
      const currentScroll = container.scrollTop;
      const maxScroll = container.scrollHeight - clientHeight;

      if (direction === 'down') {
        if (currentScroll >= maxScroll - 15 && onNextSong) {
          onNextSong();
        } else {
          container.scrollBy({ top: step, behavior: 'smooth' });
        }
      } else {
        if (currentScroll <= 15 && onPrevSong) {
          onPrevSong();
        } else {
          container.scrollBy({ top: -step, behavior: 'smooth' });
        }
      }
    },
    [containerRef, activeConfig.scrollStepPercentage, onNextSong, onPrevSong]
  );

  useEffect(() => {
    if (!enabled) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null;
      if (
        target instanceof HTMLInputElement ||
        target instanceof HTMLTextAreaElement ||
        target instanceof HTMLSelectElement ||
        target?.isContentEditable
      ) {
        return;
      }

      const key = e.key;
      const code = e.code;

      const matchesKey = (allowed: string[]) =>
        allowed.some((k) => k === key || k === code || k.toLowerCase() === key.toLowerCase());

      const configToUse = customConfig || getStoredPedalConfig();

      if (configToUse.mode === 'autoscroll_toggle') {
        if (matchesKey(configToUse.toggleScrollKeys) || matchesKey(configToUse.downKeys) || matchesKey(configToUse.upKeys)) {
          e.preventDefault();
          onToggleAutoScroll?.();
          onPedalFeedback?.({ key, action: 'toggle_autoscroll', timestamp: Date.now() });
        }
      } else if (configToUse.mode === 'song_navigation') {
        if (matchesKey(configToUse.nextSongKeys)) {
          e.preventDefault();
          onNextSong?.();
          onPedalFeedback?.({ key, action: 'next_song', timestamp: Date.now() });
        } else if (matchesKey(configToUse.prevSongKeys)) {
          e.preventDefault();
          onPrevSong?.();
          onPedalFeedback?.({ key, action: 'prev_song', timestamp: Date.now() });
        }
      } else {
        // Default: 'page_scroll'
        if (matchesKey(configToUse.downKeys)) {
          e.preventDefault();
          handleScrollByPercentage('down');
          onPedalFeedback?.({ key, action: 'scroll_down', timestamp: Date.now() });
        } else if (matchesKey(configToUse.upKeys)) {
          e.preventDefault();
          handleScrollByPercentage('up');
          onPedalFeedback?.({ key, action: 'scroll_up', timestamp: Date.now() });
        } else if (matchesKey(configToUse.toggleScrollKeys) && onToggleAutoScroll) {
          e.preventDefault();
          onToggleAutoScroll();
          onPedalFeedback?.({ key, action: 'toggle_autoscroll', timestamp: Date.now() });
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [
    enabled,
    customConfig,
    handleScrollByPercentage,
    onNextSong,
    onPrevSong,
    onToggleAutoScroll,
    onPedalFeedback,
  ]);

  return {
    config: activeConfig,
    scrollDown: () => handleScrollByPercentage('down'),
    scrollUp: () => handleScrollByPercentage('up'),
  };
};
