import React, { useState } from 'react';
import { Sidebar } from '../components/layout/Sidebar';
import { ArrowLeft, PlayCircle, GripVertical, Trash2 } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';

export const PlaylistViewPage: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  
  const [songs, setSongs] = useState([
    { id: '1', title: 'I Took A Pill In Ibiza', artist: 'Mike Posner', key: 'G' },
    { id: '2', title: 'Wonderwall', artist: 'Oasis', key: 'F#m' },
    { id: '3', title: 'Hotel California', artist: 'Eagles', key: 'Bm' },
  ]);

  const moveSong = (index: number, direction: 'up' | 'down') => {
    if (direction === 'up' && index === 0) return;
    if (direction === 'down' && index === songs.length - 1) return;
    
    const newSongs = [...songs];
    const swapIndex = direction === 'up' ? index - 1 : index + 1;
    [newSongs[index], newSongs[swapIndex]] = [newSongs[swapIndex], newSongs[index]];
    setSongs(newSongs);
  };

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-gray-900">
      <Sidebar />
      <main className="flex-1 flex flex-col overflow-hidden">
        <header className="h-20 flex items-center justify-between px-6 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 shrink-0">
          <div className="flex items-center gap-4">
            <button onClick={() => navigate('/playlists')} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full text-gray-600 dark:text-gray-300">
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white leading-tight">Sunday Worship</h1>
              <p className="text-sm text-gray-500 dark:text-gray-400">{songs.length} songs • Private</p>
            </div>
          </div>
          
          <button 
            onClick={() => navigate(`/theater/${id}`)}
            className="flex items-center gap-2 bg-[#10B981] hover:bg-[#059669] text-white px-5 py-2.5 rounded-lg font-bold transition-colors shadow-lg shadow-emerald-500/20"
            data-testid="start-theater-btn"
          >
            <PlayCircle className="w-6 h-6" />
            <span className="hidden sm:inline">Start Theater Mode</span>
          </button>
        </header>

        <div className="flex-1 overflow-y-auto p-6 max-w-4xl mx-auto w-full">
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden">
            {songs.map((song, index) => (
              <div 
                key={song.id} 
                className="flex items-center gap-4 p-4 border-b border-gray-100 dark:border-gray-700 last:border-0 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors group"
                data-testid={`playlist-item-${song.id}`}
              >
                <div className="flex flex-col gap-1 items-center justify-center opacity-50 hover:opacity-100 sm:hidden">
                  <button onClick={() => moveSong(index, 'up')} className="p-1" data-testid={`move-up-${song.id}`}>↑</button>
                  <button onClick={() => moveSong(index, 'down')} className="p-1" data-testid={`move-down-${song.id}`}>↓</button>
                </div>
                
                <div className="hidden sm:flex text-gray-400 cursor-grab active:cursor-grabbing hover:text-[#aa3bff]">
                  <GripVertical className="w-5 h-5" />
                </div>
                
                <div className="w-8 text-center text-gray-400 font-medium">{index + 1}</div>
                
                <div className="flex-1 min-w-0">
                  <h3 className="font-bold text-gray-900 dark:text-white truncate">{song.title}</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400 truncate">{song.artist}</p>
                </div>
                
                <div className="px-3 py-1 bg-gray-100 dark:bg-gray-700 rounded font-mono text-sm text-gray-800 dark:text-gray-200 font-bold">
                  {song.key}
                </div>
                
                <button className="p-2 text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity rounded-full hover:bg-red-50 dark:hover:bg-red-900/20">
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
};
