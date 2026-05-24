import React, { useState, useEffect } from 'react';
import { X, ListMusic } from 'lucide-react';
import { useToast } from '../../context/ToastContext';
import { Button } from '../ui/Button';
import { Spinner } from '../ui/Spinner';
import { EmptyState } from '../ui/EmptyState';

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
  const [linking, setLinking] = useState<number | null>(null);
  const { toast } = useToast();

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
      .catch(() => {
        toast('Could not load your playlists', 'error');
        setLoading(false);
      });
  }, [toast]);

  const handleLink = async (playlistId: number) => {
    try {
      setLinking(playlistId);
      await onLink(playlistId.toString());
      toast('Playlist shared successfully', 'success');
      onClose();
    } catch {
      toast('Failed to link playlist', 'error');
    } finally {
      setLinking(null);
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
        
        {loading ? (
          <div className="flex justify-center py-8">
            <Spinner />
          </div>
        ) : playlists.length === 0 ? (
          <EmptyState 
            icon={ListMusic} 
            title="No personal playlists" 
            description="You don't have any playlists yet." 
          />
        ) : (
          <div className="flex flex-col gap-3 max-h-60 overflow-y-auto">
            {playlists.map(p => (
              <div key={p.id} className="flex justify-between items-center p-3 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700/50">
                <span className="font-medium text-gray-900 dark:text-white">{p.name}</span>
                <Button 
                  onClick={() => handleLink(p.id)}
                  isLoading={linking === p.id}
                  disabled={linking !== null}
                  size="sm"
                >
                  Share
                </Button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
