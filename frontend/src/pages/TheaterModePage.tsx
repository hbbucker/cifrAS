import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { TheaterControls } from '../components/theater/TheaterControls';
import { useAutoScroll } from '../hooks/useAutoScroll';

import { getNextKey, transposeContent } from '../utils/chordTransposer';
import { stringifyLyrics } from '../utils/lyricsParser';

export const TheaterModePage: React.FC = () => {
  const navigate = useNavigate();
  const { playlistId, songId } = useParams();
  
  const { isScrolling, speed, play, pause, setSpeed, containerRef } = useAutoScroll(3);
  
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

  const [song, setSong] = useState({
    title: 'I Took A Pill In Ibiza',
    artist: 'Mike Posner',
    originalKey: 'G',
    content: Array(15).fill(mockContent).join('\n\n')
  });

  const [transposeSteps, setTransposeSteps] = useState(0);

  useEffect(() => {
    if (songId) {
      fetch(`/api/songs/${songId}`, {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      })
      .then(res => {
        if (!res.ok) throw new Error('Fetch failed');
        return res.json();
      })
      .then(data => {
        const key = data.originalKey || data.keySignature || 'C';
        setSong({
          title: data.title,
          artist: data.artist,
          originalKey: key,
          content: stringifyLyrics(data.lyrics)
        });
        setTransposeSteps(0);
      })
      .catch(console.error);
    }
  }, [songId]);

  const currentKey = transposeContent(song.originalKey, transposeSteps);
  const transposedContent = transposeContent(song.content, transposeSteps);

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

  return (
    <div className="h-screen w-full bg-black text-white overflow-hidden relative flex flex-col font-sans">
      {/* Header hidden when scrolling to maximize space */}
      <header className={`p-4 flex items-center justify-between absolute top-0 left-0 right-0 z-10 bg-gradient-to-b from-black/80 to-transparent transition-opacity duration-500 ${isScrolling ? 'opacity-0' : 'opacity-100'}`}>
        <div>
          <h1 className="text-2xl font-bold">{song.title}</h1>
          <p className="text-gray-400">{song.artist}</p>
        </div>
        <button 
          onClick={() => navigate(playlistId ? `/playlists/${playlistId}` : songId ? `/song/${songId}` : '/songs')}
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
        data-testid="theater-scroll-container"
      >
        <div className="max-w-4xl mx-auto">
          {/* Overriding ChordSheet styles for dark theater mode */}
          <div className="text-2xl md:text-4xl leading-relaxed whitespace-pre font-mono font-bold text-gray-300">
            {transposedContent.split('\n').map((line, i) => {
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
        onTransposeUp={() => setTransposeSteps(s => s + 1)}
        onTransposeDown={() => setTransposeSteps(s => s - 1)}
        onNextSong={() => {}}
        onPrevSong={() => {}}
        onToggleFullscreen={toggleFullscreen}
      />
    </div>
  );
};
