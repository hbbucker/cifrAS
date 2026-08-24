import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate, useParams, useLocation, useSearchParams } from 'react-router-dom';
import { TheaterControls } from '../components/theater/TheaterControls';
import { useAutoScroll } from '../hooks/useAutoScroll';
import { ChordSheet } from '../components/music/ChordSheet';
import { transposeContent } from '../utils/chordTransposer';
import { stringifyLyrics } from '../utils/lyricsParser';
import { Settings2 } from 'lucide-react';
import { useToast } from '../context/ToastContext';
import { apiClient } from '../services/authService';
import { usePerformanceSession } from '../hooks/usePerformanceSession';
import { useTranslation } from 'react-i18next';

interface SongData {
 id: string;
 [key: string]: unknown;
}

export const TheaterModePage: React.FC = () => {
 const { t } = useTranslation();
 const navigate = useNavigate();
 const { playlistId, songId } = useParams();
 const location = useLocation();
 const [routerSearchParams] = useSearchParams();
 const searchParams = useMemo(() => {
   if (location.search) {
     return new URLSearchParams(location.search);
   }
   return routerSearchParams;
 }, [location.search, routerSearchParams]);

 const passedState = location.state as { 
   autoScrollSpeed?: number, 
   useBb?: boolean, 
   useEb?: boolean, 
   transposeSteps?: number,
   songIndex?: number,
   startIndex?: number,
   songId?: string 
 } | null;
 const { toast } = useToast();

 const querySongId = searchParams.get('songId');
 const queryIndexParam = searchParams.get('startIndex') ?? searchParams.get('index') ?? searchParams.get('songIndex');
 const queryIndex = queryIndexParam !== null ? parseInt(queryIndexParam, 10) : undefined;
 const stateSongId = passedState?.songId;
 const stateIndex = passedState?.songIndex ?? passedState?.startIndex;
 
 const initialSpeed = passedState?.autoScrollSpeed !== undefined ? passedState.autoScrollSpeed : 1;
 const { isScrolling, speed, play, pause, setSpeed, containerRef } = useAutoScroll(initialSpeed);


 const [song, setSong] = useState({
 title: t('playlistView.loading'),
 artist: '',
 originalKey: 'C',
 content: ''
 });

 const [playlistSongs, setPlaylistSongs] = useState<SongData[]>([]);
 const [currentPlaylistIndex, setCurrentPlaylistIndex] = useState<number>(0);
 const [transposeSteps, setTransposeSteps] = useState(passedState?.transposeSteps ?? 0);
 const useBb = passedState?.useBb ?? false;
 const useEb = passedState?.useEb ?? false;
 const [scrollTop, setScrollTop] = useState(0);
 const [slideDir, setSlideDir] = useState<'right'|'left'>('right');
 const [isLocked, setIsLocked] = useState(false);
 const [isSingerMode, setIsSingerMode] = useState(false);
 // eslint-disable-next-line @typescript-eslint/no-explicit-any
 const wakeLockRef = React.useRef<any>(null);
 
 useEffect(() => {
 if (isLocked && 'wakeLock' in navigator) {
 // eslint-disable-next-line @typescript-eslint/no-explicit-any
 (navigator as any).wakeLock.request('screen')
 // eslint-disable-next-line @typescript-eslint/no-explicit-any
 .then((lock: any) => { wakeLockRef.current = lock; })
 .catch(console.error);
 } else if (!isLocked && wakeLockRef.current) {
 wakeLockRef.current.release();
 wakeLockRef.current = null;
 }
 return () => {
 if (wakeLockRef.current) {
 wakeLockRef.current.release();
 wakeLockRef.current = null;
 }
 };
 }, [isLocked]);
  const hasExplicitTarget = Boolean(
    querySongId ||
    stateSongId ||
    (queryIndex !== undefined && !isNaN(queryIndex)) ||
    stateIndex !== undefined
  );

  const { activeSession, saveProgress, clearSession } = usePerformanceSession();
  const [showResumePrompt, setShowResumePrompt] = useState(false);
  const hasPromptedRef = React.useRef(hasExplicitTarget);
 
 const isMobile = typeof window !== 'undefined' && window.innerWidth < 768;
 const [showControls, setShowControls] = useState(!isMobile);
 const [fontSize, setFontSize] = useState<number>(isMobile ? 24 : 32);
 const [lastInteraction, setLastInteraction] = useState<number>(0);

 useEffect(() => {
   if (showControls) {
     const timer = setTimeout(() => setShowControls(false), 4000);
     return () => clearTimeout(timer);
   }
 }, [showControls, lastInteraction]);

 // Fetch playlist queue if playlistId is provided
 useEffect(() => {
 if (playlistId) {
 apiClient.get(`/playlists/${playlistId}`)
 .then(res => res.data)
 .then(data => {
 if (data.songs && data.songs.length > 0) {
 setPlaylistSongs(data.songs);
 
 const targetSongId = querySongId || stateSongId;
 let targetIndex = -1;

 if (targetSongId) {
   targetIndex = data.songs.findIndex((s: SongData) => s.id === targetSongId);
 }

 if (targetIndex === -1) {
   const possibleIndex = queryIndex !== undefined && !isNaN(queryIndex) ? queryIndex : stateIndex;
   if (typeof possibleIndex === 'number' && !isNaN(possibleIndex) && possibleIndex >= 0 && possibleIndex < data.songs.length) {
     targetIndex = possibleIndex;
   }
 }

 if (targetIndex === -1) {
   targetIndex = 0;
 }

 setCurrentPlaylistIndex(targetIndex);
 } else {
 setSong({ title: t('playlistView.noSongs'), artist: '', originalKey: 'C', content: '' });
 }
 })
 .catch(() => {
 toast('Failed to load playlist queue', 'error');
 });
 }
 }, [playlistId, toast, t, querySongId, stateSongId, queryIndex, stateIndex]);

  // Fetch full song details and preferences for the active song ID
  const activeSongId = playlistId && playlistSongs.length > 0 ? playlistSongs[currentPlaylistIndex].id : songId;

  useEffect(() => {
    if (activeSongId) {
      // First fetch the song details
      apiClient.get(`/songs/${activeSongId}`)
        .then(res => res.data)
        .then(data => {
          const key = data.originalKey || data.keySignature || 'C';
          setSong({
            title: data.title,
            artist: data.artist,
            originalKey: key,
            content: stringifyLyrics(data.lyrics)
          });
        })
        .catch(() => toast('Failed to load song details', 'error'));

      // Then fetch the theater preferences for this specific song
      if (!passedState) {
        apiClient.get(`/theater/song-preferences/${activeSongId}`)
          .then(res => {
            if (res.status === 200 && res.data) {
              const pref = res.data;
              if (pref.autoScrollSpeed != null) setSpeed(pref.autoScrollSpeed);
              if (pref.transposeSteps != null) setTransposeSteps(pref.transposeSteps);
              if (pref.fontSize != null) setFontSize(pref.fontSize);
            } else {
              setTransposeSteps(0);
              setSpeed(1);
              setFontSize(isMobile ? 24 : 32); // defaults if no preference
            }
          })
          .catch(() => {
            setTransposeSteps(0);
            setSpeed(1);
            setFontSize(isMobile ? 24 : 32);
          });
      }
    }
  }, [activeSongId, isMobile, toast, passedState, setSpeed]);

  // Persist preferences
  useEffect(() => {
    if (song.title === t('playlistView.loading') || !activeSongId) return;
    
    const handler = setTimeout(() => {
      apiClient.put(`/theater/session`, {
        songId: activeSongId,
        autoScrollSpeed: speed,
        transposeSteps: transposeSteps,
        fontSize: fontSize
      }).catch(err => console.error('Failed to save theater session preferences', err));

      apiClient.put(`/songs/${activeSongId}/preferences`, {
        prefUseBb: useBb,
        prefUseEb: useEb,
        prefAutoScrollSpeed: speed,
        prefTransposeSteps: transposeSteps
      }).catch(err => console.error('Failed to save song preferences', err));
    }, 1000);
    
    return () => clearTimeout(handler);
  }, [speed, transposeSteps, fontSize, activeSongId, song.title, useBb, useEb, t]);

  useEffect(() => {
    if (hasExplicitTarget) return;

    if (activeSession && playlistId && !hasPromptedRef.current) {
      hasPromptedRef.current = true;
      if (activeSession.playlistId === playlistId) {
        if (activeSession.currentSongIndex !== currentPlaylistIndex || activeSession.scrollPosition > 0) {
          // eslint-disable-next-line react-hooks/set-state-in-effect
          setShowResumePrompt(true);
        }
      }
    }
  }, [activeSession, playlistId, currentPlaylistIndex, hasExplicitTarget]);

  useEffect(() => {
    if (playlistId && activeSongId && song.title !== t('playlistView.loading')) {
      saveProgress(playlistId, currentPlaylistIndex, scrollTop);
    }
  }, [playlistId, currentPlaylistIndex, scrollTop, saveProgress, activeSongId, song.title, t]);

  const handleNextSong = React.useCallback(() => {
    if (playlistId && currentPlaylistIndex < playlistSongs.length - 1) {
      setSlideDir('right');
      setCurrentPlaylistIndex(prev => prev + 1);
    }
  }, [playlistId, currentPlaylistIndex, playlistSongs.length]);

  const handlePrevSong = React.useCallback(() => {
    if (playlistId && currentPlaylistIndex > 0) {
      setSlideDir('left');
      setCurrentPlaylistIndex(prev => prev - 1);
    }
  }, [playlistId, currentPlaylistIndex]);

  const handleFontSizeChange = (delta: number) => {
    setFontSize(prev => Math.max(10, Math.min(60, prev + delta)));
  };

  // Auto-fit: flag resets whenever the active song changes so each song gets a fresh fit.
  // font-mono char width ≈ fontSize × 0.601 (monospace invariant).
  const autoFitAppliedRef = React.useRef(false);

  useEffect(() => {
    autoFitAppliedRef.current = false;
  }, [activeSongId]);

 const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
 const newScrollTop = e.currentTarget.scrollTop;
 if (Math.abs(newScrollTop - scrollTop) > 5) {
 if (showControls) setShowControls(false);
 }
 setScrollTop(newScrollTop);
 };

 const currentKey = transposeContent(song.originalKey, transposeSteps, useBb, useEb);
 const transposedContent = transposeContent(song.content, transposeSteps, useBb, useEb);

  // Auto-fit: compute the ideal starting font size that prevents horizontal overflow.
  // Runs after transposedContent is available. font-mono char width ≈ fontSize × 0.601.
  useEffect(() => {
    const container = containerRef.current;
    if (!container || !transposedContent) return;

    const recalculate = () => {
      // Available width subtracts px-4 (mobile) or px-12 (md) padding
      const isMd = window.innerWidth >= 768;
      const availableWidth = container.clientWidth - (isMd ? 96 : 32);
      if (availableWidth <= 0) return;

      const lines = transposedContent.split('\n');
      const maxLineLength = Math.max(...lines.map(l => l.length), 1);

      // Solve: availableWidth >= maxLineLength * fontSize * 0.601
      const maxFit = Math.floor(availableWidth / (maxLineLength * 0.601));
      const fitted = Math.max(10, maxFit);

      // Apply only once per song load, and only when there are no saved preferences.
      if (!autoFitAppliedRef.current && !passedState) {
        autoFitAppliedRef.current = true;
        setFontSize(prev => {
          const defaultSize = isMobile ? 24 : 32;
          return prev === defaultSize ? fitted : prev;
        });
      }
    };

    recalculate();
    if (typeof ResizeObserver !== 'undefined') {
      const observer = new ResizeObserver(recalculate);
      observer.observe(container);
      return () => observer.disconnect();
    }
  }, [transposedContent, containerRef, passedState, isMobile]);


  // Swipe logic
  const [touchStart, setTouchStart] = useState<{ x: number; y: number } | null>(null);
  const [touchEnd, setTouchEnd] = useState<{ x: number; y: number } | null>(null);

  // Minimum horizontal distance for a swipe to register as song navigation
  const minSwipeDistance = 100;

  const onTouchStart = (e: React.TouchEvent) => {
  setLastInteraction(Date.now());
  setTouchEnd(null); // otherwise the swipe is fired even with usual touch events
  setTouchStart({ x: e.targetTouches[0].clientX, y: e.targetTouches[0].clientY });
  };

  const onTouchMove = (e: React.TouchEvent) => {
  setTouchEnd({ x: e.targetTouches[0].clientX, y: e.targetTouches[0].clientY });
  };

  const onTouchEnd = () => {
    if (isLocked) return;
    if (!touchStart || !touchEnd) return;
    const distanceX = touchStart.x - touchEnd.x;
    const distanceY = Math.abs(touchStart.y - touchEnd.y);

    // If vertical movement is dominant, treat as scroll — ignore song navigation
    if (distanceY > Math.abs(distanceX)) return;

    const isLeftSwipe = distanceX > minSwipeDistance;
    const isRightSwipe = distanceX < -minSwipeDistance;

    if (isLeftSwipe) {
      handleNextSong();
    } else if (isRightSwipe) {
      handlePrevSong();
    }
  };

  // Keyboard accessibility for stage / pedal controllers
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
      if (isLocked) return;
      if (e.key === 'ArrowRight') {
        handleNextSong();
      } else if (e.key === 'ArrowLeft') {
        handlePrevSong();
      } else if (e.key === ' ' || e.code === 'Space') {
        e.preventDefault();
        if (isScrolling) {
          pause();
        } else {
          play();
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isLocked, isScrolling, pause, play, handleNextSong, handlePrevSong]);

  // Fake full screen logic
  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
    } else {
      document.exitFullscreen().catch(() => {});
    }
  };

  useEffect(() => {
    // Cleanup fullscreen on exit
    return () => {
      if (document.fullscreenElement) {
        document.exitFullscreen().catch(() => {});
      }
    };
  }, []);

  const handleExit = () => {
    if (window.history.state && window.history.state.idx > 0) {
      navigate(-1);
    } else {
      navigate(playlistId ? `/playlists/${playlistId}` : songId ? `/song/${songId}` : '/songs');
    }
  };

  // Calculate opacity based on scroll position (1.0 at top, down to 0.2 after 200px)
  const headerOpacity = Math.max(0.2, 1 - scrollTop / 200);

  const hasNextSong = Boolean(playlistId && playlistSongs.length > 0 && currentPlaylistIndex < playlistSongs.length - 1);
  const hasPrevSong = Boolean(playlistId && playlistSongs.length > 0 && currentPlaylistIndex > 0);

  return (
    <div 
      className="h-screen w-full bg-bg-main text-text-main overflow-hidden relative flex flex-col font-sans"
      onTouchStart={onTouchStart}
      onTouchMove={onTouchMove}
      onTouchEnd={onTouchEnd}
      onClick={(e) => {
        setLastInteraction(Date.now());
        if (e.target instanceof Element && e.target.closest('button, a, input, [role="button"]')) return;
        setShowControls(prev => !prev);
      }}
    >
      {/* Header becomes semi-transparent when scrolling */}
      <header 
        className="px-4 py-3 sm:p-4 flex flex-col md:flex-row items-start md:items-center justify-between absolute top-0 left-0 right-0 z-10 bg-gradient-to-b from-bg-main via-bg-main/80 to-transparent pointer-events-none transition-opacity duration-200"
        style={{ opacity: headerOpacity }}
      >
        <div className="pt-1 md:pt-0">
          <h1 className="text-lg sm:text-xl md:text-2xl font-bold truncate max-w-full">{song.title}</h1>
          <p className="text-xs sm:text-sm md:text-base text-text-mute truncate max-w-full">{song.artist}</p>
        </div>
      </header>

      {/* Main scrolling container */}
      <div 
        key={activeSongId}
        ref={containerRef} 
        onScroll={handleScroll}
        className="flex-1 overflow-y-auto px-3.5 sm:px-6 md:px-12 pt-20 sm:pt-24 md:pt-28 pb-48 no-scrollbar"
        style={{
          animation: `${slideDir === 'right' ? 'slideInRight' : 'slideInLeft'} 0.4s cubic-bezier(0.2, 0.8, 0.2, 1) forwards`
        }}
        data-testid="theater-scroll-container"
      >
        <div className="max-w-4xl mx-auto text-text-main">
          <ChordSheet content={transposedContent} fontSize={fontSize} transparent={true} singerMode={isSingerMode} />
        </div>
      </div>

      <style>{`
        @keyframes slideInRight {
          from { transform: translateX(50px); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
        }
        @keyframes slideInLeft {
          from { transform: translateX(-50px); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
        }
      `}</style>

      {/* Floating Action Button (Mobile) to toggle controls */}
      <div className="md:hidden fixed bottom-4 left-4 sm:bottom-6 sm:left-6 z-50">
        <button 
          onClick={() => setShowControls(!showControls)}
          className={`w-12 h-12 sm:w-14 sm:h-14 rounded-full flex items-center justify-center shadow-2xl transition-all duration-300 ${showControls ? 'bg-bg-elevated text-text-mute' : 'bg-[#8629cc] text-white'}`}
          aria-label="Toggle Theater Controls"
        >
          <Settings2 className="w-5 h-5 sm:w-6 sm:h-6" />
        </button>
      </div>

      {showResumePrompt && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm" data-testid="resume-prompt">
          <div className="bg-bg-card p-6 rounded-2xl shadow-xl border border-border-main max-w-sm w-full mx-4">
            <h3 className="text-xl font-bold mb-2">{t('theater.resumeSessionPromptTitle')}</h3>
            <p className="text-text-mute mb-6">{t('theater.resumeSessionPromptDesc')}</p>
            <div className="flex justify-end gap-3">
              <button 
                onClick={() => {
                  setShowResumePrompt(false);
                  clearSession();
                }}
                className="px-4 py-2 rounded-lg font-medium text-text-mute hover:bg-bg-elevated transition-colors"
                data-testid="resume-no-btn"
              >
                {t('theater.startFresh')}
              </button>
              <button 
                onClick={() => {
                  setShowResumePrompt(false);
                  setCurrentPlaylistIndex(activeSession?.currentSongIndex || 0);
                  if (containerRef.current) {
                    containerRef.current.scrollTop = activeSession?.scrollPosition || 0;
                  }
                }}
                className="px-4 py-2 rounded-lg font-medium bg-[#8629cc] text-white hover:bg-[#721eb8] transition-colors shadow-lg shadow-[#8629cc]/20"
                data-testid="resume-yes-btn"
              >
                {t('theater.resume')}
              </button>
            </div>
          </div>
        </div>
      )}

      <TheaterControls 
        className={!showControls ? 'translate-y-48 opacity-0 pointer-events-none' : 'translate-y-0 opacity-100'}
        isScrolling={isScrolling}
        speed={speed}
        currentKey={currentKey}
        onPlayPause={() => isScrolling ? pause() : play()}
        onSpeedChange={setSpeed}
        onTransposeUp={() => setTransposeSteps(s => s + 1)}
        onTransposeDown={() => setTransposeSteps(s => s - 1)}
        onNextSong={hasNextSong ? handleNextSong : undefined}
        onPrevSong={hasPrevSong ? handlePrevSong : undefined}
        onToggleFullscreen={toggleFullscreen}
        onExit={handleExit}
        onFontSizeIncrease={() => handleFontSizeChange(2)}
        onFontSizeDecrease={() => handleFontSizeChange(-2)}
        isLocked={isLocked}
        onLockToggle={() => setIsLocked(!isLocked)}
        isSingerMode={isSingerMode}
        onToggleSingerMode={() => setIsSingerMode(prev => !prev)}
      />
    </div>
  );
};
