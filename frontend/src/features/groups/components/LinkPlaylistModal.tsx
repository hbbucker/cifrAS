import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';

interface Playlist {
  id: number;
  name: string;
}

interface LinkPlaylistModalProps {
  onClose: () => void;
  onLink: (playlistId: string) => Promise<void>;
}

export const LinkPlaylistModal: React.FC<LinkPlaylistModalProps> = ({ onClose, onLink }) => {
  const [playlists, setPlaylists] = useState<Playlist[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [linking, setLinking] = useState(false);

  useEffect(() => {
    fetch('/api/playlists', {
      headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
    })
      .then(res => {
        if (!res.ok) throw new Error('Failed to fetch playlists');
        return res.json();
      })
      .then(data => {
        setPlaylists(data);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setError('Could not load your playlists.');
        setLoading(false);
      });
  }, []);

  const handleLink = async (playlistId: number) => {
    try {
      setLinking(true);
      setError('');
      await onLink(playlistId.toString());
      onClose();
    } catch (err) {
      console.error(err);
      setError('Failed to link playlist.');
    } finally {
      setLinking(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-gray-800 rounded-xl max-w-md w-full p-6 shadow-2xl relative">
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
        >
          <X className="w-6 h-6" />
        </button>
        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Share a Playlist</h2>
        <p className="text-sm text-gray-500 mb-6">Select one of your personal playlists to share with this group. Members will be able to view and play it.</p>
        
        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg">
            {error}
          </div>
        )}

        {loading ? (
          <div className="text-center py-4 text-gray-500">Loading your playlists...</div>
        ) : playlists.length === 0 ? (
          <div className="text-center py-4 text-gray-500">You don't have any playlists yet.</div>
        ) : (
          <div className="flex flex-col gap-3 max-h-60 overflow-y-auto">
            {playlists.map(p => (
              <div key={p.id} className="flex justify-between items-center p-3 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700/50">
                <span className="font-medium text-gray-900 dark:text-white">{p.name}</span>
                <button 
                  onClick={() => handleLink(p.id)}
                  disabled={linking}
                  className="px-3 py-1 bg-[#aa3bff] hover:bg-[#902be6] text-white text-sm font-medium rounded-lg disabled:opacity-50"
                >
                  Share
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
