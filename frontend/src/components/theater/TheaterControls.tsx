import React from 'react';
import { Play, Pause, ChevronLeft, ChevronRight, Maximize } from 'lucide-react';
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
}

export const TheaterControls: React.FC<TheaterControlsProps> = ({
  isScrolling, speed, currentKey,
  onPlayPause, onSpeedChange, onTransposeUp, onTransposeDown,
  onNextSong, onPrevSong, onToggleFullscreen
}) => {
  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-gray-900/90 backdrop-blur-md text-white px-6 py-4 rounded-2xl shadow-2xl border border-gray-700/50 flex flex-col md:flex-row items-center gap-6 z-50 transition-all hover:bg-gray-900 flex-wrap" data-testid="theater-controls">
      
      {/* Song Navigation */}
      <div className="flex items-center gap-2">
        <button onClick={onPrevSong} className="p-2 hover:bg-gray-800 rounded-full transition-colors" disabled={!onPrevSong} data-testid="prev-song-btn">
          <ChevronLeft className="w-6 h-6" />
        </button>
        <button onClick={onNextSong} className="p-2 hover:bg-gray-800 rounded-full transition-colors" disabled={!onNextSong} data-testid="next-song-btn">
          <ChevronRight className="w-6 h-6" />
        </button>
      </div>

      <div className="w-px h-8 bg-gray-700 hidden md:block" />

      {/* Playback & Speed */}
      <div className="flex items-center gap-4">
        <button 
          onClick={onPlayPause}
          className="w-14 h-14 bg-[#aa3bff] hover:bg-[#902be6] flex items-center justify-center rounded-full transition-transform hover:scale-105 active:scale-95 shadow-lg shadow-[#aa3bff]/20"
          data-testid="play-pause-btn"
        >
          {isScrolling ? <Pause className="w-7 h-7 fill-white" /> : <Play className="w-7 h-7 fill-white ml-1" />}
        </button>

        <div className="flex flex-col gap-1 min-w-[120px]">
          <div className="flex justify-between text-xs text-gray-400 font-medium">
            <span>Slow</span>
            <span>Fast</span>
          </div>
          <input 
            type="range" min="1" max="10" step="1" 
            value={speed} onChange={(e) => onSpeedChange(Number(e.target.value))}
            className="w-full accent-[#aa3bff]"
            data-testid="speed-slider"
          />
        </div>
      </div>

      <div className="w-px h-8 bg-gray-700 hidden md:block" />

      {/* Transpose */}
      <div>
        <TransposePad currentKey={currentKey} onTransposeDown={onTransposeDown} onTransposeUp={onTransposeUp} />
      </div>

      <div className="w-px h-8 bg-gray-700 hidden md:block" />

      {/* Display Options */}
      <button onClick={onToggleFullscreen} className="p-3 hover:bg-gray-800 rounded-full transition-colors text-gray-400 hover:text-white" title="Fullscreen" data-testid="fullscreen-btn">
        <Maximize className="w-5 h-5" />
      </button>

    </div>
  );
};
