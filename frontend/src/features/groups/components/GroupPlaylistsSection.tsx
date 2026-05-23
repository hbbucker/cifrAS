import React, { useEffect, useState } from 'react';
import { getGroupPlaylists, unlinkPlaylist } from '../../../api/groups';
import { useNavigate } from 'react-router-dom';
import { Play, Trash2, Plus } from 'lucide-react';

interface GroupPlaylistsSectionProps {
  groupId: string;
  role: 'Admin' | 'Member';
  onLinkNew: () => void;
}

export const GroupPlaylistsSection: React.FC<GroupPlaylistsSectionProps> = ({ groupId, role, onLinkNew }) => {
  const [playlists, setPlaylists] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const fetchPlaylists = () => {
    setLoading(true);
    getGroupPlaylists(groupId)
      .then(data => {
        setPlaylists(data);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchPlaylists();
  }, [groupId]);

  const handleUnlink = async (playlistId: string) => {
    if (!window.confirm('Are you sure you want to remove this playlist from the group?')) return;
    try {
      await unlinkPlaylist(groupId, playlistId);
      fetchPlaylists();
    } catch (err) {
      console.error(err);
      alert('Failed to remove playlist');
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white">Shared Playlists</h2>
        {role === 'Admin' && (
          <button 
            onClick={onLinkNew}
            className="flex items-center gap-2 bg-[#aa3bff] hover:bg-[#902be6] text-white px-3 py-2 rounded-lg font-medium text-sm transition-colors"
          >
            <Plus className="w-4 h-4" /> Share Playlist
          </button>
        )}
      </div>

      {loading ? (
        <div className="text-center py-4 text-gray-500">Loading playlists...</div>
      ) : playlists.length === 0 ? (
        <div className="text-center py-8 text-gray-500">No playlists shared with this group yet.</div>
      ) : (
        <div className="flex flex-col gap-3">
          {playlists.map(playlist => (
            <div key={playlist.id} className="flex justify-between items-center p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
              <div 
                className="flex-1 cursor-pointer"
                onClick={() => navigate(`/playlists/${playlist.id}`)}
              >
                <h3 className="font-bold text-gray-900 dark:text-white mb-1">{playlist.name}</h3>
                <p className="text-sm text-gray-500">{playlist.songs?.length || 0} songs</p>
              </div>
              
              <div className="flex items-center gap-2">
                <button 
                  onClick={() => navigate(`/theater/${playlist.id}`)}
                  className="p-2 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                  title="Theater Mode"
                >
                  <Play className="w-5 h-5" />
                </button>
                {role === 'Admin' && (
                  <button 
                    onClick={() => handleUnlink(playlist.id.toString())}
                    className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                    title="Remove from Group"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
