import React, { useState } from 'react';
import { Sidebar } from '../components/layout/Sidebar';
import { BottomNav } from '../components/layout/BottomNav';
import { MusicCard } from '../components/cards/MusicCard';
import { Filter, Plus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const SongsListPage: React.FC = () => {
  const navigate = useNavigate();
  // Mock data for display
  const [songs] = useState([
    { id: '1', title: 'Wonderwall', artist: 'Oasis', keySignature: 'F#m', isFavorite: true, categories: ['Rock', '90s'] },
    { id: '2', title: 'Hotel California', artist: 'Eagles', keySignature: 'Bm', isFavorite: false, categories: ['Classic Rock'] },
    { id: '3', title: 'Let It Be', artist: 'The Beatles', keySignature: 'C', isFavorite: true, categories: ['Pop', '60s'] },
  ]);

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-gray-900">
      <Sidebar />
      <main className="flex-1 flex flex-col overflow-hidden">
        <header className="h-16 flex items-center justify-between px-6 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800">
          <h1 className="text-xl font-bold text-gray-900 dark:text-white">My Repertoire</h1>
          <button 
            onClick={() => navigate('/songs/new')}
            className="flex items-center gap-2 bg-[#aa3bff] hover:bg-[#902be6] text-white px-4 py-2 rounded-lg font-medium transition-colors"
            data-testid="add-song-btn"
          >
            <Plus className="w-5 h-5" />
            <span className="hidden sm:inline">Add Song</span>
          </button>
        </header>

        <div className="flex-1 overflow-y-auto p-6 pb-24 sm:pb-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-4">
            <div className="relative max-w-sm w-full">
              <input 
                type="text" 
                placeholder="Filter songs..." 
                className="w-full pl-4 pr-10 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-[#aa3bff] outline-none dark:text-white"
              />
              <Filter className="absolute right-3 top-2.5 w-5 h-5 text-gray-400" />
            </div>
            <div className="flex gap-2">
              <span className="text-sm text-gray-500 dark:text-gray-400">{songs.length} songs</span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {songs.map(song => (
              <div key={song.id} onClick={() => navigate(`/song/${song.id}`)} className="cursor-pointer" data-testid={`view-song-${song.id}`}>
                <MusicCard 
                  {...song} 
                  onToggleFavorite={() => {}}
                  onEdit={(id) => navigate(`/songs/edit/${id}`)}
                  onShare={() => {}}
                  onDelete={() => {}}
                />
              </div>
            ))}
          </div>
        </div>
      </main>
      <BottomNav />
    </div>
  );
};
