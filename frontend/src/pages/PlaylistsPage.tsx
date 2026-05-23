import React, { useState } from 'react';
import { Sidebar } from '../components/layout/Sidebar';
import { BottomNav } from '../components/layout/BottomNav';
import { Plus, ListMusic, Users } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const PlaylistsPage: React.FC = () => {
  const navigate = useNavigate();
  const [showModal, setShowModal] = useState(false);
  const [newPlaylistName, setNewPlaylistName] = useState('');

  const mockPlaylists = [
    { id: '1', name: 'Sunday Worship', songCount: 5, type: 'Private' },
    { id: '2', name: 'Acoustic Covers', songCount: 12, type: 'Collab' },
  ];

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-gray-900">
      <Sidebar />
      <main className="flex-1 flex flex-col overflow-hidden">
        <header className="h-16 flex items-center justify-between px-6 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800">
          <h1 className="text-xl font-bold text-gray-900 dark:text-white">Playlists</h1>
          <button 
            onClick={() => setShowModal(true)}
            className="flex items-center gap-2 bg-[#aa3bff] hover:bg-[#902be6] text-white px-4 py-2 rounded-lg font-medium transition-colors"
            data-testid="create-playlist-btn"
          >
            <Plus className="w-5 h-5" />
            <span className="hidden sm:inline">New Playlist</span>
          </button>
        </header>

        <div className="flex-1 overflow-y-auto p-6 pb-24 sm:pb-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {mockPlaylists.map(pl => (
              <div 
                key={pl.id} 
                onClick={() => navigate(`/playlists/${pl.id}`)}
                className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5 cursor-pointer hover:shadow-lg hover:border-[#aa3bff]/50 transition-all group"
                data-testid={`playlist-card-${pl.id}`}
              >
                <div className="w-12 h-12 bg-[#aa3bff]/10 rounded-lg flex items-center justify-center mb-4 group-hover:bg-[#aa3bff]/20 transition-colors">
                  <ListMusic className="w-6 h-6 text-[#aa3bff]" />
                </div>
                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-1">{pl.name}</h3>
                <div className="flex items-center justify-between">
                  <p className="text-sm text-gray-500 dark:text-gray-400">{pl.songCount} songs</p>
                  <span className={`text-xs font-bold px-2 py-1 rounded flex items-center gap-1 ${pl.type === 'Collab' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' : 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300'}`}>
                    {pl.type === 'Collab' && <Users className="w-3 h-3" />}
                    {pl.type}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>

      {/* Create Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl max-w-md w-full p-6 shadow-2xl">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Create New Playlist</h2>
            <input 
              type="text" 
              value={newPlaylistName}
              onChange={(e) => setNewPlaylistName(e.target.value)}
              placeholder="e.g. Wedding Gig"
              className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg mb-6 text-gray-900 dark:text-white focus:ring-2 focus:ring-[#aa3bff] outline-none"
              data-testid="playlist-name-input"
            />
            <div className="flex justify-end gap-3">
              <button onClick={() => setShowModal(false)} className="px-4 py-2 font-medium text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors">Cancel</button>
              <button 
                onClick={() => { setShowModal(false); navigate('/playlists/1'); }} 
                className="px-4 py-2 font-medium bg-[#aa3bff] hover:bg-[#902be6] text-white rounded-lg transition-colors"
                data-testid="save-playlist-btn"
              >
                Create
              </button>
            </div>
          </div>
        </div>
      )}

      <BottomNav />
    </div>
  );
};
