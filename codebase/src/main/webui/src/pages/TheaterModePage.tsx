import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { TheaterControls } from '../components/theater/TheaterControls';
import { useAutoScroll } from '../hooks/useAutoScroll';
import { ChordSheet } from '../components/music/ChordSheet';
import { transposeContent } from '../utils/chordTransposer';
import { stringifyLyrics } from '../utils/lyricsParser';
import { Settings2 } from 'lucide-react';
import { useToast } from '../context/ToastContext';
import { apiClient } from '../services/authService';

interface SongData {
 id: string;
 [key: string]: unknown;
}

export const TheaterModePage: React.FC = () => {
 const navigate = useNavigate();
 const { playlistId, songId } = useParams();
 const location = useLocation();
 const passedState = location.state as { autoScrollSpeed?: number, useBb?: boolean, useEb?: boolean, transposeSteps?: number } | null;
 const { toast } = useToast();
 
 const initialSpeed = passedState?.autoScrollSpeed !== undefined ? passedState.autoScrollSpeed : 1;
 const { isScrolling, speed, play, pause, setSpeed, containerRef } = useAutoScroll(initialSpeed);


 const [song, setSong] = useState({
 title: 'Loading...',
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
 
 const isMobile = typeof window !== 'undefined' && window.innerWidth < 768;
 const [showControls, setShowControls] = useState(!isMobile);
 const [fontSize, setFontSize] = useState<number>(isMobile ? 24 : 32);

 // Fetch playlist queue if playlistId is provided
 useEffect(() => {
 if (playlistId) {
 apiClient.get(`/playlists/${playlistId}`)
 .then(res => res.data)
 .then(data => {
 if (data.songs && data.songs.length > 0) {
 setPlaylistSongs(data.songs);
 setCurrentPlaylistIndex(0);
 } else {
 setSong({ title: 'Playlist is empty', artist: '', originalKey: 'C', content: '' });
 }
 })
 .catch(() => {
 toast('Failed to load playlist queue', 'error');
 });
 }
 }, [playlistId, toast]);

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
    if (song.title === 'Loading...' || !activeSongId) return;
    
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
  }, [speed, transposeSteps, fontSize, activeSongId, song.title, useBb, useEb]);

 const handleNextSong = () => {
 if (playlistId && currentPlaylistIndex < playlistSongs.length - 1) {
 setSlideDir('right');
 setCurrentPlaylistIndex(prev => prev + 1);
 }
 };

 const handlePrevSong = () => {
 if (playlistId && currentPlaylistIndex > 0) {
 setSlideDir('left');
 setCurrentPlaylistIndex(prev => prev - 1);
 }
 };

  const handleFontSizeChange = (delta: number) => {
    setFontSize(prev => Math.max(14, Math.min(60, prev + delta)));
  };

 const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
 setScrollTop(e.currentTarget.scrollTop);
 };

 const currentKey = transposeContent(song.originalKey, transposeSteps, useBb, useEb);
 const transposedContent = transposeContent(song.content, transposeSteps, useBb, useEb);

 // Swipe logic
 const [touchStart, setTouchStart] = useState<number | null>(null);
 const [touchEnd, setTouchEnd] = useState<number | null>(null);

 const minSwipeDistance = 50;

 const onTouchStart = (e: React.TouchEvent) => {
 setTouchEnd(null); // otherwise the swipe is fired even with usual touch events
 setTouchStart(e.targetTouches[0].clientX);
 };

 const onTouchMove = (e: React.TouchEvent) => {
 setTouchEnd(e.targetTouches[0].clientX);
 };

 const onTouchEnd = () => {
 if (!touchStart || !touchEnd) return;
 const distance = touchStart - touchEnd;
 const isLeftSwipe = distance > minSwipeDistance;
 const isRightSwipe = distance < -minSwipeDistance;

 if (isLeftSwipe) {
 handleNextSong();
 }
 if (isRightSwipe) {
 handlePrevSong();
 }
 };

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

 return (
 <div 
 className="h-screen w-full bg-bg-main text-text-main overflow-hidden relative flex flex-col font-sans"
 onTouchStart={onTouchStart}
 onTouchMove={onTouchMove}
 onTouchEnd={onTouchEnd}
 >
 {/* Header becomes semi-transparent when scrolling */}
 <header 
 className="p-4 flex flex-col md:flex-row items-start md:items-center justify-between absolute top-0 left-0 right-0 z-10 bg-gradient-to-b from-bg-main via-bg-main/80 to-transparent pointer-events-none transition-opacity duration-200"
 style={{ opacity: headerOpacity }}
 >
 <div className="pt-2 md:pt-0">
 <h1 className="text-xl md:text-2xl font-bold truncate max-w-full">{song.title}</h1>
 <p className="text-sm md:text-base text-text-mute truncate max-w-full">{song.artist}</p>
 </div>
 </header>

 {/* Main scrolling container */}
 <div 
 key={activeSongId}
 ref={containerRef} 
 onScroll={handleScroll}
 className="flex-1 overflow-y-auto px-4 md:px-12 pt-28 pb-48 no-scrollbar"
 style={{
 animation: `${slideDir === 'right' ? 'slideInRight' : 'slideInLeft'} 0.4s cubic-bezier(0.2, 0.8, 0.2, 1) forwards`
 }}
 data-testid="theater-scroll-container"
 >
 <div className="max-w-4xl mx-auto text-text-main">
 <ChordSheet content={transposedContent} fontSize={fontSize} transparent={true} />
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
 <div className="md:hidden fixed bottom-6 left-6 z-50">
 <button 
 onClick={() => setShowControls(!showControls)}
 className={`w-14 h-14 rounded-full flex items-center justify-center shadow-2xl transition-all duration-300 ${showControls ? 'bg-bg-elevated text-text-mute' : 'bg-[#8629cc] text-white'}`}
 >
 <Settings2 className="w-6 h-6" />
 </button>
 </div>

 <TheaterControls 
 className={!showControls && isMobile ? 'translate-y-48 opacity-0 pointer-events-none' : 'translate-y-0 opacity-100'}
 isScrolling={isScrolling}
 speed={speed}
 currentKey={currentKey}
 onPlayPause={() => isScrolling ? pause() : play()}
 onSpeedChange={setSpeed}
 onTransposeUp={() => setTransposeSteps(s => s + 1)}
 onTransposeDown={() => setTransposeSteps(s => s - 1)}
 onNextSong={playlistId ? handleNextSong : undefined}
 onPrevSong={playlistId ? handlePrevSong : undefined}
 onToggleFullscreen={toggleFullscreen}
 onExit={handleExit}
 onFontSizeIncrease={() => handleFontSizeChange(2)}
 onFontSizeDecrease={() => handleFontSizeChange(-2)}
 />
 </div>
 );
};
