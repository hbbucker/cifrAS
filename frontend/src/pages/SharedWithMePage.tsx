import React from 'react';
import { Sidebar } from '../components/layout/Sidebar';
import { MusicCard } from '../components/cards/MusicCard';

export const SharedWithMePage: React.FC = () => {
  const mockSharedSongs = [
    { id: '101', title: 'Everlong', artist: 'Foo Fighters', keySignature: 'D', isFavorite: false, categories: ['Rock'], sender: 'Dave' },
  ];

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-gray-900">
      <Sidebar />
      <main className="flex-1 flex flex-col overflow-hidden">
        <header className="h-16 flex items-center px-6 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800">
          <h1 className="text-xl font-bold text-gray-900 dark:text-white">Shared with Me</h1>
        </header>

        <div className="flex-1 overflow-y-auto p-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {mockSharedSongs.map(song => (
              <div key={song.id} className="relative">
                <MusicCard 
                  {...song} 
                  onToggleFavorite={() => {}}
                  onEdit={() => {}}
                  onShare={() => {}}
                  onDelete={() => {}}
                />
                <div className="absolute top-0 right-0 -mt-2 -mr-2 bg-blue-500 text-white text-[10px] font-bold px-2 py-1 rounded-full shadow-md z-10">
                  From {song.sender}
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
};
