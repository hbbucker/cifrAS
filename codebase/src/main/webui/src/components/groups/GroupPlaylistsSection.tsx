import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { getGroupPlaylists, unlinkPlaylist } from '../../api/groups';
import { useNavigate } from 'react-router-dom';
import { Play, Trash2, Plus, ListMusic } from 'lucide-react';
import { useToast } from '../../context/ToastContext';
import { Button } from '../ui/Button';
import { EmptyState } from '../ui/EmptyState';
import { Spinner } from '../ui/Spinner';
import { ConfirmModal } from '../modals/ConfirmModal';

interface PlaylistData {
  id: string | number;
  name: string;
  songCount?: number;
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
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [playlistToRemove, setPlaylistToRemove] = useState<string | null>(null);

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
          toast(t('group.loadPlaylistsError'), 'error');
          setLoading(false);
        }
      });
    return () => { mounted = false; };
  }, [groupId, toast, t]);

  const fetchPlaylists = async () => {
    try {
      const data = await getGroupPlaylists(groupId);
      setPlaylists(data as PlaylistData[]);
    } catch {
      toast(t('group.loadPlaylistsError'), 'error');
    }
  };

  const handleUnlinkClick = (playlistId: string) => {
    setPlaylistToRemove(playlistId);
    setIsConfirmOpen(true);
  };

  const handleConfirmUnlink = async () => {
    if (!playlistToRemove) return;
    setIsConfirmOpen(false);
    try {
      await unlinkPlaylist(groupId, playlistToRemove);
      fetchPlaylists();
      toast(t('group.removePlaylistSuccess'), 'success');
    } catch {
      toast(t('group.removePlaylistError'), 'error');
    }
    setPlaylistToRemove(null);
  };

  const handleCancelUnlink = () => {
    setIsConfirmOpen(false);
    setPlaylistToRemove(null);
  };

  return (
    <div className="bg-bg-card rounded-lg border border-border-main p-4 sm:p-6 min-w-0">
      <div className="flex justify-between items-center mb-4 sm:mb-6 gap-2">
        <h2 className="text-lg sm:text-xl font-bold text-text-main truncate">{t('group.sharedPlaylists')}</h2>
        {role === 'Admin' && (
          <Button onClick={onLinkNew} size="sm" className="min-h-[40px] sm:min-h-[44px] px-3 sm:px-4 text-xs sm:text-sm shrink-0">
            <Plus className="w-4 h-4 mr-1" />
            <span>{t('group.sharePlaylist')}</span>
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
          description={t('group.noSharedPlaylistsDesc')} 
        />
      ) : (
        <div className="flex flex-col gap-2.5 sm:gap-3">
          {playlists.map(playlist => (
            <div key={playlist.id} className="flex justify-between items-center p-3 sm:p-4 border border-border-main rounded-lg hover:bg-bg-main/50 transition-colors gap-2 sm:gap-3">
              <div 
                className="min-w-0 flex-1 cursor-pointer"
                onClick={() => navigate(`/playlists/${playlist.id}`)}
              >
                <h3 className="font-bold text-text-main text-sm sm:text-base truncate mb-0.5">{playlist.name}</h3>
                <p className="text-xs text-text-mute">
                  {playlist.songCount ?? playlist.songs?.length ?? 0} {t('playlists.songsCount')}
                </p>
              </div>
              
              <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
                <button 
                  onClick={() => navigate(`/theater/${playlist.id}`)}
                  className="w-9 h-9 sm:w-10 sm:h-10 flex items-center justify-center text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-md transition-colors shrink-0"
                  title={t('sharedWithMe.playTheater')}
                  aria-label={t('sharedWithMe.playTheater')}
                >
                  <Play className="w-4 h-4 sm:w-5 sm:h-5" />
                </button>
                {role === 'Admin' && (
                  <button 
                    onClick={() => handleUnlinkClick(playlist.id.toString())}
                    className="w-9 h-9 sm:w-10 sm:h-10 flex items-center justify-center text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-md transition-colors shrink-0"
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
      <ConfirmModal
        isOpen={isConfirmOpen}
        title={t('group.remove')}
        message={t('group.confirmRemovePlaylist')}
        onConfirm={handleConfirmUnlink}
        onCancel={handleCancelUnlink}
      />
    </div>
  );
};
