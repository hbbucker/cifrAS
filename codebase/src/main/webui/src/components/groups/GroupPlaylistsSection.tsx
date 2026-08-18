import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { getGroupPlaylists, unlinkPlaylist } from '../../api/groups';
import { useNavigate } from 'react-router-dom';
import { Play, Trash2, Plus, ListMusic } from 'lucide-react';
import { useToast } from '../../context/ToastContext';
import { Button } from '../ui/Button';
import { EmptyState } from '../ui/EmptyState';
import { Spinner } from '../ui/Spinner';

interface PlaylistData {
  id: string | number;
  name: string;
  songs?: unknown[];
  [key: string]: unknown;
}

interface GroupPlaylistsSectionProps {
  groupId: string;
  role: 'Admin' | 'Member';
  onLinkNew: () => void;
}

export const GroupPlaylistsSection: React.FC<GroupPlaylistsSectionProps> = ({ groupId, role, onLinkNew }) => {
  const { t } = useTranslation();
  const [playlists, setPlaylists] = useState<PlaylistData[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    let mounted = true;
    getGroupPlaylists(groupId)
      .then(data => {
        if (mounted) {
          setPlaylists(data as PlaylistData[]);
          setLoading(false);
        }
      })
      .catch(() => {
        if (mounted) {
          toast('Failed to load shared playlists', 'error');
          setLoading(false);
        }
      });
    return () => { mounted = false; };
  }, [groupId, toast]);

  const fetchPlaylists = async () => {
    try {
      const data = await getGroupPlaylists(groupId);
      setPlaylists(data as PlaylistData[]);
    } catch {
      toast('Failed to load shared playlists', 'error');
    }
  };

  const handleUnlink = async (playlistId: string) => {
    if (!window.confirm(t('group.confirmRemovePlaylist'))) return;
    try {
      await unlinkPlaylist(groupId, playlistId);
      fetchPlaylists();
      toast('Playlist removed from group', 'success');
    } catch {
      toast('Failed to remove playlist', 'error');
    }
  };

  return (
    <div className="bg-bg-card rounded-2xl border border-border-main p-4 sm:p-6 min-w-0">
      <div className="flex justify-between items-center mb-4 sm:mb-6 gap-2">
        <h2 className="text-lg sm:text-xl font-bold text-text-main truncate">{t('group.sharedPlaylists')}</h2>
        {role === 'Admin' && (
          <Button onClick={onLinkNew} size="sm" className="min-h-[40px] sm:min-h-[44px] px-3 sm:px-4 text-xs sm:text-sm shrink-0">
            <Plus className="w-4 h-4 mr-1" />
            <span className="hidden sm:inline">{t('group.sharePlaylist')}</span>
            <span className="sm:hidden">{t('groups.create')}</span>
          </Button>
        )}
      </div>

      {loading && playlists.length === 0 ? (
        <div className="flex justify-center py-8">
          <Spinner />
        </div>
      ) : playlists.length === 0 ? (
        <EmptyState 
          icon={ListMusic} 
          title={t('group.noSharedPlaylists')} 
          description="No playlists shared with this group yet." 
        />
      ) : (
        <div className="flex flex-col gap-2.5 sm:gap-3">
          {playlists.map(playlist => (
            <div key={playlist.id} className="flex justify-between items-center p-3 sm:p-4 border border-border-main rounded-2xl hover:bg-bg-main/50 transition-colors gap-2 sm:gap-3">
              <div 
                className="min-w-0 flex-1 cursor-pointer"
                onClick={() => navigate(`/playlists/${playlist.id}`)}
              >
                <h3 className="font-bold text-text-main text-sm sm:text-base truncate mb-0.5">{playlist.name}</h3>
                <p className="text-xs text-text-mute">{playlist.songs?.length || 0} songs</p>
              </div>
              
              <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
                <button 
                  onClick={() => navigate(`/theater/${playlist.id}`)}
                  className="w-9 h-9 sm:w-10 sm:h-10 flex items-center justify-center text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-xl transition-colors shrink-0"
                  title="Theater Mode"
                  aria-label="Theater Mode"
                >
                  <Play className="w-4 h-4 sm:w-5 sm:h-5" />
                </button>
                {role === 'Admin' && (
                  <button 
                    onClick={() => handleUnlink(playlist.id.toString())}
                    className="w-9 h-9 sm:w-10 sm:h-10 flex items-center justify-center text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl transition-colors shrink-0"
                    title={t('group.remove')}
                    aria-label={t('group.remove')}
                  >
                    <Trash2 className="w-4 h-4 sm:w-5 sm:h-5" />
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
