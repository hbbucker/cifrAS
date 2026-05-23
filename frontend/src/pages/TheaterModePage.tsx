import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { TheaterControls } from '../components/theater/TheaterControls';
import { useAutoScroll } from '../hooks/useAutoScroll';

export const TheaterModePage: React.FC = () => {
  const navigate = useNavigate();
  const { playlistId } = useParams();
  
  const { isScrolling, speed, play, pause, setSpeed, containerRef } = useAutoScroll(3);
  const [currentKey, setCurrentKey] = useState('G');
  
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

  const mockContent = `[Intro]
G D Em C

[Verse 1]
G                 D
I took a pill in Ibiza
                 Em                     C
To show Avicii I was cool
G                         D
And when I finally got sober, felt 10 years older
Em                        C
But fuck it, it was something to do`;

  // Repeat content to make it scrollable
  const fullContent = Array(15).fill(mockContent).join('\n\n');

  return (
    <div className="h-screen w-full bg-black text-white overflow-hidden relative flex flex-col font-sans">
      {/* Header hidden when scrolling to maximize space */}
      <header className={`p-4 flex items-center justify-between absolute top-0 left-0 right-0 z-10 bg-gradient-to-b from-black/80 to-transparent transition-opacity duration-500 ${isScrolling ? 'opacity-0' : 'opacity-100'}`}>
        <div>
          <h1 className="text-2xl font-bold">I Took A Pill In Ibiza</h1>
          <p className="text-gray-400">Mike Posner • Song 1 of 3</p>
        </div>
        <button 
          onClick={() => navigate(playlistId ? `/playlists/${playlistId}` : '/songs')}
          className="px-4 py-2 bg-white/10 hover:bg-white/20 rounded-full font-medium transition-colors"
          data-testid="exit-theater-btn"
        >
          Exit Theater
        </button>
      </header>

      {/* Main scrolling container */}
      <div 
        ref={containerRef} 
        className="flex-1 overflow-y-auto px-4 md:px-12 pt-28 pb-48 no-scrollbar"
        style={{ scrollBehavior: 'smooth' }}
        data-testid="theater-scroll-container"
      >
        <div className="max-w-4xl mx-auto">
          {/* Overriding ChordSheet styles for dark theater mode */}
          <div className="text-2xl md:text-4xl leading-relaxed whitespace-pre font-mono font-bold text-gray-300">
            {fullContent.split('\n').map((line, i) => {
              const isChord = line.trim().length > 0 && /^[A-G][#b]?[m]?\s*/.test(line.trim());
              return (
                <div key={i} className={isChord ? 'text-[#aa3bff]' : ''}>
                  {line || ' '}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <TheaterControls 
        isScrolling={isScrolling}
        speed={speed}
        currentKey={currentKey}
        onPlayPause={() => isScrolling ? pause() : play()}
        onSpeedChange={setSpeed}
        onTransposeUp={() => setCurrentKey('G#')}
        onTransposeDown={() => setCurrentKey('F#')}
        onNextSong={() => {}}
        onPrevSong={() => {}}
        onToggleFullscreen={toggleFullscreen}
      />
    </div>
  );
};
