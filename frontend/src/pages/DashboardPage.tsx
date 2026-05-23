import React, { useState, useEffect } from 'react';
import { Sidebar } from '../components/layout/Sidebar';
import { BottomNav } from '../components/layout/BottomNav';
import { SearchBar } from '../components/search/SearchBar';
import { MusicCard } from '../components/cards/MusicCard';
import { SkeletonCard } from '../components/ui/SkeletonCard';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

export const DashboardPage: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [songs, setSongs] = useState<any[]>([]);

  useEffect(() => {
    // Mock fetching songs
    setTimeout(() => {
      setSongs([
        { id: '1', title: 'Wonderwall', artist: 'Oasis', keySignature: 'F#m', isFavorite: true, categories: ['Rock', '90s'] },
        { id: '2', title: 'Hotel California', artist: 'Eagles', keySignature: 'Bm', isFavorite: false, categories: ['Classic Rock'] },
      ]);
      setLoading(false);
    }, 1500);
  }, []);

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-gray-900">
      <Sidebar />
      
      <main className="flex-1 flex flex-col overflow-hidden">
        <header className="h-16 flex items-center justify-between px-6 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800">
          <h1 className="text-xl font-bold text-gray-900 dark:text-white hidden sm:block">Dashboard</h1>
          <div className="flex-1 sm:ml-8">
            <SearchBar />
          </div>
          <div className="ml-4 flex items-center gap-4">
            <div className="w-8 h-8 rounded-full bg-[#aa3bff] flex items-center justify-center text-white font-bold text-sm">
              {user?.name?.charAt(0) || 'U'}
            </div>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-6 pb-24 sm:pb-6">
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Welcome back, {user?.name?.split(' ')[0] || 'Musician'}! 👋</h2>
            <p className="text-gray-600 dark:text-gray-400">Here's your recent repertoire.</p>
          </div>

          <div className="mb-6 flex justify-between items-center">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white">Recently Added</h3>
            <button 
              onClick={() => navigate('/songs')} 
              className="text-sm font-medium text-[#aa3bff] hover:underline"
              data-testid="view-all-btn"
            >
              View all
            </button>
          </div>

          {loading ? (
            <SkeletonCard count={3} />
          ) : songs.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {songs.map((song) => (
                <MusicCard 
                  key={song.id} 
                  {...song} 
                  onToggleFavorite={() => {}}
                  onEdit={() => {}}
                  onShare={() => {}}
                  onDelete={() => {}}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-16 bg-white dark:bg-gray-800 rounded-lg border border-dashed border-gray-300 dark:border-gray-700">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No songs yet</h3>
              <p className="text-gray-500 dark:text-gray-400 mb-4">Start building your repertoire by adding your first song.</p>
              <button className="px-4 py-2 bg-[#aa3bff] hover:bg-[#902be6] text-white font-medium rounded transition-colors">
                Add New Song
              </button>
            </div>
          )}
        </div>
      </main>

      <BottomNav />
    </div>
  );
};
