import React from 'react';
import { Play, Pause, ChevronLeft, ChevronRight, Maximize, X } from 'lucide-react';
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
}

export const TheaterControls: React.FC<TheaterControlsProps> = ({
  isScrolling, speed, currentKey,
  onPlayPause, onSpeedChange, onTransposeUp, onTransposeDown,
  onNextSong, onPrevSong, onToggleFullscreen, onExit,
  onFontSizeIncrease, onFontSizeDecrease
}) => {
  return (
    <div className="fixed bottom-24 md:bottom-6 left-1/2 -translate-x-1/2 bg-gray-900/95 backdrop-blur-xl text-white px-4 md:px-6 py-4 rounded-3xl shadow-2xl border border-gray-700/50 flex flex-col md:flex-row items-center gap-4 md:gap-6 z-40 transition-all hover:bg-gray-900 w-[92%] md:w-auto" data-testid="theater-controls">
      
      {/* --- First Row (Mobile) / Left Group (Desktop) --- */}
      <div className="flex flex-row items-center justify-between w-full md:w-auto gap-2 md:gap-6">
        {/* Song Navigation */}
        <div className="flex items-center gap-1 md:gap-2 shrink-0">
          <button onClick={onPrevSong} className="p-2 hover:bg-gray-800 rounded-full transition-colors" disabled={!onPrevSong} data-testid="prev-song-btn">
            <ChevronLeft className="w-6 h-6" />
          </button>
          <button onClick={onNextSong} className="p-2 hover:bg-gray-800 rounded-full transition-colors" disabled={!onNextSong} data-testid="next-song-btn">
            <ChevronRight className="w-6 h-6" />
          </button>
        </div>

        <div className="w-px h-8 bg-gray-700 hidden md:block shrink-0" />

        {/* Playback & Speed */}
        <div className="flex items-center gap-3 md:gap-4 flex-1 justify-end md:justify-start">
          <div className="flex flex-col gap-1 w-24 md:w-32">
            <div className="flex justify-between text-[10px] md:text-xs text-gray-400 font-medium px-1">
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

          <button 
            onClick={onPlayPause}
            className="w-12 h-12 md:w-14 md:h-14 bg-[#aa3bff] hover:bg-[#902be6] flex items-center justify-center rounded-full transition-transform hover:scale-105 active:scale-95 shadow-lg shadow-[#aa3bff]/20 shrink-0"
            data-testid="play-pause-btn"
          >
            {isScrolling ? <Pause className="w-6 h-6 md:w-7 md:h-7 fill-white" /> : <Play className="w-6 h-6 md:w-7 md:h-7 fill-white ml-1" />}
          </button>
        </div>
      </div>

      <div className="w-full h-px bg-gray-700/50 block md:hidden" />
      <div className="w-px h-8 bg-gray-700 hidden md:block shrink-0" />

      {/* --- Second Row (Mobile) / Right Group (Desktop) --- */}
      <div className="flex flex-row items-center justify-between w-full md:w-auto gap-2 md:gap-6 overflow-x-auto no-scrollbar py-1">
        
        {/* Transpose */}
        <div className="shrink-0">
          <TransposePad currentKey={currentKey} onTransposeDown={onTransposeDown} onTransposeUp={onTransposeUp} />
        </div>

        <div className="w-px h-6 bg-gray-700 shrink-0" />
        
        {/* Font Size */}
        <div className="flex items-center gap-0.5 shrink-0">
          <button onClick={onFontSizeDecrease} className="p-2 hover:bg-gray-800 rounded-lg transition-colors text-gray-300 hover:text-white font-bold" title="Decrease Font">
            A-
          </button>
          <button onClick={onFontSizeIncrease} className="p-2 hover:bg-gray-800 rounded-lg transition-colors text-gray-300 hover:text-white font-bold text-lg" title="Increase Font">
            A+
          </button>
        </div>

        <div className="w-px h-6 bg-gray-700 shrink-0" />

        {/* Display Options */}
        <div className="flex items-center gap-1 shrink-0">
          <button onClick={onToggleFullscreen} className="p-2.5 md:p-3 hover:bg-gray-800 rounded-full transition-colors text-gray-400 hover:text-white" title="Fullscreen" data-testid="fullscreen-btn">
            <Maximize className="w-5 h-5" />
          </button>

          <button onClick={onExit} className="p-2.5 md:p-3 hover:bg-red-500/20 rounded-full transition-colors text-gray-400 hover:text-red-400" title="Exit Theater" data-testid="exit-theater-btn">
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

    </div>
  );
};
